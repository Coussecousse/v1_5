<?php

namespace App\Service;

use Imagine\Gd\Imagine;
use Imagine\Image\Box;
use Imagine\Image\ManipulatorInterface;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class ImageOptimizer
{
    private const SIZES = [
        'small' => 420,
        'medium' => 735,
        'large' => 950,
        'extraLarge' => 1200,
    ];

    private Imagine $imagine;

    public function __construct()
    {
        $this->imagine = new Imagine();
    }

    public function processAndResizeFile(UploadedFile $file, string $folderName, ?string $newFilename = null): string
    {
        $fileExtension = $file->guessExtension() ?? $file->getClientOriginalExtension();
        $baseFilename = uniqid() . '.' . $fileExtension;

        // Create resized versions directly
        foreach (self::SIZES as $key => $maxWidth) {
            $sizeFolder = "{$folderName}/{$key}";
            $resizedPath = "{$sizeFolder}/{$baseFilename}";

            // Resize and save directly to the target location
            $this->resize($file->getPathname(), $resizedPath, $maxWidth);
        }

        return $baseFilename; 
    }

    private function resize(string $source, string $destination, int $maxWidth): void
    {
        [$originalWidth, $originalHeight] = getimagesize($source);
        $aspectRatio = $originalWidth / $originalHeight;

        $maxHeight = $maxWidth / $aspectRatio;

        $image = $this->imagine->open($source);
        $image->resize(new Box((int)$maxWidth, (int)$maxHeight))->save($destination);
    }
}
