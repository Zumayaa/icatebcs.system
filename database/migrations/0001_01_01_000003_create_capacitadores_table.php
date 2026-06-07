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
        Schema::create('capacitadores', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('rfc')->unique();
            $table->string('CURP')->unique();
            $table->string('numero_control')->unique();
            $table->string('telefono');
            $table->string('email')->nullable()->unique(); // <--- Nuevo
            $table->string('grado_academico')->nullable(); // <--- Nuevo
            $table->string('especialidad')->nullable();
            $table->timestamps();
        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('capacitadores');
    }
};
