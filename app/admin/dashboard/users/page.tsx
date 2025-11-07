import { getUsers } from "@/lib/actions/users";
import { UsersClient } from "@/components/features/users/users-client";

export default async function UsersPage() {
  const usersResult = await getUsers();

  const users = usersResult.success ? usersResult.data : [];

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Usuarios</h2>
          <p className="text-muted-foreground">
            Gestiona los usuarios del sistema
          </p>
        </div>
      </div>
      <UsersClient users={users} />
    </div>
  );
}
