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
        Schema::create('labels', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->timestamps();
        });
        
        Schema::create('users_labels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('label_id')
              ->nullable()
              ->after('id')
              ->constrained('labels')
              ->onDelete('set null');
            $table->foreignId('user_id')
              ->constrained()
              ->onDelete('cascade');
            $table->timestamps(); 
        });

        Schema::create('form_validation_steps', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            //$table->text('description')->nullable();
            $table->foreignId('form_template_id')
                ->constrained()
                ->onDelete('cascade');
            $table->json('labels_ids')->nullable();
            $table->enum('type', ['aprovar', 'informar'])->default('aprovar');
            $table->timestamps();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('labels');
        Schema::dropIfExists('users_labels');
        Schema::dropIfExists('form_validation_steps');
    }
};
