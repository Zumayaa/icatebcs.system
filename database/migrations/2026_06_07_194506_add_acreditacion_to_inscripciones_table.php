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
        Schema::table('inscripciones', function (Blueprint $table) {
            $table->decimal('calificacion', 5, 2)->nullable()->after('estado');
            // El resultado puede ser: pendiente, aprobado, reprobado, o baja
            $table->string('resultado')->default('pendiente')->after('calificacion'); 
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inscripciones', function (Blueprint $table) {
            $table->dropColumn(['calificacion', 'resultado']);
        });
    }
};
