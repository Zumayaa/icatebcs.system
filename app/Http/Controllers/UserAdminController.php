<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;
use Inertia\Inertia;

class UserAdminController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Usuarios/Index', [
            'usuarios' => User::orderBy('name')->get(['id', 'name', 'email', 'role', 'created_at']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:users,email',
            'role' => ['required', Rule::in(['admin', 'capturista'])],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $usuario = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            'password' => Hash::make($validated['password']),
        ]);

        Log::info('Usuario administrativo creado', [
            'created_user_id' => $usuario->id,
            'role' => $usuario->role,
            'user_id' => auth()->id(),
        ]);

        return back();
    }

    public function update(Request $request, $id)
    {
        $usuario = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:users,email,' . $usuario->id,
            'role' => ['required', Rule::in(['admin', 'capturista'])],
            'password' => ['nullable', 'confirmed', Rules\Password::defaults()],
        ]);

        $payload = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
        ];

        if (! empty($validated['password'])) {
            $payload['password'] = Hash::make($validated['password']);
        }

        $usuario->update($payload);

        Log::info('Usuario administrativo actualizado', [
            'updated_user_id' => $usuario->id,
            'role' => $usuario->role,
            'user_id' => auth()->id(),
        ]);

        return back();
    }
}
