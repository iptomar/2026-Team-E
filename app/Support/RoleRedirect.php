<?php

namespace App\Support;

use App\Enums\UserRole;
use App\Models\User;

class RoleRedirect
{
    public static function pathFor(?User $user): string
    {
        $role = $user?->role ?? UserRole::User;

        return $role instanceof UserRole
            ? $role->defaultPath()
            : UserRole::tryFrom((string) $role)?->defaultPath() ?? UserRole::User->defaultPath();
    }
}
