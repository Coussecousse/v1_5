<?php

namespace App\Controller;

use App\Entity\Activity;
use App\Entity\Country;
use App\Entity\Description;
use App\Entity\Pic;
use App\Entity\User;
use App\Form\ActivityFormType;
use App\Form\ActivitySearchFormType;
use App\Form\UpdateActivityFormType;
use App\Repository\ActivityRepository;
use App\Repository\DescriptionRepository;
use App\Repository\PicRepository;
use App\Repository\TagRepository;
use App\Repository\UserRepository;
use App\Service\ImageOptimizer;
use Doctrine\ORM\EntityManagerInterface;
use Exception;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\File\File;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Translation\TranslatorBag;

#[Route('/api/activities')]
class ActivityController extends AbstractController 
{
    private ImageOptimizer $imageOptimizer;

    public function __construct(ImageOptimizer $imageOptimizer)
    {
        $this->imageOptimizer = $imageOptimizer;
    }

    #[Route('/', name: 'app_activity_all', methods: ['GET'])]
    public function index(ActivityRepository $activityRepository): JsonResponse
    {
        $activities = $activityRepository->findAll();
        $jsonActivities = [];
        foreach ($activities as $activity) {
            $jsonActivities[] = [
                'lat' => $activity->getLat(),
                'lng' => $activity->getLng(),
                'display_name' => $activity->getDisplayName(),
                'description' => $activityRepository->getFirstDescription($activity),
                'type' => $activity->getType()->getName(),
                'country' => $activity->getCountry()->getName(),
                'pics' => array_map(
                    fn(Pic $pic) => $pic->getPath(),
                    $activity->getPics()->toArray()
                ),
                'uid' => $activity->getUid(),
                'users' => array_map(
                    fn($user) => ['uid' => $user->getUid()],
                    $activity->getUsers()->toArray()
                )
            ];
        }

        return new JsonResponse($jsonActivities, Response::HTTP_OK);
    }

