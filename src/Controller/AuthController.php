<?php

namespace App\Controller;

use App\Entity\Token;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class AuthController extends AbstractController
{
    #[Route('/api/check-auth', name: 'api_check_auth')]
    public function checkAuth(
        Request $request,
        Security $security,
        EntityManagerInterface $em
    ): JsonResponse {
        // Check if the user is already authenticated in the session
        $user = $security->getUser();
        if ($user) {
            return new JsonResponse([
                'isAuthenticated' => true,
                'user' => [
                    'email' => $user->getUserIdentifier(),
                    'roles' => $user->getRoles(),
                ],
            ], 200);
        }
    
        // Get the token from the auth cookie
        $tokenValue = $request->cookies->get('auth_token');
        if ($tokenValue) {
            $token = $em->getRepository(Token::class)->findOneBy(['token' => $tokenValue]);
            if ($token) {
                // Check if the token is expired
                if ($token->getExpiresAt() < new \DateTimeImmutable()) {
                    $em->remove($token);
                    $em->flush();
                    return new JsonResponse(['isAuthenticated' => false], 200);
                }
    
                // Authenticate the user (if needed for session-based systems)
                $user = $token->getUser();
                // Use Security::login if your project relies on sessions
                $security->login($user);
                
                return new JsonResponse([
                    'isAuthenticated' => true,
                    'user' => [
                        'username' => $user->getUsername(),
                        'roles' => $user->getRoles(),
                    ],
                ], 200);
            }
        }
    
        return new JsonResponse(['isAuthenticated' => false], 200);
    }
}    
