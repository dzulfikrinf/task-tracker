<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class TaskController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $task = Task::create($validated);
        Cache::forget("project.{$task->project_id}.summary");

        return redirect()->back();
    }

    public function update(Request $request, Task $task)
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'status' => 'sometimes|in:todo,in_progress,done',
        ]);

        $task->update($validated);
        Cache::forget("project.{$task->project_id}.summary");

        return redirect()->back();
    }

    public function destroy(Task $task)
    {
        $projectId = $task->project_id;
        $task->delete();
        Cache::forget("project.{$projectId}.summary");

        return redirect()->back();
    }

    public function assign(Request $request, Task $task)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $task->users()->syncWithoutDetaching($validated['user_id']);

        return redirect()->back();
    }
}
