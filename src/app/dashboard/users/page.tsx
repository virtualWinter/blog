import { getCurrentUser } from '@/lib/auth';
import { getAllUsers } from '@/lib/auth/actions';
import { AdminUsers } from '@/components/dashboard/admin-users';

export default async function DashboardUsersPage() {
  // User authorization is handled by the layout
  const user = await getCurrentUser();
  const usersResult = await getAllUsers();
  
  if (usersResult.error) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
        <p className="text-gray-600">{usersResult.error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">User Management</h2>
        <p className="text-muted-foreground">Manage user accounts and permissions</p>
      </div>

      <AdminUsers users={usersResult.users!} currentUserId={user!.id} />
    </div>
  );
}