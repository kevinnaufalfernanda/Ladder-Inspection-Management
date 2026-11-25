<?php

namespace Tests\Feature;

use App\Models\LocationInspectorMapping;
use App\Models\SystemSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_pic_safety_cannot_access_settings_index(): void
    {
        $pic = User::factory()->create(['role' => 'pic_safety']);

        $response = $this->actingAs($pic)->get(route('settings.index'));

        $response->assertStatus(403);
    }

    public function test_inspector_can_access_settings_index(): void
    {
        $inspector = User::factory()->create(['role' => 'inspector']);

        $response = $this->actingAs($inspector)->get(route('settings.index'));

        $response->assertStatus(200);
    }

    public function test_can_update_general_settings(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->post(route('settings.general.update'), [
            'validity_period_days' => 180,
            'expiry_warning_days' => 14,
            'require_photos_per_item' => false,
            'auto_assign_inspector' => true,
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertEquals(180, SystemSetting::get('validity_period_days'));
        $this->assertEquals(14, SystemSetting::get('expiry_warning_days'));
        $this->assertFalse(SystemSetting::get('require_photos_per_item'));
    }

    public function test_can_store_update_and_delete_location_mapping(): void
    {
        $inspector = User::factory()->create(['role' => 'inspector']);

        // Store
        $response = $this->actingAs($inspector)->post(route('settings.locations.store'), [
            'location_name' => 'Plant Area Test',
            'inspector_id' => $inspector->id,
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('location_inspector_mappings', [
            'location_name' => 'Plant Area Test',
            'inspector_id' => $inspector->id,
        ]);

        $mapping = LocationInspectorMapping::where('location_name', 'Plant Area Test')->first();

        // Update
        $responseUpdate = $this->actingAs($inspector)->put(route('settings.locations.update', $mapping->id), [
            'location_name' => 'Plant Area Test Renamed',
            'inspector_id' => $inspector->id,
        ]);

        $responseUpdate->assertSessionHasNoErrors();
        $this->assertDatabaseHas('location_inspector_mappings', [
            'location_name' => 'Plant Area Test Renamed',
        ]);

        // Destroy
        $responseDelete = $this->actingAs($inspector)->delete(route('settings.locations.destroy', $mapping->id));
        $responseDelete->assertSessionHasNoErrors();
        $this->assertDatabaseMissing('location_inspector_mappings', [
            'id' => $mapping->id,
        ]);
    }

    public function test_admin_can_update_user_role(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create(['role' => 'pic_safety']);

        $response = $this->actingAs($admin)->patch(route('settings.users.role', $user->id), [
            'role' => 'inspector',
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertEquals('inspector', $user->fresh()->role);
    }

    public function test_default_checklists_contain_all_official_items(): void
    {
        $portable = SystemSetting::getActiveChecklists('portable');
        $permanent = SystemSetting::getActiveChecklists('permanent');

        $this->assertCount(1, $portable);
        $this->assertCount(25, $portable[0]['items']);

        // Permanent Ladder & Fall Arrest System: 5 Kategori resmi
        $this->assertCount(5, $permanent);
        $totalPermanentItems = collect($permanent)->sum(fn ($g) => count($g['items']));
        $this->assertEquals(55, $totalPermanentItems);
    }

    public function test_inspector_can_update_and_reset_checklists(): void
    {
        $inspector = User::factory()->create(['role' => 'inspector']);

        $customChecklists = [
            'portable' => [
                [
                    'title' => 'Formulir Kustom Portable',
                    'items' => [
                        ['key' => 'custom_1', 'label' => 'Item Kustom 1'],
                    ],
                ],
            ],
            'permanent' => [
                [
                    'title' => 'Formulir Kustom Permanent',
                    'items' => [
                        ['key' => 'custom_perm_1', 'label' => 'Item Perm Kustom 1'],
                    ],
                ],
            ],
        ];

        // Update
        $response = $this->actingAs($inspector)->post(route('settings.checklists.update'), [
            'checklists' => $customChecklists,
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertEquals('custom_1', SystemSetting::getActiveChecklists('portable')[0]['items'][0]['key']);

        // Reset
        $responseReset = $this->actingAs($inspector)->post(route('settings.checklists.reset'));
        $responseReset->assertSessionHasNoErrors();

        // Should revert back to 25 portable and 55 permanent
        $this->assertCount(25, SystemSetting::getActiveChecklists('portable')[0]['items']);
        $this->assertCount(5, SystemSetting::getActiveChecklists('permanent'));
    }
}
