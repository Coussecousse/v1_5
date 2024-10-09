<?php

namespace App\Repository;

use App\Entity\Tag;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class TagRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Tag::class);
    }

    /**
     * Finds tags by a partial name match.
     */
    public function findTagsByName(string $name): array
    {
        return $this->createQueryBuilder('t')
            ->where('t.name LIKE :name')
            ->setParameter('name', '%' . $name . '%')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult();
    }
}
