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
        Schema::create('cursos', function (Blueprint $table) {
            $table->id();
            $table->string('matricula')->unique();
            $table->string('nombre');
            $table->text('descripcion')->nullable(); // <--- Nuevo (Objetivo del curso)
            $table->string('unidad_capacitacion');
            $table->foreignId('capacitador_id')->nullable()->withDefault()->constrained('capacitadores')->nullOnDelete();
            $table->string('dias_semana');
            $table->time('hora_inicio');
            $table->time('hora_fin');
            $table->integer('horas_totales')->default(20); // <--- Nuevo (Duración oficial)
            $table->string('modalidad')->default('Presencial'); // <--- Nuevo (Presencial/Online)
            $table->integer('cupo_maximo')->default(20);
            $table->decimal('costo', 8, 2)->default(0);
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cursos');
    }
};
