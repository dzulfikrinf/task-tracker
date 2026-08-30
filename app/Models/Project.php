<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Project extends Model
{
    protected $fillable = ['name', 'description', 'user_id'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    public function getTaskSummary()
    {
        return Cache::remember("project.{$this->id}.summary", 300, function () {
            return [
                'todo' => $this->tasks()->where('status', 'todo')->count(),
                'in_progress' => $this->tasks()->where('status', 'in_progress')->count(),
                'done' => $this->tasks()->where('status', 'done')->count(),
            ];
        });
    }
}
