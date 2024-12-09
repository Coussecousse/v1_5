<?php

namespace App\Tests\Controller;

use App\Entity\Token;
use App\Repository\TokenRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\BrowserKit\Cookie;

class AuthControllerTest extends WebTestCase
{
    private $client;
    private $em;
    private $userRepository;
    private $tokenRepository;

    protected function setUp(): void
    {
        $this->client = static::createClient();
        $this->em = static::getContainer()->get(EntityManagerInterface::class);
        $this->userRepository = static::getContainer()->get(UserRepository::class);
        $this->tokenRepository = static::getContainer()->get(TokenRepository::class);
    }

    public function testCheckAuthWithValidToken(): void
    {
        // Get a test user
        $user = $this->userRepository->findOneBy(['email' => 'test_user@example.com']);

        // Check for an existing valid token
        $validToken = $this->tokenRepository->findOneBy([
            'user' => $user
        ]);

        // If no valid token exists, create one
        if (!$validToken) {
            // Remove any existing tokens for this user
            $existingTokens = $this->tokenRepository->findBy(['user' => $user]);
            foreach ($existingTokens as $existingToken) {
                $this->em->remove($existingToken);
            }
            $this->em->flush();

            // Create a new valid token
            $validTokenValue = bin2hex(random_bytes(16));
            $validToken = new Token();
            $validToken->setToken($validTokenValue);
            $validToken->setUser($user);
            $validToken->setExpiresAt((new \DateTimeImmutable())->modify('+1 day'));
            $this->em->persist($validToken);
            $this->em->flush();
        } else {
            $validTokenValue = $validToken->getToken();
        }

        // Set the auth_token cookie with the valid token
        $this->client->getCookieJar()->set(new Cookie('auth_token', $validTokenValue));

        $this->client->request('GET', '/api/check-auth');
        $this->assertResponseStatusCodeSame(200);

        $responseContent = $this->client->getResponse()->getContent();
        $responseData = json_decode($responseContent, true);

        $this->assertTrue($responseData['isAuthenticated']);
    }

    public function testCheckAuthWithExpiredToken(): void
    {
        // Get a test user
        $user = $this->userRepository->findOneBy(['email' => 'test_user2@example.com']);

        // Check for an existing expired token
        $expiredToken = $this->tokenRepository->findOneBy([
            'user' => $user        
        ]);

        // If no expired token exists, create one
        if (!$expiredToken) {
            // Remove any existing tokens for this user
            $existingTokens = $this->tokenRepository->findBy(['user' => $user]);
            foreach ($existingTokens as $existingToken) {
                $this->em->remove($existingToken);
            }
            $this->em->flush();

            // Create a new expired token
            $expiredTokenValue = bin2hex(random_bytes(16));
            $expiredToken = new Token();
            $expiredToken->setToken($expiredTokenValue);
            $expiredToken->setUser($user);
            $expiredToken->setExpiresAt((new \DateTimeImmutable())->modify('-1 day'));
            $this->em->persist($expiredToken);
            $this->em->flush();
        } else {
            $expiredTokenValue = $expiredToken->getToken();
        }

        // Set the auth_token cookie with the expired token
        $this->client->getCookieJar()->set(new Cookie('auth_token', $expiredTokenValue));

        $this->client->request('GET', '/api/check-auth');
        $this->assertResponseStatusCodeSame(200);

        $responseContent = $this->client->getResponse()->getContent();
        $responseData = json_decode($responseContent, true);

        // With an expired token, we expect isAuthenticated to be false
        $this->assertFalse($responseData['isAuthenticated']);
    }
}