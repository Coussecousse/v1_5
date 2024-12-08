<?php

namespace App\Controller;

use App\Entity\Country;
use App\Repository\CountryRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/country')]
class CountryController extends AbstractController
{
    #[Route('/autocomplete', name: 'app_country_autocomplete', methods: ['GET'])]
    public function autocomplete(Request $request, CountryRepository $countryRepository): JsonResponse
    {
        $query = $request->query->get('q', '');
        $countries = $countryRepository->findCountryByName($query);

        if (empty($countries)) {
            return new JsonResponse(['name' => 'Pas de résultats.'], 404);
        }

        return new JsonResponse(
            array_map(
                fn($country) => ['name' => $country->getName()],
                $countries
            ),
            200
        );
    }
}