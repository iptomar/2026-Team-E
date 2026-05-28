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
        Schema::create('form_template_structures', function (Blueprint $table) {
            $table->id();
            // Chave estrangeira que liga à tabela principal. 
            // cascadeOnDelete() garante que se o template for apagado, as estruturas também são.
            $table->foreignId('form_template_id')->constrained('form_templates')->cascadeOnDelete();
            
            $table->json('structure'); // A estrutura drag-and-drop propriamente dita
            
            // Opcional: Um campo de versão ou descrição ajuda a identificar qual estrutura usar
            $table->integer('version')->default(1); 
            $table->boolean('is_active')->default(false); // Para saber qual é a estrutura atual
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('form_template_structures');
    }
};