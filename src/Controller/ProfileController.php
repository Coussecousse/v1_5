<?php

namespace App\Controller;

use App\Entity\Pic;
use App\Entity\User;
use App\Repository\PicRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use App\Repository\UserRepository;
use App\Service\ImageOptimizer;
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
    private ImageOptimizer $imageOptimizer;

    public function __construct(ImageOptimizer $imageOptimizer)
    {
        $this->imageOptimizer = $imageOptimizer;
    }

    #[Route('/', name: '_index')]
    public function index(UserRepository $userRepository, PicRepository $picRepository): JsonResponse
    {
        $user = $this->getUser();

        $userEntity = $userRepository->findOneBy(['email' => $user->getUserIdentifier()]);
        $userPic = $picRepository->getProfilePic($userEntity);

        return new JsonResponse([
            'user' => [
                'username' => $userEntity->getUsername(),
                'email' => $userEntity->getEmail(),
                'profile_pic' => $userPic ?
                    $userPic->getPath()
                    : null,
                'uid' => $userEntity->getUid(),
            ],
        ]);
    }

    #[Route('/change-informations', name: '_change_informations_api')]
    public function changeInformations(Request $request,
        UserPasswordHasherInterface $passwordEncoder,
        EntityManagerInterface $en,
        PicRepository $picRepository): JsonResponse
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
                $oldProfilePic = $picRepository->getProfilePic($userEntity);
                $filesystem = new Filesystem();
                
                $profilePicsDir = $this->getParameter('profile_pics_directory');
                if ($oldProfilePic) {
                    dump($oldProfilePic);
                    $profilePicName = '/' . $oldProfilePic->getPath();
                    $folders = ['small', 'medium', 'large', 'extraLarge'];
                    foreach($folders as $f) {
                        $pic = $profilePicsDir . '/' . $f . $profilePicName;
                        if (!$filesystem->exists($pic)) {
                            $filesystem->remove($pic);
                        }
                    }
                }
            
                $newFilename = $this->imageOptimizer->processAndResizeFile($profilePic, $profilePicsDir);
            
                $newProfilePic = $oldProfilePic ?: new Pic();
                $newProfilePic->setPath($newFilename)->setUser($userEntity);
            
                $en->persist($newProfilePic);
                $userEntity->addPic($newProfilePic);
            
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