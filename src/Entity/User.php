<?php

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\UniqueConstraint(name: 'UNIQ_IDENTIFIER_EMAIL', fields: ['email'])]
#[UniqueEntity(fields: ['email'], message: 'Cette adresse email est déjà utilisée.')]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 180)]
    private ?string $email = null;

    /**
     * @var list<string> The user roles
     */
    #[ORM\Column]
    private array $roles = [];

    /**
     * @var string The hashed password
     */
    #[ORM\Column]
    private ?string $password = null;

    #[ORM\Column(length: 50)]
    private ?string $username = null;

    #[ORM\OneToOne(mappedBy: 'user', cascade: ['persist', 'remove'])]
    private ?ProfilWarning $profilWarning = null;

    #[ORM\Column]
    private bool $isVerified = false;

    #[ORM\OneToOne(mappedBy: 'user', cascade: ['persist', 'remove'], orphanRemoval: true)]
    private ?Token $token = null;

    /**
     * @var Collection<int, Activity>
     */
    #[ORM\ManyToMany(targetEntity: Activity::class, mappedBy: 'users')]
    private Collection $activities;

    #[ORM\OneToMany(mappedBy: 'user', targetEntity: Pic::class, cascade: ['persist', 'remove'])]
    private Collection $pics;

    /**
     * @var Collection<int, Description>
     */
    #[ORM\OneToMany(targetEntity: Description::class, mappedBy: 'user', orphanRemoval: true)]
    private Collection $descriptions;

    #[ORM\Column(length: 255)]
    private ?string $uid = null;

    /**
     * @var Collection<int, Roadtrip>
     */
    #[ORM\OneToMany(targetEntity: Roadtrip::class, mappedBy: 'user', orphanRemoval: true)]
    private Collection $roadtrips;

    /**
     * @var Collection<int, Roadtrip>
     */
    #[ORM\ManyToMany(targetEntity: Roadtrip::class, mappedBy: 'favorite')]
    private Collection $favoriteRoadtrips;

    /**
     * @var Collection<int, Activity>
     */
    #[ORM\ManyToMany(targetEntity: Activity::class, mappedBy: 'favorite')]
    private Collection $favoriteActivities;

    public function __construct()
    {
        $this->uid = uniqid();
        $this->activities = new ArrayCollection();
        $this->descriptions = new ArrayCollection();
        $this->roadtrips = new ArrayCollection();
        $this->favoriteRoadtrips = new ArrayCollection();
        $this->favoriteActivities = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;

        return $this;
    }

    /**
     * A visual identifier that represents this user.
     *
     * @see UserInterface
     */
    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }

    /**
     * @see UserInterface
     * @return list<string>
     */
    public function getRoles(): array
    {
        $roles = $this->roles;
        // guarantee every user at least has ROLE_USER
        $roles[] = 'ROLE_USER';

        return array_unique($roles);
    }

    /**
     * @param list<string> $roles
     */
    public function setRoles(array $roles): static
    {
        $this->roles = $roles;

        return $this;
    }

    /**
     * @see PasswordAuthenticatedUserInterface
     */
    public function getPassword(): string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;

        return $this;
    }

    /**
     * @see UserInterface
     */
    public function eraseCredentials(): void
    {
        // If you store any temporary, sensitive data on the user, clear it here
        // $this->plainPassword = null;
    }

    public function getUsername(): ?string
    {
        return $this->username;
    }

    public function setUsername(string $username): static
    {
        $this->username = $username;

        return $this;
    }

    public function getProfilWarning(): ?ProfilWarning
    {
        return $this->profilWarning;
    }

    public function setProfilWarning(ProfilWarning $profilWarning): static
    {
        // set the owning side of the relation if necessary
        if ($profilWarning->getUser() !== $this) {
            $profilWarning->setUser($this);
        }

        $this->profilWarning = $profilWarning;

        return $this;
    }

    public function isVerified(): bool
    {
        return $this->isVerified;
    }

    public function setVerified(bool $isVerified): static
    {
        $this->isVerified = $isVerified;

        return $this;
    }

    public function getToken(): ?Token
    {
        return $this->token;
    }

    public function setToken(Token $token): static
    {
        // set the owning side of the relation if necessary
        if ($token->getUser() !== $this) {
            $token->setUser($this);
        }

        $this->token = $token;

        return $this;
    }

    /**
     * @return Collection<int, Activity>
     */
    public function getActivities(): Collection
    {
        return $this->activities;
    }

    public function addActivity(Activity $activity): self
    {
        if (!$this->activities->contains($activity)) {
            $this->activities[] = $activity;
            $activity->addUser($this);
        }

        return $this;
    }

    public function removeActivity(Activity $activity): self
    {
        if ($this->activities->removeElement($activity)) {
            $activity->removeUser($this); // Ensure the reverse side is set
        }

        return $this;
    }

    public function getPics(): Collection
    {
        return $this->pics;
    }

    public function addPic(Pic $pic): self
    {
        if (!$this->pics->contains($pic)) {
            $this->pics[] = $pic;
            $pic->setUser($this);
        }

        return $this;
    }

    public function removePic(Pic $pic): self
    {
        if ($this->pics->contains($pic)) {
            $this->pics->removeElement($pic);
            if ($pic->getUser() === $this) {
                $pic->setUser(null);
            }
        }

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
            $description->setUser($this);
        }

        return $this;
    }

    public function removeDescription(Description $description): static
    {
        if ($this->descriptions->removeElement($description)) {
            // set the owning side to null (unless already changed)
            if ($description->getUser() === $this) {
                $description->setUser(null);
            }
        }

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
     * @return Collection<int, Roadtrip>
     */
    public function getRoadtrips(): Collection
    {
        return $this->roadtrips;
    }

    public function addRoadtrip(Roadtrip $roadtrip): static
    {
        if (!$this->roadtrips->contains($roadtrip)) {
            $this->roadtrips->add($roadtrip);
            $roadtrip->setUser($this);
        }

        return $this;
    }

    public function removeRoadtrip(Roadtrip $roadtrip): static
    {
        if ($this->roadtrips->removeElement($roadtrip)) {
            // set the owning side to null (unless already changed)
            if ($roadtrip->getUser() === $this) {
                $roadtrip->setUser(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Roadtrip>
     */
    public function getFavoriteRoadtrips(): Collection
    {
        return $this->favoriteRoadtrips;
    }

    public function addFavoriteRoadtrip(Roadtrip $favoriteRoadtrip): static
    {
        if (!$this->favoriteRoadtrips->contains($favoriteRoadtrip)) {
            $this->favoriteRoadtrips->add($favoriteRoadtrip);
            $favoriteRoadtrip->addFavorite($this);
        }

        return $this;
    }

    public function removeFavoriteRoadtrip(Roadtrip $favoriteRoadtrip): static
    {
        if ($this->favoriteRoadtrips->removeElement($favoriteRoadtrip)) {
            $favoriteRoadtrip->removeFavorite($this);
        }

        return $this;
    }

    /**
     * @return Collection<int, Activity>
     */
    public function getFavoriteActivities(): Collection
    {
        return $this->favoriteActivities;
    }

    public function addFavoriteActivity(Activity $favoriteActivity): static
    {
        if (!$this->favoriteActivities->contains($favoriteActivity)) {
            $this->favoriteActivities->add($favoriteActivity);
            $favoriteActivity->addFavorite($this);
        }

        return $this;
    }

    public function removeFavoriteActivity(Activity $favoriteActivity): static
    {
        if ($this->favoriteActivities->removeElement($favoriteActivity)) {
            $favoriteActivity->removeFavorite($this);
        }

        return $this;
    }
}
