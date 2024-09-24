<?php

namespace App\Controller;

use App\Entity\Token;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Csrf\CsrfTokenManagerInterface;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;

class SignInController extends AbstractController
{
    #[Route('/api/sign-in', name: 'app_sign_in', methods: ['POST'])]
    public function signIn(
        Request $request,
        AuthenticationUtils $authenticationUtils,
        Security $security,
        UserRepository $userRepository,
        EntityManagerInterface $em, 
        UserPasswordHasherInterface $passwordEncoder
    ): JsonResponse {
        // Handle request
        $data = $request->request->all();
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';
        $rememberMe = $data['remember_me'] ?? false;

        $error = $authenticationUtils->getLastAuthenticationError();

        if ($error) {
            return new JsonResponse(['error' => 'Invalid credentials.'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        // Fetch the user
        $user = $userRepository->findOneBy(['email' => $email]);

        if (!$user) {
            return new JsonResponse(['error' => 'Invalid credentials.'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        // Validate the password
        if (!$passwordEncoder->isPasswordValid($user, $password)) {
            return new JsonResponse(['error' => 'Invalid credentials.'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        // Log the user 
        $security->login($user);
        
        if ($rememberMe) {
            // Look if a token already exist
            $existingToken = $em->getRepository(Token::class)->findOneBy(['user' => $user]);
            if ($existingToken) {
                $em->remove($existingToken);
                $em->flush();
            }

            // Create a new token for the user
            $token = new Token();
            $token->setUser($user);
            $user->setToken($token);
            $em->persist($token);
            $em->flush();
        }
        
        // Set the token in a cookie
        $response = new JsonResponse([
            'message' => 'User signed in successfully!',
        ], JsonResponse::HTTP_OK);

        $response->headers->setCookie(new Cookie('auth_token', $token->getToken(), $token->getExpiresAt()));

        return $response;
    }

    #[Route('/api/logout', name: 'app_logout')]
    public function logout(EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        $token = $em->getRepository(Token::class)->findOneBy(['user' => $user]);
        if ($token) {
            $em->remove($token);
            $em->flush();
        }

        // Symfony handles logout automatically
        throw new \LogicException('This method can be blank - it will be intercepted by the logout key on your firewall.');
    }

    #[Route('/api/sign-in/csrf-token', name: 'api_csrf_token_sign_in', methods: ['GET'])]
    public function getCsrfToken(CsrfTokenManagerInterface $csrfTokenManager): JsonResponse
    {
        $csrfToken = $csrfTokenManager->getToken('sign_in_form')->getValue();
        return new JsonResponse(['csrfToken' => $csrfToken]);
    }
}
