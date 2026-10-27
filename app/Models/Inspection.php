<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inspection extends Model
{
    protected $fillable = [
        'ladder_id',
        'inspector_id',
        'submitted_by_id',
        'reviewed_by_id',
        'status',
        'workflow_status',
        'checklist',
        'review_data',
        'valid_until',
        'notes',
        'review_comment',
        'approved_at',
    ];

    protected $casts = [
        'checklist' => 'array',
        'review_data' => 'array',
        'valid_until' => 'datetime',
        'approved_at' => 'datetime',
    ];

    public function ladder()
    {
        return $this->belongsTo(Ladder::class);
    }

    public function inspector()
    {
        return $this->belongsTo(User::class, 'inspector_id');
    }

    public function submitter()
    {
        return $this->belongsTo(User::class, 'submitted_by_id');
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by_id');
    }

    public function getIsValidAttribute()
    {
        return $this->status === 'safe' && $this->valid_until && $this->valid_until->isFuture();
    }
}
