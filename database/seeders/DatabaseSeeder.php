<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Ladder;
use App\Models\Inspection;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        $inspector = User::create([
            'name' => 'Inspector Bob',
            'email' => 'inspector@example.com',
            'password' => Hash::make('password'),
            'role' => 'inspector',
        ]);

        $ladder = Ladder::create([
            'location' => 'Warehouse A - Section 4',
            'type' => 'Extension Ladder',
            'description' => 'Tall extension ladder for high racks',
        ]);

        Inspection::create([
            'ladder_id' => $ladder->id,
            'inspector_id' => $inspector->id,
            'status' => 'safe',
            'checklist' => ['rubber_feet' => true, 'hinges' => true, 'steps' => true, 'labels' => true],
            'valid_until' => Carbon::now()->addDays(30),
            'notes' => 'Looking good.',
        ]);
    }
}
