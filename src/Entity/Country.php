<?php

namespace App\Entity;

use App\Repository\CountryRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: CountryRepository::class)]
class Country
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 50)]
    private ?string $name = null;

    /**
     * @var Collection<int, Activity>
     */
    #[ORM\OneToMany(targetEntity: Activity::class, mappedBy: 'country')]
    private Collection $activity;

    /**
     * @var Collection<int, Roadtrip>
     */
    #[ORM\OneToMany(targetEntity: Roadtrip::class, mappedBy: 'country')]
    private Collection $roadtrip;

    public function __construct()
    {
        $this->activity = new ArrayCollection();
        $this->roadtrip = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;

        return $this;
    }

    /**
     * @return Collection<int, Activity>
     */
    public function getActivity(): Collection
    {
        return $this->activity;
    }

    public function addActivity(Activity $activity): static
    {
        if (!$this->activity->contains($activity)) {
            $this->activity->add($activity);
            $activity->setCountry($this);
        }

        return $this;
    }

    public function removeActivity(Activity $activity): static
    {
        if ($this->activity->removeElement($activity)) {
            // set the owning side to null (unless already changed)
            if ($activity->getCountry() === $this) {
                $activity->setCountry(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Roadtrip>
     */
    public function getRoadtrip(): Collection
    {
        return $this->roadtrip;
    }

    public function addRoadtrip(Roadtrip $roadtrip): static
    {
        if (!$this->roadtrip->contains($roadtrip)) {
            $this->roadtrip->add($roadtrip);
            $roadtrip->setCountry($this);
        }

        return $this;
    }

    public function removeRoadtrip(Roadtrip $roadtrip): static
    {
        if ($this->roadtrip->removeElement($roadtrip)) {
            // set the owning side to null (unless already changed)
            if ($roadtrip->getCountry() === $this) {
                $roadtrip->setCountry(null);
            }
        }

        return $this;
    }

}
