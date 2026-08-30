<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Project;

class EnsureUserOwnsProject
{
    public function handle(Request $request, Closure $next): Response
    {
        $project = $request->route('project');

        if ($project instanceof Project && $project->user_id !== Auth::id()) {
            abort(403, 'Anda tidak memiliki akses ke project ini.');
        }

        return $next($request);
    }
}
