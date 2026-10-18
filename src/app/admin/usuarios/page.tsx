import RoleButton from "@/components/admin/RoleButton";
import { getCurrentUser } from "@/lib/auth";
import { adminDb } from "@/lib/supabase-admin";

const dateFormat = new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" });

export default async function AdminUsers() {
  const [users, me] = await Promise.all([adminDb.listUsers(), getCurrentUser()]);
  const admins = users.filter((u) => u.role === "admin").length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Usuarios</h1>
        <p className="mt-1 text-sm text-stone-500">
          {users.length} cuenta(s), {admins} administrador(es). Los usuarios básicos solo pueden buscar recetas.
        </p>
      </div>
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="border-b border-stone-200 text-left text-xs uppercase tracking-wide text-stone-500">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3">Alta</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-stone-50">
                <td className="px-4 py-3 font-medium text-stone-900">
                  {u.email}
                  {u.id === me?.id && <span className="ml-2 text-xs font-normal text-stone-400">(tú)</span>}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      u.role === "admin" ? "bg-orange-100 text-orange-800" : "bg-stone-100 text-stone-600"
                    }`}
                  >
                    {u.role === "admin" ? "Administrador" : "Básico"}
                  </span>
                </td>
                <td className="px-4 py-3 text-stone-500">{dateFormat.format(new Date(u.created_at))}</td>
                <td className="px-4 py-3 text-right">
                  <RoleButton user={u} isSelf={u.id === me?.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
