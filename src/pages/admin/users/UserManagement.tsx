import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../../store/userStore';
import { Card } from '../../../components/Card';
import { Table } from '../../../components/tables/Table';
import { Button } from '../../../components/forms/Button';
import type { User } from '../../../types';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';

export default function UserManagement() {
  const navigate = useNavigate();
  const { users, deleteUser } = useUserStore();

  const handleDelete = (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      deleteUser(userId);
    }
  };

  const columns = [
    {
      header: 'Name',
      accessor: 'name' as keyof User,
      className: 'font-medium text-gray-900',
    },
    {
      header: 'Email',
      accessor: 'email' as keyof User,
      className: 'text-gray-600',
    },
    {
      header: 'Role',
      accessor: (row: User) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            row.role === 'admin'
              ? 'bg-purple-100 text-purple-800'
              : 'bg-blue-100 text-blue-800'
          }`}
        >
          {row.role.charAt(0).toUpperCase() + row.role.slice(1)}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (row: User) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            row.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}
        >
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      header: 'Created',
      accessor: (row: User) => new Date(row.createdAt).toLocaleDateString(),
      className: 'text-gray-600',
    },
    {
      header: 'Last Login',
      accessor: (row: User) =>
        row.lastLogin ? new Date(row.lastLogin).toLocaleDateString() : 'Never',
      className: 'text-gray-600',
    },
    {
      header: 'Actions',
      accessor: (row: User) => (
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/users/${row.id}`);
            }}
            className="text-primary-600 hover:text-primary-700"
          >
            <FiEdit size={18} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row.id);
            }}
            className="text-red-600 hover:text-red-700"
          >
            <FiTrash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  const activeUsers = users.filter((u) => u.isActive).length;
  const adminUsers = users.filter((u) => u.role === 'admin').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <Button onClick={() => navigate('/admin/users/create')}>
          <FiPlus className="mr-2" />
          Add User
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <p className="text-sm text-gray-600 mb-1">Total Users</p>
          <p className="text-3xl font-bold text-gray-900">{users.length}</p>
        </Card>

        <Card>
          <p className="text-sm text-gray-600 mb-1">Active Users</p>
          <p className="text-3xl font-bold text-green-600">{activeUsers}</p>
        </Card>

        <Card>
          <p className="text-sm text-gray-600 mb-1">Administrators</p>
          <p className="text-3xl font-bold text-purple-600">{adminUsers}</p>
        </Card>
      </div>

      <Card title="All Users">
        <Table
          data={users}
          columns={columns}
          onRowClick={(user) => navigate(`/admin/users/${user.id}`)}
        />
      </Card>
    </div>
  );
}
