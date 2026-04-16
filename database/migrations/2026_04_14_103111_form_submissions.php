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
        Schema::create('form_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('form_template_id')->constrained('form_templates'); // qual o formulário usado
            $table->foreignId('user_id')->constrained('users'); // quem preencheu
            $table->json('submitted_data'); // dados submetidos pelo utilizador (ex: {"nome": "João", "dias": 5})
            $table->integer('current_step_index')->default(0); // em que passo da validação está
            $table->string('status')->default('pending'); // pendente, aprovado, rejeitado
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
