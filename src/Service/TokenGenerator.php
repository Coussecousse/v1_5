<?php

namespace App\Service;

use Ramsey\Uuid\Uuid;

class TokenGenerator
{
    public function generate(): string
    {
        // Generate a UUID as a token
        return Uuid::uuid4()->toString();
    }
}
