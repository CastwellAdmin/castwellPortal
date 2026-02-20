import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../../store/userStore';
import { Card } from '../../../components/Card';
import { Input } from '../../../components/forms/Input';
import { Button } from '../../../components/forms/Button';
import { FiArrowLeft } from 'react-icons/fi';

export default function CreateUser() {
  const navigate = useNavigate();
  const { createUser } = useUserStore();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'user' as 'super_admin' | 'admin' | 'user',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await createUser(formData);
      navigate('/admin/users');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <Button variant="outline" onClick={() => navigate('/admin/users')}>
        <FiArrowLeft className="mr-2" />
        Back to Users
      </Button>

      <h1 className="text-3xl font-bold text-gray-900">Create New User</h1>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label="User ID"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            placeholder="e.g. jsmith"
            required
          />

          <Input
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value as 'super_admin' | 'admin' | 'user' })
              }
              className="input"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="pt-4 flex space-x-3">
            <Button type="submit" isLoading={isLoading}>Create User</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/users')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
