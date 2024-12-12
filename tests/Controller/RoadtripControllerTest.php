<?php

namespace App\Tests\Controller;

use App\Repository\UserRepository;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class RoadtripControllerTest extends WebTestCase
{
    // Test with good data
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


    // Test without being logged in
    public function testCreateRoadtripWithoutLogin(): void
    {
        $client = static::createClient();

        $data = [
            'title' => 'Test Roadtrip',
            'country' => 'France',
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
            ]),
            'budget' => 2
        ];

        $client->request('POST', '/api/roadtrip/create', $data);

        $this->assertResponseStatusCodeSame(500); 
    }

    // Test with empty data
    public function testCreateRoadtripWithMissingTitle(): void
    {
        $client = static::createClient();
        $userRepository = static::getContainer()->get(UserRepository::class);
        $user = $userRepository->findOneBy(['email' => 'test@hotmail.com']);
        $client->loginUser($user);

        $data = [
            'country' => 'France',
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
                ]),
            'budget' => 2
        ];

        $client->request('POST', '/api/roadtrip/create', $data);

        $this->assertResponseStatusCodeSame(400); 
        $this->assertStringContainsString('title', $client->getResponse()->getContent());
    }

    public function testCreateRoadtripWithSmallTitle(): void
    {
        $client = static::createClient();
        $userRepository = static::getContainer()->get(UserRepository::class);
        $user = $userRepository->findOneBy(['email' => 'test@hotmail.com']);
        $client->loginUser($user);

        $data = [
            'country' => 'France',
            'title' => 'sm',
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
                ]),
            'budget' => 2
        ];

        $client->request('POST', '/api/roadtrip/create', $data);

        $this->assertResponseStatusCodeSame(400); 
        $this->assertStringContainsString('title', $client->getResponse()->getContent());
    }

    public function testCreateRoadtripWithBigTitle(): void
    {
        $client = static::createClient();
        $userRepository = static::getContainer()->get(UserRepository::class);
        $user = $userRepository->findOneBy(['email' => 'test@hotmail.com']);
        $client->loginUser($user);

        $data = [
            'country' => 'France',
            'title' => 'This is a very very very very very long title that should not be accepted by the form',
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
                ]),
            'budget' => 2
        ];

        $client->request('POST', '/api/roadtrip/create', $data);

        $this->assertResponseStatusCodeSame(400); 
        $this->assertStringContainsString('title', $client->getResponse()->getContent());
    }

    public function testCreateRoadtripWithMissingBudget(): void
    {
        $client = static::createClient();
        $userRepository = static::getContainer()->get(UserRepository::class);
        $user = $userRepository->findOneBy(['email' => 'test@hotmail.com']);
        $client->loginUser($user);

        $data = [
            'country' => 'France',
            'title' => 'Test Roadtrip',
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
            ]),
        ];

        $client->request('POST', '/api/roadtrip/create', $data);

        $this->assertResponseStatusCodeSame(400); 
        $this->assertStringContainsString('budget', $client->getResponse()->getContent());
    }

    public function testCreateRoadtripWithWrongBudget(): void
    {
        $client = static::createClient();
        $userRepository = static::getContainer()->get(UserRepository::class);
        $user = $userRepository->findOneBy(['email' => 'test@hotmail.com']);
        $client->loginUser($user);

        $data = [
            'country' => 'France',
            'budget' => 'wrong',
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
            ]),
        ];

        $client->request('POST', '/api/roadtrip/create', $data);

        $this->assertResponseStatusCodeSame(400); 
        $this->assertStringContainsString('budget', $client->getResponse()->getContent());
    }

    public function testCreateRoadtripWithMissingCountry(): void
    {
        $client = static::createClient();
        $userRepository = static::getContainer()->get(UserRepository::class);
        $user = $userRepository->findOneBy(['email' => 'test@hotmail.com']);
        $client->loginUser($user);

        $data = [
            'title' => 'France',
            'budget' => 1,
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

        $this->assertResponseStatusCodeSame(400); 
        $this->assertStringContainsString('country', $client->getResponse()->getContent());
    }

    public function testCreateRoadtripWithEmptyDaysAndRoads(): void
    {
        $client = static::createClient();
        $userRepository = static::getContainer()->get(UserRepository::class);
        $user = $userRepository->findOneBy(['email' => 'test@hotmail.com']);
        $client->loginUser($user);

        $data = [
            'title' => 'Test Roadtrip',
            'country' => 'France',
            'days' => '[]',
            'roads' => '[]',
            'budget' => 2
        ];

        $client->request('POST', '/api/roadtrip/create', $data);

        $this->assertResponseStatusCodeSame(400);
        $this->assertStringContainsString('roadtrip', $client->getResponse()->getContent());
    }

}
