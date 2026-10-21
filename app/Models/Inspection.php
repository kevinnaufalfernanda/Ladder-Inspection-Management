<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inspection extends Model
{
    protected $fillable = [
        'ladder_id',
        'inspector_id',
        'status',
        'checklist',
        'valid_until',
        'notes'
    ];

    protected $casts = [
        'checklist' => 'array',
        'valid_until' => 'datetime',
    ];

    public function ladder()
    {
        return $this->belongsTo(Ladder::class);
    }

    public function inspector()
    {
        return $this->belongsTo(User::class, 'inspector_id');
    }

    public function getIsValidAttribute()
    {
        return $this->status === 'safe' && $this->valid_until && $this->valid_until->isFuture();
    }
}
