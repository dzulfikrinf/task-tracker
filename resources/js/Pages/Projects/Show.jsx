import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';

export default function Show({ auth, project, summary }) {
    const { data, setData, post, processing, reset, errors } = useForm({
        project_id: project.id,
        title: '',
        description: '',
    });

    const submitTask = (e) => {
        e.preventDefault();
        post(route('tasks.store'), {
            onSuccess: () => reset('title', 'description'),
        });
    };

    const updateStatus = (task, status) => {
        router.put(route('tasks.update', task.id), { status });
    };

    const deleteTask = (task) => {
        router.delete(route('tasks.destroy', task.id));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">{project.name}</h2>}
        >
            <Head title={project.name} />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8 space-y-6">

                    {/* Summary */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white p-4 shadow sm:rounded-lg text-center">
                            <div className="text-2xl font-bold">{summary.todo}</div>
                            <div className="text-sm text-gray-500">Todo</div>
                        </div>
                        <div className="bg-white p-4 shadow sm:rounded-lg text-center">
                            <div className="text-2xl font-bold">{summary.in_progress}</div>
                            <div className="text-sm text-gray-500">In Progress</div>
                        </div>
                        <div className="bg-white p-4 shadow sm:rounded-lg text-center">
                            <div className="text-2xl font-bold">{summary.done}</div>
                            <div className="text-sm text-gray-500">Done</div>
                        </div>
                    </div>

                    {/* Form tambah task */}
                    <div className="bg-white p-6 shadow sm:rounded-lg">
                        <h3 className="font-semibold mb-4">Tambah Task</h3>
                        <form onSubmit={submitTask} className="space-y-4">
                            <div>
                                <input
                                    type="text"
                                    placeholder="Judul task"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    className="w-full rounded border-gray-300"
                                />
                                {errors.title && <div className="text-red-500 text-sm">{errors.title}</div>}
                            </div>
                            <div>
                                <textarea
                                    placeholder="Deskripsi (opsional)"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className="w-full rounded border-gray-300"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded bg-gray-800 px-4 py-2 text-white"
                            >
                                Tambah Task
                            </button>
                        </form>
                    </div>

                    {/* List task */}
                    <div className="bg-white shadow sm:rounded-lg divide-y">
                        {project.tasks.length === 0 && (
                            <div className="p-6 text-gray-500">Belum ada task.</div>
                        )}
                        {project.tasks.map((task) => (
                            <div key={task.id} className="p-6 flex items-center justify-between">
                                <div>
                                    <div className="font-semibold">{task.title}</div>
                                    <div className="text-sm text-gray-500">{task.description}</div>
                                    <div className="text-xs text-gray-400 mt-1">
                                        Assigned: {task.users.map((u) => u.name).join(', ') || '-'}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <select
                                        value={task.status}
                                        onChange={(e) => updateStatus(task, e.target.value)}
                                        className="rounded border-gray-300 text-sm"
                                    >
                                        <option value="todo">Todo</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="done">Done</option>
                                    </select>
                                    <button
                                        onClick={() => deleteTask(task)}
                                        className="text-red-500 text-sm"
                                    >
                                        Hapus
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
