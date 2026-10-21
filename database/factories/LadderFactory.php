<?php

namespace Database\Factories;

use App\Models\Ladder;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Ladder>
 */
class LadderFactory extends Factory
{
    protected $model = Ladder::class;

    public function definition(): array
    {
        return [
            'uuid' => (string) Str::uuid(),
            'location' => $this->faker->city(),
            'type' => $this->faker->randomElement([
                'Tangga Aluminium',
                'Tangga Fiberglass',
                'Tangga Steel',
            ]),
            'description' => $this->faker->sentence(),
        ];
    }
}
