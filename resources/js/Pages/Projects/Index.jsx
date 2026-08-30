import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Index({ auth, projects }) {
    const { data, setData, post, processing, reset, errors } = useForm({
        name: '',
        description: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('projects.store'), {
            onSuccess: () => reset(),
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Projects</h2>}
        >
            <Head title="Projects" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8 space-y-6">

                    {/* Form tambah project */}
                    <div className="bg-white p-6 shadow sm:rounded-lg">
                        <h3 className="font-semibold mb-4">Buat Project Baru</h3>
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <input
                                    type="text"
                                    placeholder="Nama project"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full rounded border-gray-300"
                                />
                                {errors.name && <div className="text-red-500 text-sm">{errors.name}</div>}
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
                                Buat Project
                            </button>
                        </form>
                    </div>

                    {/* List project */}
                    <div className="bg-white shadow sm:rounded-lg divide-y">
                        {projects.length === 0 && (
                            <div className="p-6 text-gray-500">Belum ada project.</div>
                        )}
                        {projects.map((project) => (
                            <Link
                                key={project.id}
                                href={route('projects.show', project.id)}
                                className="block p-6 hover:bg-gray-50"
                            >
                                <div className="font-semibold">{project.name}</div>
                                <div className="text-sm text-gray-500">{project.description}</div>
                            </Link>
                        ))}
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
