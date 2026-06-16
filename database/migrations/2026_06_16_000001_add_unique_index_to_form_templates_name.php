<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('form_templates')) {
            Schema::table('form_templates', function (Blueprint $table) {
                $table->unique('name', 'form_templates_name_unique');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('form_templates')) {
            Schema::table('form_templates', function (Blueprint $table) {
                $table->dropUnique('form_templates_name_unique');
            });
        }
    }
};
