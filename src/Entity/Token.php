<?php

namespace App\Entity;

use App\Repository\TokenRepository;
use App\Service\TokenGenerator;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: TokenRepository::class)]
class Token
{
    function __construct()
    {
        $this->ExpiresAt = new \DateTimeImmutable('+1 week');

        $tokenGenerator = new TokenGenerator();
        $this->token = $tokenGenerator->generate();
    }

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $token = null;

    #[ORM\OneToOne(inversedBy: 'token')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $user = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $ExpiresAt = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getToken(): ?string
    {
        return $this->token;
    }

    public function setToken(string $token): static
    {
        $this->token = $token;

        return $this;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(User $user): static
    {
        $this->user = $user;

        return $this;
    }

    public function getExpiresAt(): ?\DateTimeImmutable
    {
        return $this->ExpiresAt;
    }

    public function setExpiresAt(\DateTimeImmutable $ExpiresAt): static
    {
        $this->ExpiresAt = $ExpiresAt;

        return $this;
    }
}
