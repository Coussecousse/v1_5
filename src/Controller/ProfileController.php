<?php

namespace App\Controller;

use App\Entity\Pic;
use App\Entity\User;
use App\Repository\ActivityRepository;
use App\Repository\DescriptionRepository;
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

    private function getUserProfileData(
        $userEntity,
        PicRepository $picRepository,
        ActivityRepository $activityRepository,
        DescriptionRepository $descriptionRepository
    ) {
        // Get the user's profile picture
        $userPic = $picRepository->getProfilePic($userEntity);

        // Fetch the user's roadtrips
        $roadtrips = array_map(
            fn($roadtrip) => [
                'uid' => $roadtrip->getUid(),
                'title' => $roadtrip->getTitle(),
                'description' => $roadtrip->getDescription(),
                'budget' => $roadtrip->getBudget(),
                'days' => $roadtrip->getDays(),
                'roads' => $roadtrip->getRoads(),
                'user' => ['uid' => $roadtrip->getUser()->getUid()],
            ],
            $userEntity->getRoadtrips()->toArray()
        );

        // Fetch the user's favorite roadtrips
        $favoriteRoadtrips = array_map(
            fn($roadtrip) => [
                'uid' => $roadtrip->getUid(),
                'title' => $roadtrip->getTitle(),
                'description' => $roadtrip->getDescription(),
                'budget' => $roadtrip->getBudget(),
                'days' => $roadtrip->getDays(),
                'roads' => $roadtrip->getRoads(),
                'user' => ['uid' => $roadtrip->getUser()->getUid()],
            ],
            $userEntity->getFavoriteRoadtrips()->toArray()
        );

        // Fetch the user's activities
        $activities = array_map(
            fn($activity) => [
                'uid' => $activity->getUid(),
                'display_name' => $activity->getDisplayName(),
                'description' => $descriptionRepository->findOneBy(['activity' => $activity, 'user' => $userEntity])->getDescription(),
                'type' => $activity->getType()->getName(),
                'country' => $activity->getCountry()->getName(),
                'lat' => $activity->getLat(),
                'lng' => $activity->getLng(),
                'pics' => array_map(
                    fn($pic) => [$pic->getPath()],
                    $picRepository->findBy(['user' => $userEntity, 'activity' => $activity])
                ),
                'users' => array_map(
                    fn($user) => ['uid' => $user->getUid()],
                    $activity->getUsers()->toArray()
                ),
            ],
            $userEntity->getActivities()->toArray()
        );

        // Fetch the user's favorite activities
        $favoriteActivities = array_map(
            fn($activity) => [
                'uid' => $activity->getUid(),
                'display_name' => $activity->getDisplayName(),
                'description' => $activityRepository->getFirstDescription($activity),
                'type' => $activity->getType()->getName(),
                'country' => $activity->getCountry()->getName(),
                'lat' => $activity->getLat(),
                'lng' => $activity->getLng(),
                'pics' => array_map(
                    fn($pic) => [$pic->getPath()],
                    $picRepository->findBy(['activity' => $activity])
                ),
                'users' => array_map(
                    fn($user) => $user->getUid(),
                    $activity->getUsers()->toArray()
                ),
            ],
            $userEntity->getFavoriteActivities()->toArray()
        );

        return [
            'username' => $userEntity->getUsername(),
            'email' => $userEntity->getEmail(),
            'profile_pic' => $userPic ? $userPic->getPath() : null,
            'uid' => $userEntity->getUid(),
            'role' => $userEntity->getRoles(),
            'favorites' => [
                'roadtrips' => $favoriteRoadtrips,
                'activities' => $favoriteActivities
            ],
            'roadtrips' => $roadtrips,
            'activities' => $activities
        ];
    }

    // Route for the current logged-in user's profile
    #[Route('/', name: 'app_profile_current_user', methods: ['GET'])]
    public function currentUserProfile(
        UserRepository $userRepository,
        PicRepository $picRepository,
        DescriptionRepository $descriptionRepository,
        ActivityRepository $activityRepository
    ): JsonResponse {
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'User not authenticated'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        $userEntity = $userRepository->findOneBy(['email' => $user->getUserIdentifier()]);
        
        if (!$userEntity) {
            return new JsonResponse(['error' => 'User not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        $profileData = $this->getUserProfileData($userEntity, $picRepository, $activityRepository, $descriptionRepository);

        return new JsonResponse(['user' => $profileData], 200);
    }

    // Route for the public profile by UID
    #[Route('/search/{uid}', name: 'app_profile_public_profile', methods: ['GET'])]
    public function publicProfile(
        string $uid, 
        UserRepository $userRepository,
        PicRepository $picRepository,
        DescriptionRepository $descriptionRepository,
        ActivityRepository $activityRepository
    ): JsonResponse {
        $userEntity = $userRepository->findOneBy(['uid' => $uid]);
        
        if (!$userEntity) {
            return new JsonResponse(['error' => 'User not found'], JsonResponse::HTTP_NOT_FOUND);
        }

        $profileData = $this->getUserProfileData($userEntity, $picRepository, $activityRepository, $descriptionRepository);

        return new JsonResponse(['user' => $profileData], 200);
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