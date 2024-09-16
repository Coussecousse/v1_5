<?php

namespace App\Controller;   

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use App\Entity\User;
use App\Repository\UserRepository;
use Symfony\Bundle\SecurityBundle\Security;

#[Route('api/profile', name: 'app_profile')]
class ProfileController extends AbstractController
{
    #[Route('/', name: '_index')]
    public function index(UserRepository $userRepository): JsonResponse
    {
        $user = $this->getUser();

        $userEntity = $userRepository->findOneBy(['email' => $user->getUserIdentifier()]);

        return new JsonResponse([
            'user' => [
                'username' => $userEntity->getUsername(),
                'email' => $userEntity->getEmail(),
                'profile_pic' => $userEntity->getProfilPic() ?
                    $userEntity->getProfilPic()->getPath()
                    : null,
            ],
        ]);
    }
}