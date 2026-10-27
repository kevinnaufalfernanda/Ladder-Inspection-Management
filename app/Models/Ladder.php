<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Ladder extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'location',
        'type',
        'owner_name',
        'responsible_name',
        'max_load',
        'inspector_id',
        'identifier',
        'description',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($ladder) {
            if (empty($ladder->uuid)) {
                $ladder->uuid = (string) Str::uuid();
            }
        });
    }

    public function getRouteKeyName()
    {
        return 'uuid';
    }

    public function inspections()
    {
        return $this->hasMany(Inspection::class);
    }

    public function inspector()
    {
        return $this->belongsTo(User::class, 'inspector_id');
    }

    public function latestInspection()
    {
        return $this->hasOne(Inspection::class)->latestOfMany();
    }
}
