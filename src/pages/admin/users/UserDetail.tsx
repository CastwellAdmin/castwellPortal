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
  const { users, fetchUsers, getUser, updateUser, resetPassword, setPassword } = useUserStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user' as 'super_admin' | 'admin' | 'user',
    isActive: true,
  });

  useEffect(() => {
    if (users.length === 0) {
      fetchUsers();
    }
  }, [users.length, fetchUsers]);

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
        <p className="text-gray-600">{users.length === 0 ? 'Loading...' : 'User not found.'}</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setError('');
    setIsSaving(true);

    try {
      await updateUser(id, formData);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetPassword = async () => {
    setPasswordMsg('');
    try {
      await resetPassword(user.email);
      setPasswordMsg('Password reset email sent to ' + user.email);
    } catch (err) {
      setPasswordMsg(err instanceof Error ? err.message : 'Failed to send reset email.');
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newPassword.trim()) return;
    setPasswordMsg('');
    setIsResetting(true);
    try {
      await setPassword(id, newPassword);
      setPasswordMsg('Password updated successfully.');
      setNewPassword('');
    } catch (err) {
      setPasswordMsg(err instanceof Error ? err.message : 'Failed to set password.');
    } finally {
      setIsResetting(false);
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
          <p className="text-lg font-semibold text-gray-900 truncate">{id}</p>
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
                setFormData({ ...formData, role: e.target.value as 'super_admin' | 'admin' | 'user' })
              }
              className="input"
              disabled={!isEditing}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
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

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {isEditing && (
            <div className="flex space-x-3">
              <Button type="submit" isLoading={isSaving}>Save Changes</Button>
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          )}
        </form>
      </Card>

      <Card title="Security">
        <div className="space-y-6">
          <form onSubmit={handleSetPassword} className="space-y-3">
            <p className="text-sm font-medium text-gray-700">Set New Password</p>
            <div className="flex space-x-3">
              <Input
                label=""
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
              />
              <Button type="submit" isLoading={isResetting} className="mt-1 shrink-0">
                Set Password
              </Button>
            </div>
          </form>

          <div className="border-t pt-4 space-y-3">
            <p className="text-sm text-gray-600">
              Or send a password reset email so the user can set their own.
            </p>
            <Button variant="outline" onClick={handleResetPassword}>
              Send Password Reset Email
            </Button>
          </div>

          {passwordMsg && (
            <p className={`text-sm mt-2 ${passwordMsg.includes('success') ? 'text-green-600' : 'text-gray-700'}`}>
              {passwordMsg}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
