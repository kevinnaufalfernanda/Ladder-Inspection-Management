<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LocationInspectorMapping extends Model
{
    use HasFactory;

    protected $fillable = [
        'location_name',
        'inspector_id',
    ];

    public function inspector()
    {
        return $this->belongsTo(User::class, 'inspector_id');
    }
}
