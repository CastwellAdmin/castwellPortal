import { Outlet, NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Logo from '../shared/Logo';
import {
  FiHome,
  FiUsers,
  FiTrendingUp,
  FiFileText,
  FiSettings,
  FiList,
  FiLogOut,
} from 'react-icons/fi';

const navigation = [
  { name: 'Overview', href: '/admin/overview', icon: FiHome },
  { name: 'Users', href: '/admin/users', icon: FiUsers },
  { name: 'Markets', href: '/admin/markets', icon: FiTrendingUp },
  { name: 'Documents', href: '/admin/documents', icon: FiFileText },
  { name: 'Settings', href: '/admin/settings', icon: FiSettings },
  { name: 'Audit Logs', href: '/admin/audit-logs', icon: FiList },
];

export default function AdminLayout() {
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-gray-900 shadow-lg">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-gray-800">
            <Logo variant="dark" size="sm" />
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`
                }
              >
                <item.icon className="mr-3" size={20} />
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* User menu */}
          <div className="p-4 border-t border-gray-800">
            <NavLink
              to="/dashboard"
              className="flex items-center px-4 py-3 text-sm font-medium text-gray-300 rounded-lg hover:bg-gray-800 transition-colors mb-2"
            >
              <FiHome className="mr-3" size={20} />
              Client View
            </NavLink>
            <button
              onClick={logout}
              className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-400 rounded-lg hover:bg-red-900/20 transition-colors"
            >
              <FiLogOut className="mr-3" size={20} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="ml-64">
        {/* Header */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-8">
          <h2 className="text-xl font-semibold text-gray-800">Admin Dashboard</h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">{user?.name}</span>
            <span className="px-3 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
              Admin
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
