<?php

namespace App\Controller;

use App\Entity\Activity;
use App\Entity\Country;
use App\Entity\Pic;
use App\Entity\User;
use App\Form\ActivityFormType;
use App\Repository\ActivityRepository;
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
    #[Route('/create', name: 'activity_create', methods: ['POST'])]
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
                    $errors['type'] = 'Type non trouvé';
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

                $activity
                    ->setDisplayName($form->get('display_name')->getData())
                    ->setLat($form->get('lat')->getData())
                    ->setLng($form->get('lng')->getData())
                    ->setDescription($form->get('description')->getData())
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
                $activity->setUser($userEntity);
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
}