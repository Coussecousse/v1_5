<?php

namespace App\DataFixtures;

use App\Entity\Tag;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class TagFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        $tags = [
            // Food and Drink Establishments
            ['name' => 'restaurant', 'category' => 'Food and Drink'],
            ['name' => 'cafe', 'category' => 'Food and Drink'],
            ['name' => 'pub', 'category' => 'Food and Drink'],
            ['name' => 'bar', 'category' => 'Food and Drink'],
            ['name' => 'fast_food', 'category' => 'Food and Drink'],
            ['name' => 'ice_cream', 'category' => 'Food and Drink'],
        
            // Accommodation
            ['name' => 'hotel', 'category' => 'Accommodation'],
            ['name' => 'hostel', 'category' => 'Accommodation'],
            ['name' => 'guest_house', 'category' => 'Accommodation'],
            ['name' => 'motel', 'category' => 'Accommodation'],
            ['name' => 'camp_site', 'category' => 'Accommodation'],
            ['name' => 'caravan_site', 'category' => 'Accommodation'],
            ['name' => 'chalet', 'category' => 'Accommodation'],
        
            // Attractions
            ['name' => 'attraction', 'category' => 'Attraction'],
            ['name' => 'theme_park', 'category' => 'Attraction'],
            ['name' => 'zoo', 'category' => 'Attraction'],
            ['name' => 'aquarium', 'category' => 'Attraction'],
            ['name' => 'museum', 'category' => 'Attraction'],
            ['name' => 'art_gallery', 'category' => 'Attraction'],
            ['name' => 'castle', 'category' => 'Attraction'],
            ['name' => 'monument', 'category' => 'Attraction'],
            ['name' => 'viewpoint', 'category' => 'Attraction'],
        
            // Nature and Outdoor Activities
            ['name' => 'park', 'category' => 'Nature and Outdoors'],
            ['name' => 'nature_reserve', 'category' => 'Nature and Outdoors'],
            ['name' => 'beach', 'category' => 'Nature and Outdoors'],
            ['name' => 'waterfall', 'category' => 'Nature and Outdoors'],
            ['name' => 'mountain_peak', 'category' => 'Nature and Outdoors'],
            ['name' => 'garden', 'category' => 'Nature and Outdoors'],
            ['name' => 'forest', 'category' => 'Nature and Outdoors'],
            ['name' => 'hiking_route', 'category' => 'Nature and Outdoors'],
            ['name' => 'lake', 'category' => 'Nature and Outdoors'],
        
            // Entertainment and Leisure
            ['name' => 'cinema', 'category' => 'Entertainment'],
            ['name' => 'theatre', 'category' => 'Entertainment'],
            ['name' => 'nightclub', 'category' => 'Entertainment'],
            ['name' => 'amusement_arcade', 'category' => 'Entertainment'],
            ['name' => 'sports_centre', 'category' => 'Entertainment'],
            ['name' => 'swimming_pool', 'category' => 'Entertainment'],
        
            // Shopping and Services
            ['name' => 'mall', 'category' => 'Shopping and Services'],
            ['name' => 'souvenir_shop', 'category' => 'Shopping and Services'],
            ['name' => 'tourist_information', 'category' => 'Shopping and Services'],
            ['name' => 'marketplace', 'category' => 'Shopping and Services'],
        
            // Cultural and Religious Sites
            ['name' => 'church', 'category' => 'Cultural and Religious'],
            ['name' => 'temple', 'category' => 'Cultural and Religious'],
            ['name' => 'mosque', 'category' => 'Cultural and Religious'],
            ['name' => 'historic_site', 'category' => 'Cultural and Religious'],
            ['name' => 'memorial', 'category' => 'Cultural and Religious'],
        
            // Other Tourism-Related Amenities
            ['name' => 'picnic_site', 'category' => 'Other'],
        ];        

        foreach ($tags as $tagData) {
            $tag = new Tag();
            $tag->setName($tagData['name']);
            $tag->setCategory($tagData['category']);
            $manager->persist($tag);
        }

        $manager->flush();
    }
}
