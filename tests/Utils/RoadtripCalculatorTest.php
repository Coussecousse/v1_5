<?php

namespace App\tests\Utils;

use App\Utils\RoadtripCalculator;
use PHPUnit\Framework\TestCase;

class RoadtripCalculatorTest extends TestCase
{
    private RoadtripCalculator $calculator;

    protected function setUp(): void
    {
        $this->calculator = new RoadtripCalculator();
    }    

    public function testCalculatorNumberOfDays(): void
    {
        $roads = [
            [
                ['routes' => [['distance' => 100]]],
                ['routes' => [['distance' => 200]]]
            ],
            [
                ['routes' => [['distance' => 300]]],
                ['routes' => [['distance' => 400]]]
            ], 
            [
                ['routes' => [['distance' => 500]]],
            ]
        ];

        $this->assertEquals(3, $this->calculator->calculateNumberOfDays($roads));
        $this->assertEquals(0, $this->calculator->calculateNumberOfDays([]));
    }

    public function testCalculateTotalDistance(): void
    {
        $roads = [
            [ 
                ['routes' => [ ['distance' => 1000] ]] 
            ],
            [
                ['routes' => [ ['distance' => 2000] ]],
                ['routes' => [ ['distance' => 500] ]]
            ]
        ];
        $this->assertEquals(3500, $this->calculator->calculateTotalDistance($roads));
        $this->assertEquals(0, $this->calculator->calculateTotalDistance([]));
    }

    public function testFormatDuration(): void
    {
        // Less than an hour
        $this->assertEquals('20 min', $this->calculator->formatDuration(1200)); 

        // More than an hour
        $this->assertEquals('1h1 min', $this->calculator->formatDuration(3660)); 
        $this->assertEquals('2h0 min', $this->calculator->formatDuration(7200)); 
    }
}

