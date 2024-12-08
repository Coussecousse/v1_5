<?php

namespace App\Controller;

use App\Entity\Country;
use App\Entity\Pic;
use App\Entity\Roadtrip;
use App\Entity\User;
use App\Form\RoadtripSearchFormType;
use App\Repository\CountryRepository;
use App\Repository\PicRepository;
use App\Repository\RoadtripRepository;
use App\Repository\UserRepository;
use App\Service\ImageOptimizer;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\File\File;
use Exception;
use RoadtripFormType;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/roadtrip')]
class RoadtripController extends AbstractController
{ 
    private ImageOptimizer $imageOptimizer;

    public function __construct(ImageOptimizer $imageOptimizer)
    {
        $this->imageOptimizer = $imageOptimizer;
    }

    #[Route('/', name: 'app_roadtrip_all', methods: ['GET'])]
    public function index(RoadtripRepository $roadtripRepository):JsonResponse
    {
        // Find all from most recent to oldest
        $roadtrips = $roadtripRepository->findBy([], ['createdAt' => 'DESC']);
        $jsonRoadtrips = [];    
        foreach($roadtrips as $roadtrip) {
            $jsonRoadtrips[] = [
                'title' => $roadtrip->getTitle(),
                'country' => $roadtrip->getCountry()->getName(),
                'description' => $roadtrip->getDescription(),
                'budget' => $roadtrip->getBudget(),
                'days' => $roadtrip->getDays(),
                'roads' => $roadtrip->getRoads(),
                'pics' => array_map(function(Pic $pic) {
                    return $pic->getPath();
                }, $roadtrip->getPics()->toArray()),
                'uid' => $roadtrip->getUid(),
                'user' => [
                    'uid' => $roadtrip->getUser()->getUid()
                ]
            ];
        }

        return new JsonResponse($jsonRoadtrips, Response::HTTP_OK);
    }

