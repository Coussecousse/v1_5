<?php

namespace App\Utils;

class RoadtripCalculator
{
    public function calculateNumberOfDays(array $roads): int
    {
        return count($roads);
    }

    public function calculateTotalDistance(array $roads): float
    {
        $distance = 0;
        foreach ($roads as $day) {
            foreach($day as $road) {
                $distance += $road['routes'][0]['distance'];
            }
        }
        return $distance;
    }


    public function formatDuration(int $durationSeconds):string
    {
        if ($durationSeconds >= 3600) {
            $hours = floor($durationSeconds / 3600);
            $minutes = floor(($durationSeconds / 60) % 60);
            return "{$hours}h{$minutes} min";
        } else {
            $minutes = floor($durationSeconds / 60);
            return "{$minutes} min";
        }
    }
}
