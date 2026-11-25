<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SystemSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'value',
        'group',
        'description',
    ];

    /**
     * Ambil nilai pengaturan berdasarkan key.
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        $setting = static::where('key', $key)->first();
        if (!$setting || $setting->value === null) {
            return $default;
        }

        $decoded = json_decode($setting->value, true);
        if (json_last_error() === JSON_ERROR_NONE) {
            return $decoded;
        }

        return $setting->value;
    }

    /**
     * Simpan atau perbarui nilai pengaturan.
     */
    public static function set(string $key, mixed $value, string $group = 'general', ?string $description = null): self
    {
        $storedValue = json_encode($value, JSON_UNESCAPED_UNICODE);

        return static::updateOrCreate(
            ['key' => $key],
            [
                'value' => $storedValue,
                'group' => $group,
                'description' => $description,
            ]
        );
    }

    /**
     * Ambil konfigurasi checklist aktif (kustom jika ada, atau fallback ke config/checklists.php).
     */
    public static function getActiveChecklists(?string $type = null): array
    {
        $custom = static::get('checklists_custom');
        $all = (is_array($custom) && !empty($custom)) ? $custom : config('checklists', []);

        if ($type) {
            return $all[$type] ?? [];
        }

        return $all;
    }
}
