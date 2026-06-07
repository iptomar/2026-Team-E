<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    /**
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            abort(403);
        }

        $allowedRoles = array_map(
            fn (string $role) => UserRole::normalize($role),
            $roles
        );

        if (! $user->hasRole(...$allowedRoles)) {
            abort(403);
        }

        return $next($request);
    }
}
