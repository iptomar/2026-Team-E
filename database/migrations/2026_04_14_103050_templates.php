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
        Schema::create('template', function (Blueprint $table) {
            $table->id(); // id do template
            $table->string('nome'); // nome do formulário (ex: Pedido de marcação de férias)
            $table->json('estrutura'); // estrutura do template (componentes drag-and-drop)
            $table->json('seq_validacao'); // lista de IDs/Cargos que validam (ex: [1, 5, 10])
            $table->json('permissoes'); // que cargos podem aceder/preencher
            $table->foreignId('criacao')->constrained('utilizador'); // quem criou
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
