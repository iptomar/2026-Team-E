<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Enums\UserRole;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

#[Fillable(['name', 'email', 'password', 'role', 'department_id', 'cargo'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => UserRole::class,
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    public function hasRole(UserRole|string ...$roles): bool
    {
        $currentRole = $this->role instanceof UserRole
            ? $this->role->value
            : (string) $this->role;

        foreach ($roles as $role) {
            if ($currentRole === UserRole::normalize($role)) {
                return true;
            }
        }

        return false;
    }

    public function isAdmin(): bool
    {
        return $this->hasRole(UserRole::Admin);
    }

    public function isValidator(): bool
    {
        return $this->hasRole(UserRole::Validator);
    }

    public function isCommonUser(): bool
    {
        return $this->hasRole(UserRole::User);
    }

    /**
     * Um utilizador pertence a um departamento
     */
    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * Um utilizador pode ter múltiplos labels/grupos (muitos-para-muitos)
     */
    public function labels()
    {
        return $this->belongsToMany(Label::class, 'users_labels');
    }

    /**
     * Relacionamento: Um utilizador pode criar múltiplos templates
     */
    public function formTemplates()
    {
        return $this->hasMany(FormTemplate::class, 'created_by');
    }

    /**
     * Relacionamento: Um utilizador pode fazer múltiplas submissões
     */
    public function formSubmissions()
    {
        return $this->hasMany(FormSubmission::class);
    }
}
