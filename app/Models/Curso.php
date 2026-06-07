<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Curso extends Model
{
    protected $guarded = [];

    // La relación que ya le habíamos puesto antes
    public function inscripciones()
    {
        return $this->hasMany(Inscripcion::class);
    }

    // Un curso le pertenece a un capacitador
    public function capacitador()
    {
        return $this->belongsTo(Capacitador::class);
    }
}