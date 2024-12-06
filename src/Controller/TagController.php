<?php

namespace App\Controller;

use App\Repository\TagRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Contracts\Translation\TranslatorInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class TagController extends AbstractController
{
    #[Route('/api/tags/autocomplete', name: 'app_tag_autocomplete', methods: ['GET'])]
    public function autocomplete(Request $request, TagRepository $tagRepository, TranslatorInterface $translator): JsonResponse
    {
        $query = $request->query->get('q', '');
        $tags = $tagRepository->findTagsByName($query);

        $suggestions = [];
        foreach ($tags as $tag) {
            $translatedName = $translator->trans($tag->getName());
            $suggestions[] = ['id' => $tag->getId(), 'name' => $translatedName, 'value' => $tag->getName()];
        }
        
        if (empty($suggestions)) {
            $suggestions[] = ['name' => 'Pas de résultats.'];
        }
        return new JsonResponse($suggestions);
    }
}
