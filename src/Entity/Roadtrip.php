<?php

namespace App\Entity;

use App\Repository\RoadtripRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: RoadtripRepository::class)]
class Roadtrip
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 50)]
    private ?string $title = null;

    #[ORM\ManyToOne(inversedBy: 'roadtrip')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Country $country = null;

    /**
     * @var Collection<int, Pic>
     */
    #[ORM\OneToMany(targetEntity: Pic::class, mappedBy: 'roadtrip')]
    private Collection $pics;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $description = null;

    #[ORM\Column]
    private array $days = [];

    #[ORM\Column]
    private array $roads = [];

    #[ORM\ManyToOne(inversedBy: 'roadtrips')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $user = null;

    #[ORM\Column(nullable: true)]
    private ?int $budget = null;

    public function __construct()
    {
        $this->pics = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(string $title): static
    {
        $this->title = $title;

        return $this;
    }

    public function getCountry(): ?Country
    {
        return $this->country;
    }

    public function setCountry(?Country $country): static
    {
        $this->country = $country;

        return $this;
    }

    /**
     * @return Collection<int, Pic>
     */
    public function getPics(): Collection
    {
        return $this->pics;
    }

    public function addPic(Pic $pic): static
    {
        if (!$this->pics->contains($pic)) {
            $this->pics->add($pic);
            $pic->setRoadtrip($this);
        }

        return $this;
    }

    public function removePic(Pic $pic): static
    {
        if ($this->pics->removeElement($pic)) {
            // set the owning side to null (unless already changed)
            if ($pic->getRoadtrip() === $this) {
                $pic->setRoadtrip(null);
            }
        }

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;

        return $this;
    }

    public function getDays(): array
    {
        return $this->days;
    }

    public function setDays(array $days): static
    {
        $this->days = $days;

        return $this;
    }

    public function getRoads(): array
    {
        return $this->roads;
    }

    public function setRoads(array $roads): static
    {
        $this->roads = $roads;

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

    public function getBudget(): ?int
    {
        return $this->budget;
    }

    public function setBudget(int $budget): static
    {
        $this->budget = $budget;

        return $this;
    }
}
