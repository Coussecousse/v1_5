<?php

namespace App\Controller;

use App\Entity\Token;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Security\Csrf\CsrfTokenManagerInterface;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;
use Symfony\Component\Security\Http\Event\LogoutEvent;

class SignInController extends AbstractController
{
    private $eventDispatcher;
    private $requestStack;
    private $tokenStorage;
    
    public function __construct(EventDispatcherInterface $eventDispatcher, RequestStack $requestStack, TokenStorageInterface $tokenStorage)
    {
        $this->eventDispatcher = $eventDispatcher;
        $this->requestStack = $requestStack;
        $this->tokenStorage = $tokenStorage;
    }

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
        
        $response->headers->setCookie(
            new Cookie('auth_token', $token->getToken(), $token->getExpiresAt(), '/', null, true, true)
        );
        
        return $response;
    }

    #[Route('/api/logout', name: 'app_logout', methods: ['GET'])]
    public function logout(
        EntityManagerInterface $em, 
        Request $request, 
        Security $security): JsonResponse
    {
        // Custom logout logic
        $user = $this->getUser();
        if ($user) {
            $token = $em->getRepository(Token::class)->findOneBy(['user' => $user]);
            if ($token) {
                // Remove the token from the database
                $em->remove($token);
                $em->flush();
            }
        }
        
        $response = new JsonResponse(['success' => true], JsonResponse::HTTP_OK);
        $response->headers->clearCookie('auth_token', '/', null);
        $response->headers->clearCookie(session_name(), '/', null);

        // Clear the session and session cookie
        $request->getSession()->invalidate();
        $security->logout(false);
    
        return $response;
    }
    
    

    #[Route('/api/sign-in/csrf-token', name: 'api_csrf_token_sign_in', methods: ['GET'])]
    public function getCsrfToken(CsrfTokenManagerInterface $csrfTokenManager): JsonResponse
    {
        $csrfToken = $csrfTokenManager->getToken('sign_in_form')->getValue();
        return new JsonResponse(['csrfToken' => $csrfToken]);
    }
}
