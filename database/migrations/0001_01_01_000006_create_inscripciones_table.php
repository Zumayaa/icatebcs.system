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
        Schema::create('inscripciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('curso_id')->constrained('cursos')->cascadeOnDelete();
            $table->foreignId('capacitando_id')->constrained('capacitandos')->cascadeOnDelete();
            $table->enum('estado', ['pre-registrado', 'validado'])->default('pre-registrado');
            
            // --- El Checklist Gubernamental ---
            $table->boolean('chk_id')->default(false);
            $table->boolean('chk_curp')->default(false);
            $table->boolean('chk_domicilio')->default(false);
            $table->boolean('chk_fotos')->default(false);
            
            $table->text('observaciones')->nullable(); // Para el post-it virtual
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inscripciones');
    }
};
