<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Capacitador extends Model
{
    protected $table = 'capacitadores';

    protected $guarded = [];

    public function cursos()
    {
        return $this->hasMany(Curso::class);
    }
}