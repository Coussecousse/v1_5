<?php

namespace App\Controller;

use App\Entity\Country;
use App\Entity\Pic;
use App\Entity\Roadtrip;
use App\Entity\User;
use App\Repository\CountryRepository;
use App\Repository\RoadtripRepository;
use App\Service\ImageOptimizer;
use Doctrine\ORM\EntityManagerInterface;
use Exception;
use RoadtripFormType;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
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
        $roadtrips = $roadtripRepository->findAll();
        dump($roadtrips);
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
                'uid' => $roadtrip->getUid()
            ];
        }

        return new JsonResponse($jsonRoadtrips, Response::HTTP_OK);
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

        if ($form->isSubmitted() && $form->isValid()) {
            try {
                if ($data['days'] === null || $data['roads'] === null) {
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


}