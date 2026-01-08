import { Outlet, NavLink } from 'react-router-dom';

const tabs = [
  { name: 'Watchlist', href: 'watchlist' },
  { name: 'Sectors', href: 'sectors' },
];

export default function Markets() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Markets</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <NavLink
              key={tab.name}
              to={tab.href}
              className={({ isActive }) =>
                `py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  isActive
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`
              }
            >
              {tab.name}
            </NavLink>
          ))}
        </nav>
      </div>

      <Outlet />
    </div>
  );
}