    #[Route('/{uid}', name: 'app_roadtrip_delete', methods: ['DELETE'])]
    public function delete(
        Request $request, 
        RoadtripRepository $roadtripRepository,
        EntityManagerInterface $em): JsonResponse
    {
        $uid = $request->get('uid');
        try {
            $roadtrip = $roadtripRepository->findOneBy(['uid' => $uid]);
        } catch (Exception $e) {
            return new JsonResponse(['error' => 'An error occurred'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
        if (!$roadtrip) {
            return new JsonResponse(['error' => 'Roadtrip not found'], Response::HTTP_NOT_FOUND);
        }

        // Check if correct user :
        $user = $this->getUser();
        if ($roadtrip->getUser() !== $user) {
            return new JsonResponse(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        try {
            $roadtripPicsDir = $this->getParameter('roadtrip_pics_directory');
            $pics = $roadtrip->getPics()->toArray();
            $filesystem = new Filesystem();
            foreach ($pics as $pic) {
                $path = $pic->getPath();
                $user = $this->getUser();
                $userEntity = $em->getRepository(User::class)->findOneBy(['email' => $user->getUserIdentifier()]);
                $userEntity->removePic($pic);
                $em->remove($pic);

                $folders = ['small', 'medium', 'large', 'extraLarge'];
                foreach ($folders as $folder) {
                    $filePath = $roadtripPicsDir . '/' . $folder . '/' . $path;
                    if ($filesystem->exists($filePath)) {
                        $filesystem->remove($filePath);
                    }
                }
            }

            $em->remove($roadtrip);
            $em->flush();

            return new JsonResponse(['status' => 'Roadtrip deleted'], Response::HTTP_OK);
        } catch (Exception $e) {
            return new JsonResponse(['error' => 'An error occurred'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/search/{uid}', name: 'app_roadtrip_search_uid', methods: ['GET'])]
    public function searchUid(
        Request $request, 
        RoadtripRepository $roadtripRepository,
        PicRepository $picRepository): JsonResponse
    {
        $uid = $request->get('uid');
        try {
            $roadtrip = $roadtripRepository->findOneBy(['uid' => $uid]);
        } catch (Exception $e) {
            return new JsonResponse(['error' => 'An error occurred'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
        
        if (!$roadtrip) {
            return new JsonResponse(['error' => 'Roadtrip not found'], Response::HTTP_NOT_FOUND);
        }

        try {
            $jsonRoadtrip = [
                'title' => $roadtrip->getTitle(),
                'country' => $roadtrip->getCountry()->getName(),
                'description' => $roadtrip->getDescription(),
                'budget' => $roadtrip->getBudget(),
                'days' => $roadtrip->getDays(),
                'roads' => $roadtrip->getRoads(),
                'uid' => $roadtrip->getUid(),
                'pics' => array_map(function(Pic $pic) {
                    return $pic->getPath();
                }, $roadtrip->getPics()->toArray()),
                'user' => [
                    'username' => $roadtrip->getUser()->getUsername(),
                    'uid' => $roadtrip->getUser()->getUid(),
                    'profile_pic' => $picRepository->getProfilePic($roadtrip->getUser())->getPath()
                ]
            ];        
            return new JsonResponse($jsonRoadtrip, Response::HTTP_OK);
        } 
        catch (Exception $e) {
            return new JsonResponse(['error' => 'An error occurred'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

    }

    #[Route('/update/{uid}', name: 'app_roadtrip_update', methods: ['POST'])]
    public function update(Request $request, 
        EntityManagerInterface $em,
        RoadtripRepository $roadtripRepository,
        PicRepository $picRepository): JsonResponse
    {
        $uid = $request->get('uid');
        try {
            $roadtrip = $roadtripRepository->findOneBy(['uid' => $uid]);
        } catch (Exception $e) {
            return new JsonResponse(['error' => 'An error occurred'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
        if (!$roadtrip) {
            return new JsonResponse(['error' => 'Roadtrip not found'], Response::HTTP_NOT_FOUND);
        }

        $form = $this->createForm(RoadtripFormType::class);
        $data = array_merge($request->request->all(), $request->files->all());
        $form->submit($data);
        $errors = [];

        if ($form->isSubmitted() && $form->isValid()) {
            try {
                // Update the roadtrip
                $roadtrip->setTitle($form->get('title')->getData())
                    ->setDescription($form->get('description')->getData())
                    ->setBudget($form->get('budget')->getData())
                    ->setDays(json_decode($data['days']))
                    ->setRoads(json_decode($data['roads']));
    
                // Handle Pics
                $roadtripPicDir = $this->getParameter('roadtrip_pics_directory');
                $submittedFilePics = $form->get('pics')->getData();
                if ($data['pics'] == null) $data['pics'] = [];
                $submittedStringPics = array_filter($data['pics'], fn($pic) => is_string($pic));
                $submittedPics = array_merge($submittedFilePics, $submittedStringPics);

                // Limit to a maximum of 6 pictures
                $submittedPics = array_slice($submittedPics, 0, 6);

                // Get old pics and their paths
                $oldPics = $roadtrip->getPics()->toArray();

                // Map submitted pics to their paths
                $submittedPicPaths = array_map(
                    fn($pic) => $pic instanceof File ? $pic->getFilename() : $pic,
                    $submittedPics
                );

                // Remove old pics not in the submitted pics
                foreach ($oldPics as $oldPic) {
                    $path = $oldPic->getPath();
                    if (!in_array($path, $submittedPicPaths)) {
                        // Remove pic from user and database
                        $filesystem = new Filesystem();
                        $user = $this->getUser();
                        $userEntity = $em->getRepository(User::class)->findOneBy(['email' => $user->getUserIdentifier()]);
                        $userEntity->removePic($oldPic);
                        $em->remove($oldPic);

                        // Delete associated files
                        $folders = ['small', 'medium', 'large', 'extraLarge'];
                        foreach ($folders as $folder) {
                            $filePath = $roadtripPicDir . '/' . $folder . '/' . $path;
                            if ($filesystem->exists($filePath)) {
                                $filesystem->remove($filePath);
                            }
                        }
                    }
                }

                // Add new pics
                foreach ($submittedPics as $submittedPic) {
                    if ($submittedPic instanceof File) {
                        // Process and save the new file
                        $filename = $this->imageOptimizer->processAndResizeFile($submittedPic, $roadtripPicDir);

                        // Create and persist the new Pic entity
                        $newPic = new Pic();
                        $newPic->setPath($filename);
                        $newPic->setRoadtrip($roadtrip);
                        $newPic->setUser($this->getUser());
                        $em->persist($newPic);
                        $roadtrip->addPic($newPic);
                    } elseif (is_string($submittedPic)) {
                        continue;
                    }
                }

                // Handle country
                $country = $roadtrip->getCountry();
                if ($country->getName() !== $form->get('country')->getData()) {
                    $newCountry = $em->getRepository(Country::class)->findOneBy(['name' => $form->get('country')->getData()]);
                    if (!$newCountry) {
                        $newCountry = new Country();
                        $newCountry->setName($form->get('country')->getData());
                        $em->persist($newCountry);
                    }
                    $roadtrip->setCountry($newCountry);
                }
    
    
                $em->persist($roadtrip);
                $em->flush();
    
                return new JsonResponse(['status' => 'Roadtrip updated'], Response::HTTP_OK);
            } catch (Exception $e) {
                return new JsonResponse(['error' => 'An error occurred.', 'errors' => $errors], Response::HTTP_INTERNAL_SERVER_ERROR);
            }
        } 

        foreach ($form->getErrors(true) as $error) {
            $errors[$error->getOrigin()->getName()] = $error->getMessage();
        }

        return new JsonResponse(['error' => 'Invalid data.', 'errors' => $errors], Response::HTTP_BAD_REQUEST);
    }  

    #[Route('/create', name: 'app_roadtrip_create', methods: ['POST'])]
    public function create(Request $request,
        CountryRepository $countryRepository,
        EntityManagerInterface $em): JsonResponse
    {
        $form = $this->createForm(RoadtripFormType::class);
        $data = array_merge($request->request->all(), $request->files->all());
        $form->submit($data);
        $errors = [];
        if ($data['days'] === null || $data['days'] === '[]' || $data['roads'] === null || $data['roads'] === '[]') {
            $errors['days'] = "Vous n'avez pas planifié votre roadtrip.";   
        }
        
        if ($form->isSubmitted() && $form->isValid()) {
            try {
                if ($data['days'] === null || $data['days'] === '[]' || $data['roads'] === null || $data['roads'] === '[]') {
                    return new JsonResponse(['error' => 'Invalid data.', 'errors' => ['days' => "Vous n'avez pas planifié votre roadtrip."]], Response::HTTP_BAD_REQUEST);
                }

                // Check if the country already exist or create a new one
                $country = $countryRepository->findOneBy(['name' => $form->get('country')->getData()]);
                if (!$country) {
                    $country = new Country();
                    $country->setName($form->get('country')->getData());
                    $em->persist($country);
                }

                // Create a new roadtrip 
                $roadtrip = new Roadtrip();
                $roadtrip->setTitle($form->get('title')->getData())
                    ->setDescription($form->get('description')->getData())
                    ->setCountry($country)
                    ->setUser($this->getUser())
                    ->setBudget($form->get('budget')->getData())
                    ->setDays(json_decode($data['days']))
                    ->setRoads(json_decode($data['roads']));

                // Create and add pics
                $pics = $form->get('pics')->getData();
                if ($pics) {
                    foreach ($pics as $pic) {
                        $roadtripPicsDir = $this->getParameter('roadtrip_pics_directory');
                        $filename = $this->imageOptimizer->processAndResizeFile($pic, $roadtripPicsDir);
                        $newPic = new Pic();
                        $newPic->setPath($filename);
                        $newPic->setRoadtrip($roadtrip);
                        $newPic->setUser($this->getUser());

                        $em->persist($newPic);  
                        $roadtrip->addPic($newPic);
                    }
                }

                $em->persist($roadtrip);    

                // Add the roadtrip to user
                $user = $this->getUser();
                $userEntity = $em->getRepository(User::class)->findOneBy(['email' => $user->getUserIdentifier()]);
                $userEntity->addRoadtrip($roadtrip);
                $em->persist($userEntity);

                $em->flush();

                return new JsonResponse(['status' => 'Roadtrip created'], Response::HTTP_CREATED);
                
            } catch (Exception $e ) {
                $errors['exeption'] = $e->getMessage();
                return new JsonResponse(['error' => 'An error occurred.', 'errors' => $errors], Response::HTTP_INTERNAL_SERVER_ERROR);
            }
        }

        foreach ($form->getErrors(true) as $error) {
            $errors[$error->getOrigin()->getName()] = $error->getMessage();
        }   

        return new JsonResponse(['error' => 'Invalid data.', 'errors' => $errors], Response::HTTP_BAD_REQUEST);
    }   

    #[Route('/search', name: 'app_roadtrip_search', methods: ['GET'])]
    public function search(Request $request, 
        RoadtripRepository $roadtripRepository, 
        CountryRepository $countryRepository): JsonResponse
    {
        $form = $this->createForm(RoadtripSearchFormType::class);
        $data = $request->query->all();
        $form->submit($data);

        $errors = [];
        if ($form->isSubmitted() && $form->isValid()) {

            $country = null;
            //Check if the country is correct
            if ($form->get('country')->getData()) {
                try {
                    $country = $countryRepository->findOneBy(['name' => $form->get('country')->getData()]);
                } catch (Exception $e) {
                    $errors['country'] = 'Aucun roadtrip ne correspond à ce pays.';
                }
            }

            // Get the filter
            $filter = $form->get('filter')->getData() ?? null;

            // Get the budget
            $budget = $form->get('price')->getData() ?? null; 

            // Get the duration
            $duration = $form->get('duration')->getData() ?? null;

            $results = $roadtripRepository->findRoadtripByFilters($country, $filter, $budget, $duration);
            return new JsonResponse(
                array_map(
                    fn($roadtrip) => [
                        'title' => $roadtrip->getTitle(),
                        'country' => $roadtrip->getCountry()->getName(),
                        'description' => $roadtrip->getDescription(),
                        'budget' => $roadtrip->getBudget(),
                        'days' => $roadtrip->getDays(),
                        'roads' => $roadtrip->getRoads(),   
                        'pics' => array_map(function(Pic $pic) {
                            return $pic->getPath();
                        }, $roadtrip->getPics()->toArray()),
                        'uid' => $roadtrip->getUid(),
                    ],
                    $results
                ),
                200
            );

        }

        foreach ($form->getErrors(true) as $error) {
            $errors[$error->getOrigin()->getName()] = $error->getMessage();
        }

        return new JsonResponse(['error' => 'Invalid data.', 'errors' => $errors], Response::HTTP_BAD_REQUEST);
    }

    #[Route('/favorite/{uid}', name: 'app_roadtrip_favorite', methods: ['POST'])]   
    public function handleFavorite(Request $request, 
        UserRepository $userRepository, 
        RoadtripRepository $roadtripRepository,
        EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        $uid = $request->get('uid');
        try {
            $roadtrip = $roadtripRepository->findOneBy(['uid' => $uid]);
            $userEntity = $userRepository->findOneBy(['email' => $user->getUserIdentifier()]);
        } catch (Exception $e) {
            return new JsonResponse(['error' => 'An error occurred'], Response::HTTP_INTERNAL_SERVER_ERROR);    
        }

        if ($userEntity->getFavoriteRoadtrips()->contains($roadtrip)) {
            $userEntity->removeFavoriteRoadtrip($roadtrip);
        } else {
            $userEntity->addFavoriteRoadtrip($roadtrip);
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
        RoadtripRepository $roadtripRepository,
        EntityManagerInterface $em
    ): JsonResponse
    {
        $uid = $request->get('uid');

        try {
            $roadtrip = $roadtripRepository->findOneBy(['uid' => $uid]);
        } catch (Exception $e) {
            return new JsonResponse(['error' => 'An error occurred'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        if (!$roadtrip) {
            return new JsonResponse(['error' => 'Roadtrip not found'], Response::HTTP_NOT_FOUND);
        }

        $currentReports = $roadtrip->getReport();
        $roadtrip->setReport($currentReports + 1);

        $em->persist($roadtrip);
        $em->flush();

        return new JsonResponse(['message' => 'Roadtrip reported successfully'], Response::HTTP_OK);
    }
}