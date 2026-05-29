<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Department extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
    ];

    /**
     * Um departamento pode ter múltiplos utilizadores
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * Um departamento pode ter múltiplos labels/grupos
     */
    public function labels(): HasMany
    {
        return $this->hasMany(Label::class);
    }
}
