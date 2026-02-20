import { Outlet, NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Logo from '../shared/Logo';
import {
  FiHome,
  FiPieChart,
  FiTrendingUp,
  FiFileText,
  FiCreditCard,
  FiBookOpen,
  FiUser,
  FiLogOut,
} from 'react-icons/fi';

const navigation = [
  { name: 'Overview', href: '/dashboard/overview', icon: FiHome },
  { name: 'Portfolio', href: '/dashboard/portfolio', icon: FiPieChart },
  { name: 'Markets', href: '/dashboard/markets', icon: FiTrendingUp },
  { name: 'Documents', href: '/dashboard/documents', icon: FiFileText },
  { name: 'Payments', href: '/dashboard/payments', icon: FiCreditCard },
  { name: 'Learning Center', href: '/dashboard/learning', icon: FiBookOpen },
];

export default function UserLayout() {
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b">
            <Logo variant="light" size="sm" />
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
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <item.icon className="mr-3" size={20} />
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* User menu */}
          <div className="p-4 border-t">
            <NavLink
              to="/dashboard/profile"
              className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FiUser className="mr-3" size={20} />
              Profile
            </NavLink>
            <button
              onClick={logout}
              className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
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
          <h2 className="text-xl font-semibold text-gray-800">
            Welcome back, {user?.name}
          </h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">{user?.username}</span>
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
