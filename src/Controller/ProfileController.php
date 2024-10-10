<?php

namespace App\Controller;

use App\Entity\Pic;
use App\Entity\User;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use App\Repository\UserRepository;
use ChangeProfileInformationsFormType;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Security\Csrf\CsrfTokenManagerInterface;


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

    #[Route('/change-informations', name: '_change_informations_api')]
    public function changeInformations(Request $request,
        UserPasswordHasherInterface $passwordEncoder,
        EntityManagerInterface $en): JsonResponse
    {
        $form = $this->createForm(ChangeProfileInformationsFormType::class);
        $data = array_merge($request->request->all(), $request->files->all());
        $form->submit($data);
        $errors = [];

        if ($form->isSubmitted() && $form->isValid()) {
            $user = $this->getUser();
            $userEntity = $en->getRepository(User::class)->findOneBy(['email' => $user->getUserIdentifier()]);

            // Validate the password
            $password = $form->get('password')->getData();
            if (!$passwordEncoder->isPasswordValid($userEntity, $password)) {
                $errors['password'] = 'Mauvais mot de passe.';
                return new JsonResponse(['error' => 'Invalid credentials.', 'errors' => $errors], Response::HTTP_UNAUTHORIZED);
            }

            $username = $form->get('username')->getData();
            $email = $form->get('email')->getData();
            $userEntity->setUsername($username)
                       ->setEmail($email);

            $profilePic = $form->get('profile_pic')->getData();
            if ($profilePic) {
                $oldProfilePic = $userEntity->getPic();
                $filesystem = new Filesystem();
                
                $profilePicsDir = $this->getParameter('profile_pics_directory');
                
                if ($oldProfilePic && $filesystem->exists($profilePicsDir . '/' . $oldProfilePic->getPath())) {
                    $filesystem->remove($profilePicsDir . '/' . $oldProfilePic->getPath());
                }
            
                $newFilename = uniqid() . '.' . $profilePic->guessExtension();
                $profilePic->move($profilePicsDir, $newFilename);
            
                $newProfilePic = $oldProfilePic ?: new Pic();
                $newProfilePic->setPath($newFilename)->setUser($userEntity);
            
                $en->persist($newProfilePic);
                $userEntity->setProfilPic($newProfilePic);
            
                $en->persist($userEntity);
                $en->flush();
            }
            
            
            return new JsonResponse(['status' => 'Informations updated successfully!'], status: Response::HTTP_OK);
        }

        
        foreach ($form->getErrors(true) as $error) {
            $errors[$error->getOrigin()->getName()] = $error->getMessage();
        }

        return new JsonResponse(['errors' => $errors], Response::HTTP_BAD_REQUEST);
    }

    #[Route('/change-informations/csrf', name: '_change_informations_csrf_api')] 
    public function changeInformationsCsrf(CsrfTokenManagerInterface $csrfTokenManager): JsonResponse
    {
        $csrfToken = $csrfTokenManager->getToken('change_profile_informations_form')->getValue();
        return new JsonResponse(['csrfToken' => $csrfToken]);
    }
}