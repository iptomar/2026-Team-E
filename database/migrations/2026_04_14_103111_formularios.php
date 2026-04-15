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
        Schema::create('formulario', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_template')->constrained(); // qual o formulário usado
            $table->foreignId('id_utilizador')->constrained(); // quem preencheu
            $table->json('dados'); // dados submetidos pelo utilizador (ex: {"nome": "João", "dias": 5})
            $table->integer('fase_validacao')->default(0); // em que passo da validação está
            $table->string('estado')->default('pendente'); // pendente, aprovado, rejeitado
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
