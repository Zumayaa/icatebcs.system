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
        Schema::create('capacitandos', function (Blueprint $table) {
            $table->id();
            $table->string('numero_control')->nullable()->unique(); // <--- El identificador oficial
            $table->string('nombre_completo');
            $table->string('telefono');
            $table->string('curp')->unique();
            $table->date('fecha_nacimiento');
            $table->string('tipo_identificacion')->nullable();
            $table->boolean('identificacion_validada')->default(false);
            $table->timestamps();
        });
    }
        /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('capacitandos');
    }
};
