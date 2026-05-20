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
        // 1. Tabela de Departamentos
        if (!Schema::hasTable('departments')) {
            Schema::create('departments', function (Blueprint $table) {
                $table->id();
                $table->string('name'); // ex: "Recursos Humanos", "TI", "Financeiro"
                $table->text('description')->nullable();
                $table->timestamps();
            });
        }

        // 2. Expandir tabela Users para incluir department_id e cargo
        if (Schema::hasTable('users') && !Schema::hasColumn('users', 'department_id')) {
            Schema::table('users', function (Blueprint $table) {
                $table->foreignId('department_id')
                    ->nullable()
                    ->after('email')
                    ->constrained('departments')
                    ->onDelete('set null');
                $table->string('cargo')->nullable()->after('department_id'); // ex: "Diretor", "Técnico", "Operário"
            });
        }

        // 3. Expandir/criar tabela Labels (Grupos/Entidades)
        if (!Schema::hasTable('labels')) {
            Schema::create('labels', function (Blueprint $table) {
                $table->id();
                $table->string('name'); // ex: "Validadores Nível 1", "Aprovadores Financeiro"
                $table->enum('access_level', ['administrador', 'validador', 'utilizador'])->default('utilizador');
                $table->foreignId('department_id')
                    ->nullable()
                    ->constrained('departments')
                    ->onDelete('set null');
                $table->string('cargo')->nullable(); // ex: "Diretor de Departamento", "Validador"
                $table->text('description')->nullable();
                $table->timestamps();
            });
        }

        // 4. Tabela de relação Users <-> Labels (Muitos para Muitos)
        if (!Schema::hasTable('users_labels')) {
            Schema::create('users_labels', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')
                    ->constrained('users')
                    ->onDelete('cascade');
                $table->foreignId('label_id')
                    ->constrained('labels')
                    ->onDelete('cascade');
                $table->timestamps();

                // Evitar duplicatas: um utilizador não pode ter o mesmo label duas vezes
                $table->unique(['user_id', 'label_id']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users_labels');
        
        // Remover colunas de users se elas foram adicionadas
        if (Schema::hasTable('users')) {
            Schema::table('users', function (Blueprint $table) {
                if (Schema::hasColumn('users', 'department_id')) {
                    $table->dropForeignKeyIfExists(['department_id']);
                    $table->dropColumn('department_id');
                }
                if (Schema::hasColumn('users', 'cargo')) {
                    $table->dropColumn('cargo');
                }
            });
        }

        Schema::dropIfExists('labels');
        Schema::dropIfExists('departments');
    }
};
