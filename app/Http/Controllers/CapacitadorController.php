<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Capacitador;
use Inertia\Inertia;

class CapacitadorController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        // El buscador perrón: busca por nombre, rfc o curp
        $capacitadores = Capacitador::when($search, function ($query, $search) {
            $query->where('nombre', 'like', "%{$search}%")
                  ->orWhere('rfc', 'like', "%{$search}%")
                  ->orWhere('CURP', 'like', "%{$search}%");
        })
        ->orderBy('nombre', 'asc')
        ->get();

        return Inertia::render('Admin/Capacitadores/Index', [
            'capacitadores' => $capacitadores,
            'filters' => ['search' => $search] // Regresamos el filtro para la barra de React
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'rfc' => 'required|string|max:13|unique:capacitadores,rfc',
            'CURP' => 'required|string|max:18|unique:capacitadores,CURP',
            'numero_control' => 'required|string|unique:capacitadores,numero_control',
            'telefono' => 'required|string|max:20',
            'email' => 'nullable|email|max:255|unique:capacitadores,email',
            'grado_academico' => 'nullable|string|max:255',
            'especialidad' => 'nullable|string|max:255',
        ]);

        Capacitador::create($validated);
        return back();
    }

    public function update(Request $request, $id)
    {
        $capacitador = Capacitador::findOrFail($id);

        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'rfc' => 'required|string|max:13|unique:capacitadores,rfc,' . $id,
            'CURP' => 'required|string|max:18|unique:capacitadores,CURP,' . $id,
            'numero_control' => 'required|string|unique:capacitadores,numero_control,' . $id,
            'telefono' => 'required|string|max:20',
            'email' => 'nullable|email|max:255|unique:capacitadores,email,' . $id,
            'grado_academico' => 'nullable|string|max:255',
            'especialidad' => 'nullable|string|max:255',
        ]);

        $capacitador->update($validated);
        return back();
    }

    public function destroy($id)
    {
        Capacitador::findOrFail($id)->delete();
        return back();
    }
}