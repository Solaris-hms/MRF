import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';

import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import Dashboard from './pages/Dashboard';
import ReceivingPage from './pages/Receiving.jsx';
import CompletedEntriesPage from './pages/CompletedEntriesPage';
import LoginPage from './pages/LoginPage';
import RequestAccessPage from './pages/RequestAccessPage';
import ApprovalPage from './pages/ApprovalPage';
import UserManagementPage from './pages/UserManagementPage';
import SettingsPage from './pages/SettingsPage';
import SortingPage from './pages/SortingPage';
import InventoryPage from './pages/InventoryPage';
import CashbookPage from './pages/CashbookPage';
import MaterialSalesPage from './pages/MaterialSalesPage';
import AttendancePage from './pages/AttendancePage';
import EmployeePage from './pages/EmployeePage';
import AssetManagementPage from './pages/AssetManagementPage';
import VendorRegistrationPage from './pages/VendorRegistrationPage';
import authService from './services/authService';

const ProtectedRoute = () => {
  const token = authService.getCurrentToken();
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

const PermissionRoute = ({ requiredPermission }) => {
    const user = authService.getCurrentUser();
    const hasPermission = user?.permissions?.includes(requiredPermission);
    return hasPermission ? <Outlet /> : <Navigate to="/" replace />;
};

const PlaceholderPage = ({ title }) => (
  <div className="bg-white p-8 rounded-xl shadow-lg">
    <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
    <p className="mt-4 text-slate-600">Page content for {title.toLowerCase()} will be built here.</p>
  </div>
);

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex h-screen bg-slate-100">
        <div 
            className={`fixed inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
            md:relative md:translate-x-0 transition-transform duration-300 ease-in-out z-30`}
        >
            <Sidebar setSidebarOpen={setSidebarOpen} />
        </div>
        {sidebarOpen && (
            <div 
                onClick={() => setSidebarOpen(false)}
                className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
                aria-hidden="true"
            ></div>
        )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar setSidebarOpen={setSidebarOpen} sidebarOpen={sidebarOpen} />
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

function App() {
  // Fixed scroll issue for number inputs
  useEffect(() => {
    const preventNumberChange = (e) => {
        if (e.target.type === 'number') {
            e.target.blur();
        }
    };
    
    document.addEventListener('wheel', preventNumberChange);
    return () => document.removeEventListener('wheel', preventNumberChange);
  }, []);

  // Check token validity on app startup
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = authService.getCurrentToken();
      const currentPath = window.location.pathname;
      
      // If no valid token and not already on login/register pages
      if (!token && !['/login', '/request-access'].includes(currentPath)) {
        console.log('No valid token found, redirecting to login');
        window.location.href = '/login';
      }
    };

    checkAuthStatus();
  }, []);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/request-access" element={<RequestAccessPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
            
            <Route element={<PermissionRoute requiredPermission="manage:users" />}>
                <Route path="/approvals" element={<ApprovalPage />} />
                <Route path="/users" element={<UserManagementPage />} />
                <Route path="/settings" element={<SettingsPage />} />
            </Route>

            <Route element={<PermissionRoute requiredPermission="view:dashboard" />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/reports" element={<PlaceholderPage title="Reports" />} />
            </Route>

            <Route element={<PermissionRoute requiredPermission="view:cashbook" />}>
                <Route path="/cashbook" element={<CashbookPage />} />
                <Route path="/material-sales" element={<MaterialSalesPage />} />
            </Route>

            <Route path="/receiving" element={<ReceivingPage />} />
            <Route path="/completed-entries" element={<CompletedEntriesPage />} />
            <Route path="/sorting" element={<SortingPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/employees" element={<EmployeePage />} />
            <Route path="/assets" element={<AssetManagementPage />} />
            <Route path="/vendor-registration" element={<VendorRegistrationPage />} />

        </Route>
      </Route>
    </Routes>
  );
}

export default App;