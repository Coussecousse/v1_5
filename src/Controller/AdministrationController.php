<?php

namespace App\Controller;

use App\Repository\ActivityRepository;
use App\Repository\PicRepository;
use App\Repository\RoadtripRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/administration')]
class AdministrationController extends AbstractController
{
    #[Route('', name: 'administration_data', methods: ['GET'])]
    public function index(
        RoadtripRepository $roadtripRepository,
        ActivityRepository $activityRepository,
        UserRepository $userRepository
    ): JsonResponse {
        $user = $this->getUser();

        if (!$this->isAdmin($userRepository, $user)) {
            return new JsonResponse(['error' => 'Unauthorized.'], Response::HTTP_UNAUTHORIZED);
        }

        // Fetch data
        $roadtrips = $roadtripRepository->findAll();
        $activities = $activityRepository->findAll();
        $users = $userRepository->findAll();

        // Format data
        $response = [
            'roadtrips' => array_map(fn($r) => [
                'uid' => $r->getUid(),
                'title' => $r->getTitle(),
                'report' => $r->getReport(),
            ], $roadtrips),
            'activities' => array_map(fn($a) => [
                'uid' => $a->getUid(),
                'title' => $a->getDisplayName(),
                'report' => $a->getReport(),
            ], $activities),
            'users' => array_map(fn($u) => [
                'uid' => $u->getUid(),
                'username' => $u->getUsername(),
                'report' => $u->getReport(),
            ], $users),
        ];

        return $this->json($response);
    }

    #[Route('/reset/{type}/{uid}', name: 'administration_reset', methods: ['GET'])]
    public function reset(
        string $type,
        string $uid,
        RoadtripRepository $roadtripRepository,
        ActivityRepository $activityRepository,
        UserRepository $userRepository,
        EntityManagerInterface $em
    ): JsonResponse {
        $user = $this->getUser();

        if (!$this->isAdmin($userRepository, $user)) {
            return new JsonResponse(['error' => 'Unauthorized.'], Response::HTTP_UNAUTHORIZED);
        }

        switch ($type) {
            case 'roadtrips':
                $entity = $roadtripRepository->findOneBy(['uid' => $uid]);
                break;
            case 'activities':
                $entity = $activityRepository->findOneBy(['uid' => $uid]);
                break;
            case 'users':
                $entity = $userRepository->findOneBy(['uid' => $uid]);
                break;
            default:
                return new JsonResponse(['error' => 'Invalid type.'], Response::HTTP_BAD_REQUEST);
        }

        if (!$entity) {
            return new JsonResponse(['error' => ucfirst($type) . ' not found.'], Response::HTTP_NOT_FOUND);
        }

        $entity->setReported(0);
        $em->persist($entity);
        $em->flush();

        return new JsonResponse(['success' => ucfirst($type) . ' reset successfully.']);
    }

    #[Route('/delete/{type}/{uid}', name: 'administration_delete', methods: ['GET'])]
    public function delete(
        string $type,
        string $uid,
        RoadtripRepository $roadtripRepository,
        ActivityRepository $activityRepository,
        UserRepository $userRepository, 
        EntityManagerInterface $em,
        PicRepository $picRepository
    ): JsonResponse {
        $user = $this->getUser();

        if (!$this->isAdmin($userRepository, $user)) {
            return new JsonResponse(['error' => 'Unauthorized.'], Response::HTTP_UNAUTHORIZED);
        }

        $elementDir = null;
        $pics = null;
        switch ($type) {
            case 'roadtrips':
                $entity = $roadtripRepository->findOneBy(['uid' => $uid]);
                $elementDir = $this->getParameter('roadtrip_pics_directory'); 
                $pics = $entity->getPics()->toArray();
                break;
            case 'activities':
                $entity = $activityRepository->findOneBy(['uid' => $uid]);
                $elementDir = $this->getParameter('activity_pics_directory'); 
                break;
            case 'users':
                $entity = $userRepository->findOneBy(['uid' => $uid]);
                $elementDir = $this->getParameter('profile_pics_directory'); 
                $pics[] = $picRepository->getProfilePic($userEntity);
                break;
            default:
                return new JsonResponse(['error' => 'Invalid type.'], Response::HTTP_BAD_REQUEST);
        }

        if (!$entity) {
            return new JsonResponse(['error' => ucfirst($type) . ' not found.'], Response::HTTP_NOT_FOUND);
        }

        // Remove associated pictures if the entity is found
        $filesystem = new Filesystem();
        $pics = $entity->getPics()->toArray();

        foreach ($pics as $pic) {
            $path = $pic->getPath();

            $folders = ['small', 'medium', 'large', 'extraLarge']; 
            foreach ($folders as $folder) {
                $filePath = $elementDir . '/' . $folder . '/' . $path;
                if ($filesystem->exists($filePath)) {
                    $filesystem->remove($filePath);
                }
            }
            // Remove the picture from the entity and delete it
            $entity->removePic($pic); 
            $user = $pic->getUser();
            $user->removePic($pic);
            $em->persist($user);
            $em->remove($pic);
        }

        $em->persist($entity);
        $em->remove($entity);
        $em->flush();

        return new JsonResponse(['success' => ucfirst($type) . ' deleted successfully.']);
    }

    private function isAdmin(UserRepository $userRepository, $user): bool
    {
        $userEntity = $userRepository->findOneBy(['email' => $user->getUserIdentifier()]);
        return $userEntity && in_array('ROLE_ADMIN', $userEntity->getRoles());
    }
}