    #[Route('/{uid}', name: 'app_activity_delete', methods: ['DELETE'])]
    public function delete (
        Request $request,
        ActivityRepository $activityRepository,
        DescriptionRepository $descriptionRepository,
        EntityManagerInterface $em
    ): JsonResponse
    {
        $uid = $request->get(key: 'uid');
        try {
            $activity = $activityRepository->findOneBy(['uid' => $uid]);
        } catch (Exception $e) {
            return new JsonResponse(['error' => 'An error occurred'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        if (!$activity) {
            return new JsonResponse(['error' => 'Activity not found'], Response::HTTP_NOT_FOUND);
        }

        // Check if user contribute to this activity :
        $user = $this->getUser();

        if (!in_array($user, $activity->getUsers()->toArray())) {
            return new JsonResponse(['error' => 'You are not allowed to delete this activity'], Response::HTTP_FORBIDDEN);
        }
        
        $activityPicsDir = $this->getParameter('activity_pics_directory');
        $filesystem = new Filesystem();
        if (count($activity->getUsers()) === 1) {
            $userEntity = $em->getRepository(User::class)->findOneBy(['email' => $user->getUserIdentifier()]);
            $userEntity->removeActivity($activity);
            $activityPics = $activity->getPics();
            foreach ($activityPics as $pic) {
                $path = $pic->getPath();

                $userEntity->removePic($pic);
                $em->remove($pic);

                $folders = ['small', 'medium', 'large', 'extraLarge'];
                foreach ($folders as $folder) {
                    $filePath = $activityPicsDir . '/' . $folder . '/' . $path;
                    if ($filesystem->exists($filePath)) {
                        $filesystem->remove($filePath);
                    }
                }
            }
            
            $em->remove($activity);
            $em->flush();
            return new JsonResponse(['message' => 'Activity deleted successfully', 'lastActivity' => true], Response::HTTP_OK);
        } else {
            $userEntity = $em->getRepository(User::class)->findOneBy(['email' => $user->getUserIdentifier()]);
            $userEntity->removeActivity($activity);

            $picsActivity = $userEntity->getPics()->filter(fn(Pic $pic) => $pic->getActivity() === $activity);
            foreach($picsActivity as $pic) {
                $path = $pic->getPath();
                $userEntity->removePic($pic);
                $em->remove($pic);

                $folders = ['small', 'medium', 'large', 'extraLarge'];
                foreach ($folders as $folder) {
                    $filePath = $activityPicsDir . '/' . $folder . '/' . $path;
                    if ($filesystem->exists($filePath)) {
                        $filesystem->remove($filePath);
                    }
                }
            }

            $description = $descriptionRepository->findBy(['activity' => $activity, 'user' => $userEntity]);
            forEach($description as $d) {
                $em->remove($d);
            }
            $em->persist($userEntity);
            $em->flush();
            return new JsonResponse(['message' => 'Activity deleted successfully'], Response::HTTP_OK);
        }
    }

    #[Route('/create', name: 'app_activity_create', methods: ['POST'])]
    public function create(Request $request, 
        EntityManagerInterface $em, 
        TagRepository $tagRepository, 
        ActivityRepository $activityRepository): JsonResponse
    {
        $form = $this->createForm(ActivityFormType::class);
        $data = array_merge($request->request->all(), $request->files->all());
        $form->submit($data);
        $errors = [];

        if ($form->isSubmitted() && $form->isValid()) {
            try {

                // Get the type 
                $type = $tagRepository->findOneBy(['name' => $form->get('type')->getData()]);
                if (!$type) {
                    $errors['type'] = "Ce type n'existe pas";
                    return new JsonResponse(['error' => 'An error occurred.', 'errors' => $errors], Response::HTTP_INTERNAL_SERVER_ERROR);
                }

                // Look for an existing activity
                $activity = $activityRepository->findOneByLngAndLat($form->get('lat')->getData(), $form->get('lng')->getData());
                if ($activity){
                    return new JsonResponse(['error' => "L'activité existe déjà"], Response::HTTP_CONFLICT);
                }

                // Set the activity
                $activity = new Activity();

                // Get the country : 
                $display_name = $form->get('display_name')->getData();
                $dataCountry = explode(',', $display_name);
                $dataCountry = trim(end($dataCountry));

                $country = $em->getRepository(className: Country::class)->findOneBy(['name' => $dataCountry]);
                if (!$country) {
                    $country = new Country();
                    $country->setName($dataCountry);
                    $country->addActivity($activity);
                    $em->persist($country);
                }

                $description = new Description();
                $description->setDescription($form->get('description')->getData());
                $description->setActivity($activity);
                $description->setUser($this->getUser());
                $em->persist($description);
                $activity
                    ->setDisplayName($form->get('display_name')->getData())
                    ->setLat($form->get('lat')->getData())
                    ->setLng($form->get('lng')->getData())
                    ->addDescription($description)
                    ->setType($type)
                    ->setCountry($country);
                $em->persist($activity);

                $activity_pics = $form->get('activity_pics')->getData();
                if ($activity_pics) {
                    foreach ($activity_pics as $activity_pic) {
                        // Create a new pic
                        $activityPicsDir = $this->getParameter('activity_pics_directory');
                        $fileName = $this->imageOptimizer->processAndResizeFile($activity_pic, $activityPicsDir);
    
                        $activityPic = new Pic();
                        $activityPic->setPath($fileName);
                        $activityPic->setActivity($activity);
                        $activityPic->setUser($this->getUser());    
    
                        $em->persist($activityPic);
                        $activity->addPic($activityPic);
                    }
                }

                // Update the type
                $type->addActivity($activity);
                $em->persist($type);

                // Set the user
                $user = $this->getUser();
                $userEntity = $em->getRepository(User::class)->findOneBy(['email' => $user->getUserIdentifier()]);
                $activity->addUser($userEntity);
                $userEntity->addActivity($activity);
                $em->persist($userEntity);

                $em->persist($activity);
                $em->flush();

                return new JsonResponse(['status' => 'Activity created successfully!'], Response::HTTP_CREATED);
            } catch (\Exception $e) {
                $errors['exception'] = $e->getMessage();
                return new JsonResponse(['error' => 'An error occurred.', 'errors' => $errors], Response::HTTP_INTERNAL_SERVER_ERROR);
            }
        }

        foreach ($form->getErrors(true) as $error) {
            $errors[$error->getOrigin()->getName()] = $error->getMessage();
        }

        return new JsonResponse(['error' => 'Invalid data.', 'errors' => $errors], Response::HTTP_BAD_REQUEST);
    }

    #[Route('/search', name: 'app_activity_search',  methods: ['GET'])]
    public function search(Request $request, ActivityRepository $activityRepository, TagRepository $tagRepository): JsonResponse
    {
        $form = $this->createForm(ActivitySearchFormType::class);
        $data = $request->query->all();
        $form->submit($data);
        if ($form->isSubmitted() && $form->isValid()) {

            // Check for the type
            $type = $form->get('type')->getData();
            $type = $tagRepository->findOneBy(['name' => $type]);
            if (!$type) {
                $errors['type'] = "Vous n'avez pas sélectionné un type valide";
            }
    
            $lat = $form->get('lat')->getData();
            $lng = $form->get('lng')->getData();
    
            // Search for coordinates
            if (!$lat || !$lng) {
                if ($type) {
                    // Return all activities with a certain type
                    $activities = $activityRepository->findBy(['type' => $type]);
                } else {
                    // Return all activitie
                    $activities = $activityRepository->findAll();
                }
            } else {
                // Filter activities within a radius
                if ($type) {
                    // With a certain type
                    $activities = $activityRepository->findWithinRadiusAndType($lat, $lng, $type->getId());
                } else {
                    // Without a type
                    $activities = $activityRepository->findWithinRadius($lat, $lng);
                }
            }
    
            if (!$activities) {
                return new JsonResponse(['error' => 'No activities found.'], Response::HTTP_NOT_FOUND);
            }
    
            // Prepare response data for activities
            if ($activities[0] instanceof Activity) {
                $activities = [$activities]; 
            }
            
            // Loop through the activities
            foreach ($activities as $activityArray) {
            
                $activity = $activityArray[0]; 
                $distance = $activityArray['distance'] ?? null; 

                // Build the jsonActivities structure
                $jsonActivities[] = [
                    'lat' => $activity->getLat(),
                    'lng' => $activity->getLng(),
                    'display_name' => $activity->getDisplayName(),
                    'description' => $activityRepository->getFirstDescription($activity),
                    'type' => $activity->getType()->getName(),
                    'country' => $activity->getCountry()->getName(),
                    'pics' => array_map(function(Pic $pic) {
                        return $pic->getPath();
                    }, $activity->getPics()->toArray()),
                    'distance' => $distance, 
                    'uid' => $activity->getUid() 
                ];
            }


            $responseData = ['activities' => $jsonActivities];

            if (!empty($errors)) {
                $responseData['errors'] = $errors;
            }

            return new JsonResponse($responseData, Response::HTTP_OK);
        }

        foreach ($form->getErrors(true) as $error) {
            $errors[$error->getOrigin()->getName()] = $error->getMessage();
        }

        return new JsonResponse(['error' => 'Invalid data.', 'errors' => $errors], Response::HTTP_BAD_REQUEST);
    }

    #[route('/search/{uid}', name: 'app_activity_search_uid', methods: ['GET'])]
    public function searchUid(
        Request $request, 
        ActivityRepository $activityRepository,
        PicRepository $picRepository,
        DescriptionRepository $descriptionRepository): JsonResponse
    {
        $uid = $request->attributes->get('uid');
        try {
            $activity = $activityRepository->findOneBy(['uid' => $uid]);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => 'An error occurred.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
        if (!$activity) {
            return new JsonResponse(['error' => 'Activity not found.'], Response::HTTP_NOT_FOUND);
        }

        $jsonActivity = [
            'lat' => $activity->getLat(),
            'lng' => $activity->getLng(),
            'display_name' => $activity->getDisplayName(),
            'uid' => $activity->getUid(),
            'type' => $activity->getType()->getName(),
            'country' => $activity->getCountry()->getName(),
        ];

        $users = $activity->getUsers();
        foreach($users as $user) {
            $jsonActivity['opinions'][] = [
                'user' => [
                    'username' => $user->getUsername(),
                    'uid' => $user->getUid(),
                    'profile_pic' => $picRepository->getProfilePic($user)->getPath()
                ],
                'description' => $descriptionRepository->findOneBy(['activity' => $activity, 'user' => $user])->getDescription(),
                'pics' => array_map(function(Pic $pic) {
                    return $pic->getPath();
                }, $picRepository->findBy(['activity' => $activity, 'user' => $user]))
            ];
        }

        return new JsonResponse($jsonActivity, Response::HTTP_OK);
    }

    #[Route('/update/{uid}', name: 'app_activity_update_uid', methods: ['POST'])]
    public function updateUid(Request $request, 
        EntityManagerInterface $em, 
        ActivityRepository $activityRepository, 
        PicRepository $picRepository): JsonResponse
    {

        $uid = $request->attributes->get('uid');
        $activity = $activityRepository->findOneBy(['uid' => $uid]);
        if (!$activity) {
            return new JsonResponse(['error' => 'Activity not found.'], Response::HTTP_NOT_FOUND);
        }

        $form = $this->createForm(UpdateActivityFormType::class);
        $data = $request->request->all();
        $files = $request->files->all();

        // If there's file send and just file name from past contribution updated
        if (isset($data['activity_pics']) && isset($files['activity_pics'])) {
            $data['activity_pics'] = array_merge((array)$data['activity_pics'], (array)$files['activity_pics']);
        } elseif (isset($files['activity_pics'])) {
            $data['activity_pics'] = $files['activity_pics'];
        }
        $form->submit($data);

        if ($form->isSubmitted() && $form->isValid()) {
            try {
                // If the user already contribued
                if (in_array($this->getUser(), $activity->getUsers()->toArray())) {
                    $description = $activity->getDescriptions()->filter(fn(Description $description) => $description->getUser() === $this->getUser())->first();
                    $description->setDescription($form->get('description')->getData());
                    $em->persist($description);
                } else {
                    $description = new Description();
                    $description->setDescription($form->get('description')->getData())
                                ->setActivity($activity)
                                ->setUser($this->getUser());
                    $em->persist($description);
                    $activity->addDescription($description);
                    $activity->addUser($this->getUser());
                    $em->persist($description);
                }

                $pics = $picRepository->findBy(['activity' => $activity, 'user' => $this->getUser()]);
                $submitedPics = $form->get('activity_pics')->getData();  

                // If a smarter person send more than 6 pics :)
                if (count($submitedPics) > 6 ) {
                    $submitedPics = array_slice($submitedPics, 0, 6);
                }

                // Delete the pics 
                $activityPicsDir = $this->getParameter('activity_pics_directory');
                foreach($pics as $pic) {
                    $namePath = $pic->getPath();
                    if (!in_array($namePath, array_map(function ($file) { return $file instanceof File ? null : $file; }, $data['activity_pics']))) {
                        $filesystem = new Filesystem();

                        $user = $this->getUser();
                        $userEntity = $em->getRepository(User::class)->findOneBy(['email' => $user->getUserIdentifier()]);
                        $userEntity->removePic($pic);
                        $em->remove($pic);
                        
                        $folders = ['small', 'medium', 'large', 'extraLarge'];
                        foreach($folders as $f) {
                            $pic = $activityPicsDir . '/' . $f . '/' . $namePath;
                            if (!$filesystem->exists($pic)) {
                                $filesystem->remove($pic);
                            }
                        }
                    }
                }

                // Add new pics
                foreach($submitedPics as $pic) {
                    if (in_array($pic->getClientOriginalName(), $pics)) continue;

                    $newFilename = $this->imageOptimizer->processAndResizeFile($pic, $activityPicsDir);

                    // Create a new pic
                    $newPic = new Pic();
                    $newPic->setPath($newFilename); 
                    $newPic->setActivity($activity);
                    $newPic->setUser($this->getUser());

                    $em->persist($newPic);
                    $activity->addPic($newPic);
                } 

                $activity->addDescription($description);
                $activity->addUser($this->getUser());
                
                $em->persist($activity);
                $em->flush();

                return new JsonResponse(['message' => 'Activity updated successfully.'], Response::HTTP_OK);
            } catch (\Exception $e) {
                return new JsonResponse(['error' => 'An error occurred while updating the activity.'], Response::HTTP_INTERNAL_SERVER_ERROR);
            }
        }


        foreach ($form->getErrors(true) as $error) {
            $errors[$error->getOrigin()->getName()] = $error->getMessage();
        }

        return new JsonResponse(['error' => 'Invalid data.', 'errors' => $errors], Response::HTTP_BAD_REQUEST);
    }

    #[Route('/favorite/{uid}', name: 'app_activity_favorite_uid', methods: ['POST'])]
    public function handleFavorite(Request $request, 
        UserRepository $userRepository,
        ActivityRepository $activityRepository, 
        EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        $uid = $request->get('uid');
        try {
            $activity = $activityRepository->findOneBy(['uid' => $uid]);    
            $userEntity = $userRepository->findOneBy(['email' => $user->getUserIdentifier()]);
        } catch (Exception $e) {
            return new JsonResponse(['error' => 'An error occurred.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        if ($userEntity->getFavoriteActivities()->contains($activity)) {
            $userEntity->removeFavoriteActivity($activity);
        } else {
            $userEntity->addFavoriteActivity($activity);
        }

        $em->persist($userEntity);
        $em->flush();

        $user = [
            'username' => $userEntity->getUsername(),
            'email' => $userEntity->getEmail(),
            'uid' => $userEntity->getUid(),
            'favorites' => [
                'roadtrips' => array_map(
                    fn($roadtrip) => ['uid' => $roadtrip->getUid()],
                    $userEntity->getFavoriteRoadtrips()->toArray()
                ),
                'activities' => array_map(
        fn($activity) => ['uid' => $activity->getUid()],
                    $userEntity->getFavoriteActivities()->toArray()
                )
            ]
        ];

        return new JsonResponse(['status' => 'Favorite updated', 'user' => $user], Response::HTTP_OK);
    }

    #[Route('/report/{uid}', name: 'app_activity_report', methods:['POST'])]
    public function report(
        Request $request,
        ActivityRepository $activityRepository,
        EntityManagerInterface $em
    ): JsonResponse
    {
        $uid = $request->get('uid');

        try {
            $activity = $activityRepository->findOneBy(['uid' => $uid]);
        } catch (Exception $e) {
            return new JsonResponse(['error' => 'An error occurred'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        if (!$activity) {
            return new JsonResponse(['error' => 'Activity not found'], Response::HTTP_NOT_FOUND);
        }

        $currentReports = $activity->getReport();
        $activity->setReport($currentReports + 1);

        $em->persist($activity);
        $em->flush();

        return new JsonResponse(['message' => 'Activity reported successfully'], Response::HTTP_OK);
    }
}