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

    #[ORM\Column(length: 255)]
    private ?string $display_name = null;

    #[ORM\ManyToMany(targetEntity: User::class, inversedBy: 'activities')]
    private Collection $users;

    /**
     * @var Collection<int, Pic>
     */
    #[ORM\OneToMany(targetEntity: Pic::class, mappedBy: 'activity')]
    private Collection $pics;

    #[ORM\ManyToOne(inversedBy: 'activity')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Country $country = null;

    #[ORM\Column(length: 255)]
    private ?string $uid = null;

    /**
     * @var Collection<int, Description>
     */
    #[ORM\OneToMany(targetEntity: Description::class, mappedBy: 'activity', orphanRemoval: true)]
    private Collection $descriptions;

    /**
     * @var Collection<int, User>
     */
    #[ORM\ManyToMany(targetEntity: User::class, inversedBy: 'favoriteActivities')]
    #[ORM\JoinTable(name: "activity_favorite_user")]
    private Collection $favorite;

    public function __construct()
    {
        $this->uid = uniqid();
        $this->pics = new ArrayCollection();
        $this->descriptions = new ArrayCollection();
        $this->users = new ArrayCollection();
        $this->favorite = new ArrayCollection();
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

    public function getDisplayName(): ?string
    {
        return $this->display_name;
    }

    public function setDisplayName(string $display_name): static
    {
        $this->display_name = $display_name;

        return $this;
    }

    public function getUsers(): Collection
    {
        return $this->users;
    }

    public function addUser(User $user): self
    {
        if (!$this->users->contains($user)) {
            $this->users[] = $user;
        }

        return $this;
    }

    public function removeUser(User $user): self
    {
        $this->users->removeElement($user);

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
            $pic->setActivity($this);
        }

        return $this;
    }

    public function removePic(Pic $pic): static
    {
        if ($this->pics->removeElement($pic)) {
            // set the owning side to null (unless already changed)
            if ($pic->getActivity() === $this) {
                $pic->setActivity(null);
            }
        }

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

    public function getUid(): ?string
    {
        return $this->uid;
    }

    public function setUid(string $uid): static
    {
        $this->uid = $uid;

        return $this;
    }

    /**
     * @return Collection<int, Description>
     */
    public function getDescriptions(): Collection
    {
        return $this->descriptions;
    }

    public function addDescription(Description $description): static
    {
        if (!$this->descriptions->contains($description)) {
            $this->descriptions->add($description);
            $description->setActivity($this);
        }

        return $this;
    }

    public function removeDescription(Description $description): static
    {
        if ($this->descriptions->removeElement($description)) {
            // set the owning side to null (unless already changed)
            if ($description->getActivity() === $this) {
                $description->setActivity(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, User>
     */
    public function getFavorite(): Collection
    {
        return $this->favorite;
    }

    public function addFavorite(User $favorite): static
    {
        if (!$this->favorite->contains($favorite)) {
            $this->favorite->add($favorite);
        }

        return $this;
    }

    public function removeFavorite(User $favorite): static
    {
        $this->favorite->removeElement($favorite);

        return $this;
    }
}
