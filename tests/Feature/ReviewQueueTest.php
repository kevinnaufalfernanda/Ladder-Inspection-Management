<?php

namespace Tests\Feature;

use App\Models\Inspection;
use App\Models\Ladder;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReviewQueueTest extends TestCase
{
    use RefreshDatabase;

    public function test_pic_safety_cannot_access_review_queue(): void
    {
        $pic = User::factory()->create(['role' => 'pic_safety']);

        $response = $this->actingAs($pic)->get(route('inspections.review.queue'));

        $response->assertStatus(403);
    }

    public function test_inspector_can_view_all_inspection_statuses_in_review_queue(): void
    {
        $inspector = User::factory()->create(['role' => 'inspector']);
        $pic = User::factory()->create(['role' => 'pic_safety']);

        $ladder1 = Ladder::factory()->create(['type' => 'portable', 'location' => 'Area Alfa']);
        $ladder2 = Ladder::factory()->create(['type' => 'permanent', 'location' => 'Area Beta']);
        $ladder3 = Ladder::factory()->create(['type' => 'portable', 'location' => 'Area Gamma']);

        // 1. Pending review
        Inspection::create([
            'ladder_id' => $ladder1->id,
            'user_id' => $pic->id,
            'inspector_id' => $inspector->id,
            'workflow_status' => 'pending_review',
            'status' => 'unsafe',
            'checklist' => ['label_kapasitas_terbaca' => 1],
        ]);

        // 2. Approved (Sudah di-ACC)
        Inspection::create([
            'ladder_id' => $ladder2->id,
            'user_id' => $pic->id,
            'inspector_id' => $inspector->id,
            'workflow_status' => 'approved',
            'status' => 'safe',
            'reviewed_by_id' => $inspector->id,
            'checklist' => ['climbing_sambungan_longgar' => 1],
        ]);

        // 3. Needs correction (Temuan reject)
        Inspection::create([
            'ladder_id' => $ladder3->id,
            'user_id' => $pic->id,
            'inspector_id' => $inspector->id,
            'workflow_status' => 'needs_correction',
            'status' => 'unsafe',
            'reviewed_by_id' => $inspector->id,
            'checklist' => ['label_kapasitas_terbaca' => 0],
        ]);

        $response = $this->actingAs($inspector)->get(route('inspections.review.queue'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Inspections/ReviewQueue')
            ->has('inspections', 3)
        );
    }

    public function test_inspector_can_recheck_an_approved_inspection(): void
    {
        $inspector = User::factory()->create(['role' => 'inspector']);
        $pic = User::factory()->create(['role' => 'pic_safety']);
        $ladder = Ladder::factory()->create(['type' => 'portable']);

        $inspection = Inspection::create([
            'ladder_id' => $ladder->id,
            'user_id' => $pic->id,
            'inspector_id' => $inspector->id,
            'workflow_status' => 'approved',
            'status' => 'safe',
            'reviewed_by_id' => $inspector->id,
            'checklist' => [
                'label_kapasitas_terbaca' => 1,
            ],
            'review_data' => [
                'label_kapasitas_terbaca' => [
                    'decision' => 'approved',
                    'comment' => null,
                ],
            ],
        ]);

        $response = $this->actingAs($inspector)->get(route('inspections.review', $inspection->id));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Inspections/Review')
            ->has('inspection')
        );
    }

    public function test_review_page_returns_all_checklist_items_even_on_partial_update(): void
    {
        $inspector = User::factory()->create(['role' => 'inspector']);
        $pic = User::factory()->create(['role' => 'pic_safety']);
        $ladder = Ladder::factory()->create(['type' => 'portable']);

        $inspection = Inspection::create([
            'ladder_id' => $ladder->id,
            'user_id' => $pic->id,
            'inspector_id' => $inspector->id,
            'workflow_status' => 'pending_review',
            'status' => 'unsafe',
            'checklist' => [
                'updated_keys' => ['jauh_dari_listrik', 'menjulur_minimal_1m_landing'],
            ],
            'review_data' => [
                'label_kapasitas_terbaca' => ['decision' => 'approved', 'comment' => null],
            ],
        ]);

        $response = $this->actingAs($inspector)->get(route('inspections.review', $inspection->id));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Inspections/Review')
            ->has('inspection.items', 25)
            ->where('inspection.is_partial_update', true)
            ->where('inspection.updated_items_count', 2)
        );
    }
}
