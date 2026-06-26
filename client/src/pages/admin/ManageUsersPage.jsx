import { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import * as adminService from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import { HiUsers, HiTrash } from 'react-icons/hi2';

export default function ManageUsersPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', role: '' });
  
  // Modals
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, userId: null });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Build params object (not a query string)
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.role) params.role = filters.role;

      const res = await adminService.getUsers(params);
      if (res.success) {
        setUsers(Array.isArray(res.data) ? res.data : []);
      } else {
        showToast(res.message || 'Failed to load users', 'error');
      }
    } catch (err) {
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await adminService.updateUserRole(userId, newRole);
      if (res.success) {
        showToast('Role updated successfully', 'success');
        setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      } else {
        showToast(res.message || 'Failed to update role', 'error');
      }
    } catch (err) {
      showToast('Failed to update role', 'error');
    }
  };

  const handleDeleteUser = async () => {
    try {
      const res = await adminService.deleteUser(deleteDialog.userId);
      if (res.success) {
        showToast('User deleted successfully', 'success');
        setUsers(users.filter(u => u._id !== deleteDialog.userId));
      } else {
        showToast(res.message || 'Failed to delete user', 'error');
      }
    } catch (err) {
      showToast('Failed to delete user', 'error');
    } finally {
      setDeleteDialog({ isOpen: false, userId: null });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100 flex items-center gap-2">
            <HiUsers className="text-primary-500" /> Manage Users
          </h1>
          <p className="text-surface-500 dark:text-surface-400">View and manage all registered users.</p>
        </div>
      </div>

      <div className="glass dark:glass-dark rounded-2xl p-4 shadow-sm border border-surface-200 dark:border-surface-800">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
           <input
             type="text"
             placeholder="Search by name or email..."
             className="flex-1 px-4 py-2 bg-surface-50 dark:bg-surface-900 border border-surface-300 dark:border-surface-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-surface-900 dark:text-surface-100"
             value={filters.search}
             onChange={(e) => setFilters({ ...filters, search: e.target.value })}
           />
           <select
             className="px-4 py-2 bg-surface-50 dark:bg-surface-900 border border-surface-300 dark:border-surface-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-surface-900 dark:text-surface-100"
             value={filters.role}
             onChange={(e) => setFilters({ ...filters, role: e.target.value })}
           >
             <option value="">All Roles</option>
             <option value="student">Student</option>
             <option value="organizer">Organizer</option>
             <option value="admin">Admin</option>
           </select>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center"><LoadingSpinner /></div>
        ) : users.length === 0 ? (
          <EmptyState icon={<HiUsers />} title="No Users Found" description="Try adjusting your search filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-800 text-surface-500 dark:text-surface-400 text-sm">
                  <th className="py-3 px-4 font-semibold">User</th>
                  <th className="py-3 px-4 font-semibold">Role</th>
                  <th className="py-3 px-4 font-semibold">Department</th>
                  <th className="py-3 px-4 font-semibold">Joined</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-surface-900 dark:text-surface-100">{user.name}</div>
                      <div className="text-sm text-surface-500 dark:text-surface-400">{user.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        className={`text-sm px-2 py-1 rounded-lg border font-medium focus:ring-2 outline-none
                          ${user.role === 'admin' ? 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-900/30 dark:text-fuchsia-400 dark:border-fuchsia-800' : ''}
                          ${user.role === 'organizer' ? 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800' : ''}
                          ${user.role === 'student' ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' : ''}
                        `}
                      >
                        <option value="student">Student</option>
                        <option value="organizer">Organizer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-surface-700 dark:text-surface-300">
                      {user.department || '-'}
                    </td>
                    <td className="py-3 px-4 text-surface-700 dark:text-surface-300 text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => setDeleteDialog({ isOpen: true, userId: user._id })}
                        className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Delete User"
                      >
                        <HiTrash className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, userId: null })}
        onConfirm={handleDeleteUser}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone and will remove all their related data."
        confirmText="Delete User"
        variant="danger"
      />
    </div>
  );
}
