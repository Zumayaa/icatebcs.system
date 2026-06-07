<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inscripcion extends Model
{
    protected $table = 'inscripciones';
    protected $guarded = [];

    // Le decimos que esta inscripción pertenece a un Curso
    public function curso()
    {
        return $this->belongsTo(Curso::class);
    }

    // Le decimos que esta inscripción pertenece a un Capacitando (Alumno)
    public function capacitando()
    {
        return $this->belongsTo(Capacitando::class);
    }
}