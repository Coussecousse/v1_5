<?php

namespace App\Repository;

use App\Entity\Roadtrip;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Roadtrip>
 */
class RoadtripRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Roadtrip::class);
    }

    public function findRoadtripByFilters($country, $filter, $budget, $duration) {
        $qb = $this->createQueryBuilder('r');

        // Dynamically add conditions based on provided parameters
        if ($country) {
            $qb->join('r.country', 'c')
               ->andWhere('c = :country')
               ->setParameter('country', $country);
        }

        if ($filter) {
            if ($filter == 'mostOlder') {
                $qb->orderBy('r.createdAt', 'ASC');
            } else {
                $qb->orderBy('r.createdAt', 'DESC');
            }
        }

        if ($budget) {
            if ($budget == 'price_3') {
                $qb->andWhere('r.budget = 2');
            } elseif ($budget == 'price_4') {
                $qb->andWhere('r.budget = 3');
            } else if ($budget == 'price_2') {
                $qb->andWhere('r.budget = 1');
            }
        }

        $results = $qb->getQuery()->getResult();

        // Filter if duration
        if ($duration) {
            if ($duration == 'duration_3') {
                $results = array_filter($results, function($roadtrip) {
                    return count($roadtrip->getDays()) <= 14 && count($roadtrip->getDays()) > 7;
                });
            } elseif ($duration == 'duration_4') {
                $results = array_filter($results, function($roadtrip) {
                    return count($roadtrip->getDays()) > 14;
                });
            } else if ($duration == 'duration_2') {
                $results = array_filter($results, function($roadtrip) {
                    return count($roadtrip->getDays()) <= 7;
                });
            } 
        } 

        return array_values($results);
    }

//    /**
//     * @return Roadtrip[] Returns an array of Roadtrip objects
//     */
//    public function findByExampleField($value): array
//    {
//        return $this->createQueryBuilder('r')
//            ->andWhere('r.exampleField = :val')
//            ->setParameter('val', $value)
//            ->orderBy('r.id', 'ASC')
//            ->setMaxResults(10)
//            ->getQuery()
//            ->getResult()
//        ;
//    }

//    public function findOneBySomeField($value): ?Roadtrip
//    {
//        return $this->createQueryBuilder('r')
//            ->andWhere('r.exampleField = :val')
//            ->setParameter('val', $value)
//            ->getQuery()
//            ->getOneOrNullResult()
//        ;
//    }
}
