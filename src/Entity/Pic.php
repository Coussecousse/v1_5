<?php

namespace App\Entity;

use App\Repository\PicRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: PicRepository::class)]
class Pic
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $path = null;

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'pics', cascade: ['persist', 'remove'])]
    private ?User $user = null;

    #[ORM\ManyToOne(inversedBy: 'pics')]
    private ?Activity $activity = null;

    #[ORM\ManyToOne(inversedBy: 'pics')]
    private ?Roadtrip $roadtrip = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getPath(): ?string
    {
        return $this->path;
    }

    public function setPath(string $path): static
    {
        $this->path = $path;

        return $this;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;

        return $this;
    }

    public function getActivity(): ?Activity
    {
        return $this->activity;
    }

    public function setActivity(?Activity $activity): static
    {
        $this->activity = $activity;

        return $this;
    }

    public function getRoadtrip(): ?Roadtrip
    {
        return $this->roadtrip;
    }

    public function setRoadtrip(?Roadtrip $roadtrip): static
    {
        $this->roadtrip = $roadtrip;

        return $this;
    }

}
