<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Ladder;
use App\Models\Inspection;
use App\Models\LocationInspectorMapping;
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
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'role' => 'admin',
            ]
        );

        $inspector1 = User::firstOrCreate(
            ['email' => 'inspector@example.com'],
            [
                'name' => 'Alvian Hadi R (EHS Zona 1)',
                'password' => Hash::make('password'),
                'role' => 'inspector',
            ]
        );

        $inspector2 = User::firstOrCreate(
            ['email' => 'inspector2@example.com'],
            [
                'name' => 'Budi Santoso (EHS Zona 2)',
                'password' => Hash::make('password'),
                'role' => 'inspector',
            ]
        );

        $picSafety = User::firstOrCreate(
            ['email' => 'pic@example.com'],
            [
                'name' => 'PIC Safety Plant ME-FAL',
                'password' => Hash::make('password'),
                'role' => 'pic_safety',
            ]
        );

        // Location mappings
        LocationInspectorMapping::firstOrCreate(
            ['location_name' => 'Plant Area ME-FAL'],
            ['inspector_id' => $inspector1->id]
        );

        LocationInspectorMapping::firstOrCreate(
            ['location_name' => 'Gudang A - Rak 4'],
            ['inspector_id' => $inspector1->id]
        );

        LocationInspectorMapping::firstOrCreate(
            ['location_name' => 'Workshop Maintenance'],
            ['inspector_id' => $inspector2->id]
        );

        LocationInspectorMapping::firstOrCreate(
            ['location_name' => 'Area Boiler & Utility'],
            ['inspector_id' => $inspector2->id]
        );

        // Sample ladder
        $ladder = Ladder::firstOrCreate(
            ['identifier' => 'Portable - Plant Area ME-FAL - PT Wilmar - 001'],
            [
                'location' => 'Plant Area ME-FAL',
                'type' => 'portable',
                'owner_name' => 'PT Wilmar',
                'responsible_name' => 'Desy Nanda',
                'max_load' => 150.00,
                'inspector_id' => $inspector1->id,
                'description' => 'Tangga portabel aluminium area maintenance',
            ]
        );

        // Sample Inspection (approved)
        Inspection::firstOrCreate(
            ['ladder_id' => $ladder->id],
            [
                'inspector_id' => $inspector1->id,
                'submitted_by_id' => $picSafety->id,
                'reviewed_by_id' => $inspector1->id,
                'status' => 'safe',
                'workflow_status' => 'approved',
                'checklist' => [
                    'inspection_type' => 'portable',
                    'kondisi_anak_tangga' => true,
                    'kondisi_batang_samping' => true,
                    'sepatu_karet_anti_slip' => true,
                    'engsel_dan_pengunci' => true,
                    'label_beban_peringatan' => true,
                ],
                'review_data' => [
                    'kondisi_anak_tangga' => ['decision' => 'approved', 'comment' => 'Kondisi baik'],
                    'kondisi_batang_samping' => ['decision' => 'approved', 'comment' => 'Kondisi baik'],
                    'sepatu_karet_anti_slip' => ['decision' => 'approved', 'comment' => 'Kondisi baik'],
                    'engsel_dan_pengunci' => ['decision' => 'approved', 'comment' => 'Kondisi baik'],
                    'label_beban_peringatan' => ['decision' => 'approved', 'comment' => 'Kondisi baik'],
                ],
                'valid_until' => Carbon::now()->addDays(365), // 1 tahun
                'approved_at' => Carbon::now(),
                'notes' => 'Telah diperiksa dan memenuhi standar K3.',
            ]
        );
    }
}
