import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUserStore } from '../../../store/userStore';
import { Card } from '../../../components/Card';
import { Input } from '../../../components/forms/Input';
import { Button } from '../../../components/forms/Button';
import { FiArrowLeft } from 'react-icons/fi';

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getUser, updateUser } = useUserStore();
  const [isEditing, setIsEditing] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user' as 'user' | 'admin',
    isActive: true,
  });

  const user = id ? getUser(id) : undefined;

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      });
    }
  }, [user]);

  if (!user) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => navigate('/admin/users')}>
          <FiArrowLeft className="mr-2" />
          Back to Users
        </Button>
        <p className="text-gray-600">User not found.</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (id) {
      updateUser(id, formData);
    }
    setIsEditing(false);
  };

  const handleResetPassword = () => {
    if (!newPassword) return;
    if (id) {
      updateUser(id, { password: newPassword });
      setNewPassword('');
      alert('Password updated.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <Button variant="outline" onClick={() => navigate('/admin/users')}>
        <FiArrowLeft className="mr-2" />
        Back to Users
      </Button>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">User Details</h1>
        {!isEditing && (
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            Edit User
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <p className="text-sm text-gray-600 mb-1">Status</p>
          <p
            className={`text-lg font-semibold ${
              formData.isActive ? 'text-green-600' : 'text-gray-600'
            }`}
          >
            {formData.isActive ? 'Active' : 'Inactive'}
          </p>
        </Card>

        <Card>
          <p className="text-sm text-gray-600 mb-1">Role</p>
          <p className="text-lg font-semibold text-gray-900 capitalize">{formData.role}</p>
        </Card>

        <Card>
          <p className="text-sm text-gray-600 mb-1">User ID</p>
          <p className="text-lg font-semibold text-gray-900">{id}</p>
        </Card>
      </div>

      <Card title="User Information">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={!isEditing}
          />

          <Input
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            disabled={!isEditing}
          />

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value as 'user' | 'admin' })
              }
              className="input"
              disabled={!isEditing}
            >
              <option value="user">User</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                disabled={!isEditing}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Active Account</span>
            </label>
          </div>

          {isEditing && (
            <div className="flex space-x-3">
              <Button type="submit">Save Changes</Button>
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          )}
        </form>
      </Card>

      <Card title="Security">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="font-medium text-gray-900 mb-1">Set New Password</p>
              <Input
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                type="password"
                placeholder="Enter new password"
              />
            </div>
            <Button
              variant="outline"
              onClick={handleResetPassword}
              className="mt-6"
            >
              Update Password
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
