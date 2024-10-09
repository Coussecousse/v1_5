<?php

namespace App\Entity;

use App\Repository\ActivityRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ActivityRepository::class)]
class Activity
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column]
    private ?float $lng = null;

    #[ORM\Column]
    private ?float $lat = null;

    #[ORM\ManyToOne(inversedBy: 'activities')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Tag $type = null;

    /**
     * @var Collection<int, ActivityPic>
     */
    #[ORM\OneToMany(targetEntity: ActivityPic::class, mappedBy: 'activity', orphanRemoval: true)]
    private Collection $pic;

    #[ORM\Column(type: Types::TEXT)]
    private ?string $description = null;

    #[ORM\Column(length: 255)]
    private ?string $display_name = null;

    #[ORM\ManyToOne(inversedBy: 'activities')]
    private ?User $user = null;

    public function __construct()
    {
        $this->pic = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getLng(): ?float
    {
        return $this->lng;
    }

    public function setLng(float $lng): static
    {
        $this->lng = $lng;

        return $this;
    }

    public function getLat(): ?float
    {
        return $this->lat;
    }

    public function setLat(float $lat): static
    {
        $this->lat = $lat;

        return $this;
    }

    public function getType(): ?Tag
    {
        return $this->type;
    }

    public function setType(?Tag $type): static
    {
        $this->type = $type;

        return $this;
    }

    /**
     * @return Collection<int, ActivityPic>
     */
    public function getPic(): Collection
    {
        return $this->pic;
    }

    public function addPic(ActivityPic $pic): static
    {
        if (!$this->pic->contains($pic)) {
            $this->pic->add($pic);
            $pic->setActivity($this);
        }

        return $this;
    }

    public function removePic(ActivityPic $pic): static
    {
        if ($this->pic->removeElement($pic)) {
            // set the owning side to null (unless already changed)
            if ($pic->getActivity() === $this) {
                $pic->setActivity(null);
            }
        }

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(string $description): static
    {
        $this->description = $description;

        return $this;
    }

    public function getDisplayName(): ?string
    {
        return $this->display_name;
    }

    public function setDisplayName(string $display_name): static
    {
        $this->display_name = $display_name;

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
}
