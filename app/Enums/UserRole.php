<?php

namespace App\Enums;

enum UserRole: string
{
    case Admin = 'administrador';
    case Validator = 'validador';
    case User = 'utilizador';

    public function defaultPath(): string
    {
        return match ($this) {
            self::Admin => '/admin-panel',
            self::Validator, self::User => '/forms-list',
        };
    }

    public static function values(): array
    {
        return array_map(fn (self $role) => $role->value, self::cases());
    }

    public static function normalize(self|string $role): string
    {
        if ($role instanceof self) {
            return $role->value;
        }

        return match ($role) {
            'admin' => self::Admin->value,
            'validator' => self::Validator->value,
            'user' => self::User->value,
            default => $role,
        };
    }
}
