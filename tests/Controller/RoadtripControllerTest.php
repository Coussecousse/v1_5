<?php

namespace App\Tests\Controller;

use App\Repository\UserRepository;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class RoadtripControllerTest extends WebTestCase
{
    public function testCreateRoadtrip(): void
    {
        $client = static::createClient();

        // Retrieve the user from the repository
        $userRepository = static::getContainer()->get(UserRepository::class);
        $user = $userRepository->findOneBy(['email' => 'test@hotmail.com']);

        // Log in as that user
        $client->loginUser($user);

        $data = [
            'title' => 'Titre de test',
            'country' => 'France',
            'description' => 'Description de test',
            'budget' => 2, // €€
            'days' => json_encode([
                [
                    [
                        "informations" => [
                            "display_name" => "Paris, Île-de-France, France métropolitaine, France",
                            "lat" => "48.8588897",
                            "lng" => "2.3200410217200766"
                        ]
                    ]
                ],
                [
                    [
                        "informations" => [
                            "display_name" => "Bordeaux, Gironde, Nouvelle-Aquitaine, France métropolitaine, France",
                            "lat" => "44.841225",
                            "lng" => "-0.5800364"
                        ]
                    ],
                    [
                        "informations" => [
                            "display_name" => "Mimizan, Mont-de-Marsan, Landes, Nouvelle-Aquitaine, France métropolitaine, 40200, France",
                            "lat" => "44.2019796",
                            "lng" => "-1.2309278"
                        ]
                    ]
                ]
            ]),
            'roads' => json_encode([
                [],
                [
                    ['route' => 'supposed to be between Paris and Bordeaux'],
                    ['route' => 'supposed to be between Bordeaux and Mont de Marsan']
                ]
            ])
        ];

        $client->request('POST', '/api/roadtrip/create', $data);

        $this->assertResponseStatusCodeSame(201);

        $responseContent = $client->getResponse()->getContent();
        $responseData = json_decode($responseContent, true);

        $this->assertSame('Roadtrip created', $responseData['status']);
    }
}
