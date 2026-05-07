<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Label extends Model
{
    protected $fillable = ['name'];

    /**
     * Usuários que possuem este cargo/label.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'users_labels');
    }
}