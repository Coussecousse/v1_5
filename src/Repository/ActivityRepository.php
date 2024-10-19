<?php

namespace App\Repository;

use App\Entity\Activity;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Activity>
 */
class ActivityRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Activity::class);
    }

    public function findOneByLngAndLat(float $lat, float $lng): array
    {
        return $this->createQueryBuilder('a')
            ->andWhere('a.lat = :lat')
            ->andWhere('a.lng = :lng')
            ->setParameter('lat', $lat)
            ->setParameter('lng', $lng)
            ->getQuery()
            ->getResult()
        ;
    }

    public function findWithinRadiusAndType(float $lat, float $lng, float $type): array
    {
        // The Haversine formula for distance in km
        // Allow to determine the distance of the great circle 
        // between two points on a sphere, 
        // from their longitudes and latitudes.
        $haversineFormula = "
            (6371 * acos(cos(radians(:latitude)) 
            * cos(radians(a.lat)) 
            * cos(radians(a.lng) - radians(:longitude)) 
            + sin(radians(:latitude)) 
            * sin(radians(a.lat))))
        ";

        $radius = 30; // 30 km

        return $this->createQueryBuilder('a')
            ->select('a')
            ->addSelect($haversineFormula . ' AS distance')
            ->having('distance < :radius')
            ->andWhere('a.type = :type')
            ->setParameter('latitude', $lat)
            ->setParameter('longitude', $lng)
            ->setParameter('radius', $radius)
            ->setParameter('type', $type)
            ->orderBy('distance', 'ASC')
            ->getQuery()
            ->getResult();
    }

//    /**
//     * @return Activity[] Returns an array of Activity objects
//     */
//    public function findByExampleField($value): array
//    {
//        return $this->createQueryBuilder('a')
//            ->andWhere('a.exampleField = :val')
//            ->setParameter('val', $value)
//            ->orderBy('a.id', 'ASC')
//            ->setMaxResults(10)
//            ->getQuery()
//            ->getResult()
//        ;
//    }

//    public function findOneBySomeField($value): ?Activity
//    {
//        return $this->createQueryBuilder('a')
//            ->andWhere('a.exampleField = :val')
//            ->setParameter('val', $value)
//            ->getQuery()
//            ->getOneOrNullResult()
//        ;
//    }
}
