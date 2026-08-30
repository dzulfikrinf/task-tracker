# Task Tracker

Mini project management app untuk mengelola project dan task, dengan fitur assign task ke user lain. Dibangun sebagai latihan implementasi stack yang umum dipakai di web development modern (Laravel + PostgreSQL + Redis + React).

## Fitur

- **Autentikasi** — register & login menggunakan Laravel Breeze
- **CRUD Project** — user bisa membuat, melihat, dan menghapus project miliknya
- **CRUD Task** — setiap project bisa punya banyak task, dengan status (`todo`, `in_progress`, `done`)
- **Assign Task** — task bisa di-assign ke satu atau lebih user (relasi many-to-many)
- **Authorization** — hanya pemilik project yang bisa melihat, mengubah, atau menghapus project miliknya (via custom middleware)
- **Caching** — ringkasan jumlah task per status di-cache menggunakan Redis untuk mengurangi query berulang ke database

## Tech Stack

| Layer | Teknologi |
|---|---|
| Backend | Laravel 12 |
| Database | PostgreSQL |
| Cache & Session | Redis (via Predis) |
| Frontend | React + Inertia.js |
| Styling | Tailwind CSS |
| Auth Scaffolding | Laravel Breeze |

## Struktur Database

```
users
├── id, name, email, password

projects
├── id, user_id (FK → users), name, description

tasks
├── id, project_id (FK → projects), title, description, status

task_user (pivot)
├── task_id (FK → tasks), user_id (FK → users)
```

**Relasi:**
- `User` hasMany `Project`
- `Project` hasMany `Task`
- `Task` belongsToMany `User` (melalui `task_user`, untuk assignee)

## Middleware

Custom middleware `project.owner` (`app/Http/Middleware/EnsureUserOwnsProject.php`) memastikan hanya pemilik project yang bisa mengakses route `show`, `update`, dan `destroy` pada project tertentu. User lain yang mencoba mengakses akan mendapat response `403 Forbidden`.

## Redis Caching

Ringkasan jumlah task per status (`todo`, `in_progress`, `done`) di-cache per project selama 5 menit menggunakan `Cache::remember()`. Cache otomatis di-invalidate (`Cache::forget()`) setiap kali ada task yang dibuat, diubah, atau dihapus di project tersebut — sehingga data yang ditampilkan tetap akurat tanpa perlu query berulang.

## Setup & Instalasi

### Requirements
- PHP >= 8.2
- Composer
- Node.js & npm
- PostgreSQL
- Redis (atau Memurai untuk Windows)

### Langkah Instalasi

```bash
# 1. Clone repository
git clone <repo-url>
cd task-tracker

# 2. Install dependency PHP & JS
composer install
npm install

# 3. Copy environment file
cp .env.example .env
php artisan key:generate

# 4. Sesuaikan koneksi database & Redis di .env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=task_tracker
DB_USERNAME=postgres
DB_PASSWORD=

CACHE_STORE=redis
SESSION_DRIVER=redis
REDIS_CLIENT=predis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# 5. Jalankan migration
php artisan migrate

# 6. Jalankan development server
npm run dev
php artisan serve
```

Akses aplikasi di `http://127.0.0.1:8000`.

## Alur Penggunaan

1. Register akun baru / login
2. Buat project baru dari halaman **Projects**
3. Buka detail project, tambahkan beberapa task
4. Ubah status task (todo → in progress → done) — ringkasan otomatis ter-update
5. Assign task ke user lain melalui form assign

## Catatan Pengembangan

Project ini dibangun secara bertahap dengan alur Git berikut, satu branch per fitur:

```
feature/setup-db          → migration & schema database
feature/models-relasi      → model & relasi Eloquent
feature/middleware-auth    → middleware authorization
feature/api-controller     → controller & routing RESTful
feature/redis-cache        → implementasi caching
feature/frontend-pages     → halaman React/Inertia
fix/project-owner-show-route → perbaikan proteksi route show
```

Setiap branch di-merge ke `main` melalui pull request.

## Potensi Pengembangan Selanjutnya

- Validasi assign task agar hanya bisa dilakukan ke user yang memang tergabung dalam project
- Unit test untuk controller dan middleware
- Fitur notifikasi saat task di-assign ke user
