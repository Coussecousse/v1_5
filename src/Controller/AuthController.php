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
    public function checkAuth(Request $request, 
        Security $security,
        EntityManagerInterface $em): JsonResponse
    {
        if ($security->getUser()) {
            return new JsonResponse(['isAuthenticated' => true], 200);
        }

        // Get the token from the cookie
        $token = $request->cookies->get('auth_token');
        if ($token) {
            $userToken = $em->getRepository(className: Token::class)->findOneBy(['token' => $token]);
            if ($userToken) {
                if ($userToken->getExpiresAt() < new \DateTime()) {
                    $em->remove($userToken);
                    $em->flush();

                    return new JsonResponse(['isAuthenticated' => false], 200);
                }

                $user = $userToken->getUser();
                $security->login($user);

                return new JsonResponse(['isAuthenticated' => true], 200);
                
            } else {
                return new JsonResponse(['isAuthenticated' => false], 200);
            }
        }
    
        return new JsonResponse(['isAuthenticated' => false], 200);
    }
}
