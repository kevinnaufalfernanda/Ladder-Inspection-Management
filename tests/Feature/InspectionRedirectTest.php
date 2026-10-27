<?php

namespace Tests\Feature;

use App\Models\Ladder;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class InspectionRedirectTest extends TestCase
{
    use RefreshDatabase;

    public function test_inspection_submit_redirects_back_to_detail_when_requested(): void
    {
        $user = User::factory()->create();
        $ladder = Ladder::factory()->create();
        Storage::fake('public');

        $response = $this->actingAs($user)->post(route('inspections.store', $ladder->uuid), [
            'status' => 'safe',
            'inspection_type' => 'portable',
            'checklist' => [
                'kaki_karet_anti_slip' => true,
                'engsel_pengunci' => true,
                'anak_tangga_kokoh' => true,
                'label_peringatan_jelas' => true,
            ],
            'photos' => [
                'kaki_karet_anti_slip' => UploadedFile::fake()->create('kaki.jpg', 100, 'image/jpeg'),
                'engsel_pengunci' => UploadedFile::fake()->create('engsel.jpg', 100, 'image/jpeg'),
                'anak_tangga_kokoh' => UploadedFile::fake()->create('anak-tangga.jpg', 100, 'image/jpeg'),
                'label_peringatan_jelas' => UploadedFile::fake()->create('label.jpg', 100, 'image/jpeg'),
            ],
            'notes' => 'Semua aman',
            'return_to' => 'detail',
        ]);

        $response->assertRedirect(route('ladders.show', $ladder->uuid, false));
    }

    public function test_inspection_submit_redirects_back_to_dashboard_by_default(): void
    {
        $user = User::factory()->create();
        $ladder = Ladder::factory()->create();
        Storage::fake('public');

        $response = $this->actingAs($user)->post(route('inspections.store', $ladder->uuid), [
            'status' => 'unsafe',
            'inspection_type' => 'portable',
            'checklist' => [
                'kaki_karet_anti_slip' => true,
                'engsel_pengunci' => true,
                'anak_tangga_kokoh' => true,
                'label_peringatan_jelas' => true,
            ],
            'photos' => [
                'kaki_karet_anti_slip' => UploadedFile::fake()->create('kaki.jpg', 100, 'image/jpeg'),
                'engsel_pengunci' => UploadedFile::fake()->create('engsel.jpg', 100, 'image/jpeg'),
                'anak_tangga_kokoh' => UploadedFile::fake()->create('anak-tangga.jpg', 100, 'image/jpeg'),
                'label_peringatan_jelas' => UploadedFile::fake()->create('label.jpg', 100, 'image/jpeg'),
            ],
            'notes' => 'Perlu tindakan',
        ]);

        $response->assertRedirect(route('dashboard', absolute: false));
    }
}
