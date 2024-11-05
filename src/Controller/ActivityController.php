<?php

namespace App\Controller;

use App\Entity\Activity;
use App\Entity\Country;
use App\Entity\Description;
use App\Entity\Pic;
use App\Entity\User;
use App\Form\ActivityFormType;
use App\Form\ActivitySearchFormType;
use App\Repository\ActivityRepository;
use App\Repository\DescriptionRepository;
use App\Repository\PicRepository;
use App\Repository\TagRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/activities')]
class ActivityController extends AbstractController 
{
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
                'pics' => array_map(function(Pic $pic) {
                    return $pic->getPath();
                }, $activity->getPics()->toArray()),
                'uid' => $activity->getUid()
            ];
        }

        return new JsonResponse($jsonActivities, Response::HTTP_OK);
    }

    #[Route('/create', name: 'app_activity_create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em, TagRepository $tagRepository, ActivityRepository $activityRepository): JsonResponse
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
    
                        $newFilename = uniqid() . '.' . $activity_pic->guessExtension();
                        $activity_pic->move(
                            $activityPicsDir,
                            $newFilename
                        );
    
                        $activityPic = new Pic();
                        $activityPic->setPath($newFilename);
                        $activityPic->setActivity($activity);
    
                        $em->persist($activityPic);
                        $activity->addPic($activityPic);
                        $em->flush();
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
}