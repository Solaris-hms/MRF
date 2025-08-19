import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaGlobe, FaChartBar, FaCog, FaSignOutAlt, FaChevronRight, FaTruck, FaMoneyBillWave, FaUserCheck, FaUsers, FaHardHat, FaImages } from 'react-icons/fa';
import authService from '../../services/authService';

const Sidebar = ({ setSidebarOpen }) => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  
  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const canViewAnalytics = user?.permissions?.includes('view:dashboard');
  const canManageUsers = user?.permissions?.includes('manage:users');
  const canViewTransactions = user?.permissions?.includes('view:cashbook');
  
  const navSections = [
    { 
      title: 'Analytics', 
      icon: <FaChartBar />,
      show: canViewAnalytics,
      links: [
        { name: 'Dashboard', path: '/' },
        { name: 'Reports', path: '/reports' }
      ]
    },
    {
      title: 'Operations',
      icon: <FaTruck />,
      show: true,
      links: [
        { name: 'Receiving', path: '/receiving' },
        { name: 'Completed Entries', path: '/completed-entries' },
        { name: 'Sorting', path: '/sorting' },
        { name: 'Inventory', path: '/inventory' },
        { name: 'Attendance', path: '/attendance' },
        { name: 'Employees', path: '/employees' },
        { name: 'Asset Management', path: '/assets' },
      ]
    },
    {
      title: 'Transaction',
      icon: <FaMoneyBillWave />,
      show: canViewTransactions,
      links: [
        { name: 'Cashbook', path: '/cashbook' },
        { name: 'Material Sales', path: '/material-sales' }
      ]
    },
    {
      title: 'Configuration',
      icon: <FaCog />,
      show: canManageUsers,
      links: [
        { name: 'Approvals', path: '/approvals' },
        { name: 'Users', path: '/users' },
        { name: 'Settings', path: '/settings' }
      ]
    }
  ];

  return (
    <aside className="bg-white w-64 h-full flex flex-col shadow-xl overflow-hidden">
      <div className="flex-shrink-0 flex items-center h-16 px-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
            <div className="bg-blue-500 p-2 rounded-lg"><FaGlobe className="text-white text-xl" /></div>
            <span className="text-xl font-bold text-slate-800">MRF Portal</span>
        </div>
      </div>

      <nav className="flex-grow overflow-y-auto p-4">
        <ul>
          {navSections.map(section => section.show && (
            <li key={section.title} className="mb-6">
              <div className="flex items-center space-x-3 text-slate-500 font-semibold mb-3 px-2">
                {section.icon}
                <span>{section.title.toUpperCase()}</span>
              </div>
              <ul>
                {section.links.map(link => (
                  <li key={link.name}>
                    <NavLink to={link.path} onClick={handleLinkClick}>
                      {({ isActive }) => (
                        <div className={`flex items-center justify-between p-3 rounded-lg my-1 transition-all ${isActive ? 'bg-blue-100' : 'hover:bg-slate-100'}`}>
                          <span className={`font-semibold ${isActive ? 'text-blue-600' : 'text-slate-600'}`}>{link.name}</span>
                          {isActive && <FaChevronRight className="text-blue-600 text-sm" />}
                        </div>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex-shrink-0 border-t border-slate-200 p-4">
        <button onClick={handleLogout} className="w-full flex items-center space-x-3 p-3 rounded-lg font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-800">
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;