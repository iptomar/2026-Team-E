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
        if (! Schema::hasTable('form_template_folders')) {
            Schema::create('form_template_folders', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
                $table->timestamps();
            });
        }

        if (Schema::hasTable('form_templates') && ! Schema::hasColumn('form_templates', 'folder_id')) {
            Schema::table('form_templates', function (Blueprint $table) {
                $table->foreignId('folder_id')
                    ->nullable()
                    ->after('created_by')
                    ->constrained('form_template_folders')
                    ->nullOnDelete();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('form_templates') && Schema::hasColumn('form_templates', 'folder_id')) {
            Schema::table('form_templates', function (Blueprint $table) {
                $table->dropConstrainedForeignId('folder_id');
            });
        }

        Schema::dropIfExists('form_template_folders');
    }
};
