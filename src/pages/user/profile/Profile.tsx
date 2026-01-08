import { useState } from 'react';
import { useAuthStore } from '../../../store/authStore';
import { Card } from '../../../components/Card';
import { Input } from '../../../components/forms/Input';
import { Button } from '../../../components/forms/Button';

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(formData);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <p className="text-sm text-gray-600 mb-1">Account Status</p>
          <p className="text-lg font-semibold text-green-600">Active</p>
        </Card>

        <Card>
          <p className="text-sm text-gray-600 mb-1">Member Since</p>
          <p className="text-lg font-semibold text-gray-900">
            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
          </p>
        </Card>

        <Card>
          <p className="text-sm text-gray-600 mb-1">Last Login</p>
          <p className="text-lg font-semibold text-gray-900">
            {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}
          </p>
        </Card>
      </div>

      <Card
        title="Personal Information"
        headerAction={
          !isEditing && (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          )
        }
      >
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

          <Input label="Role" value={user?.role || ''} disabled />

          {isEditing && (
            <div className="flex space-x-3">
              <Button type="submit">Save Changes</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    name: user?.name || '',
                    email: user?.email || '',
                  });
                }}
              >
                Cancel
              </Button>
            </div>
          )}
        </form>
      </Card>

      <Card title="Preferences">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Email Notifications</p>
              <p className="text-sm text-gray-600">
                Receive updates about your portfolio
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Document Alerts</p>
              <p className="text-sm text-gray-600">Get notified about new documents</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </Card>
    </div>
  );
}
