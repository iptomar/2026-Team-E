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
        Schema::create('form_templates', function (Blueprint $table) {
            $table->id(); // id do template
            $table->string('name'); // nome do formulário (ex: Pedido de marcação de férias)
            $table->json('structure'); // estrutura do template (componentes drag-and-drop)
            //$table->json('validation_sequence'); // lista de IDs/Cargos que validam (ex: [1, 5, 10])
            $table->json('allowed_roles'); // que cargos podem aceder/preencher
            $table->foreignId('created_by')->constrained('users'); // quem criou
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('form_templates');
    }
};
