<?php

namespace Tests\Feature;

use App\Models\Ladder;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InspectionRedirectTest extends TestCase
{
    use RefreshDatabase;

    public function test_inspection_submit_redirects_back_to_detail_when_requested(): void
    {
        $user = User::factory()->create();
        $ladder = Ladder::factory()->create();

        $response = $this->actingAs($user)->post(route('inspections.store', $ladder->uuid), [
            'status' => 'safe',
            'checklist' => [
                'kaki_karet_anti_slip' => true,
                'engsel_pengunci' => true,
                'anak_tangga_kokoh' => true,
                'label_peringatan_jelas' => true,
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

        $response = $this->actingAs($user)->post(route('inspections.store', $ladder->uuid), [
            'status' => 'unsafe',
            'checklist' => [
                'kaki_karet_anti_slip' => false,
                'engsel_pengunci' => false,
                'anak_tangga_kokoh' => false,
                'label_peringatan_jelas' => false,
            ],
            'notes' => 'Perlu tindakan',
        ]);

        $response->assertRedirect(route('dashboard', absolute: false));
    }
}
