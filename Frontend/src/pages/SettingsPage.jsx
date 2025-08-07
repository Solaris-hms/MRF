import React, { useState, useEffect } from 'react';
import { FaCog, FaSave, FaShieldAlt } from 'react-icons/fa';
import { getAllRoles, getAllPermissions, getPermissionsForRole, updatePermissionsForRole } from '../services/apiService';

const SettingsPage = () => {
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [selectedRole, setSelectedRole] = useState('');
    const [rolePermissions, setRolePermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                const [rolesRes, permissionsRes] = await Promise.all([getAllRoles(), getAllPermissions()]);
                setRoles(rolesRes.data || []);
                setPermissions(permissionsRes.data || []);
            } catch (error) {
                setError('Failed to load initial configuration data.');
                console.error("Failed to fetch initial data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    const handleRoleChange = async (roleId) => {
        if (!roleId) {
            setSelectedRole('');
            setRolePermissions([]);
            return;
        }
        setSelectedRole(roleId);
        try {
            const res = await getPermissionsForRole(roleId);
            setRolePermissions(res.data || []);
        } catch (error) {
            setError('Failed to fetch permissions for the selected role.');
            console.error("Failed to fetch permissions for role", error);
        }
    };

    const handlePermissionToggle = (permissionId) => {
        setRolePermissions(prev => 
            prev.includes(permissionId) 
                ? prev.filter(id => id !== permissionId) 
                : [...prev, permissionId]
        );
    };

    const handleSaveChanges = async () => {
        if (!selectedRole) {
            alert('Please select a role to update.');
            return;
        }
        try {
            await updatePermissionsForRole(selectedRole, rolePermissions);
            alert('Permissions updated successfully!');
        } catch (error) {
            alert('Failed to save permissions.');
            console.error(error);
        }
    };

    if (loading) return <div className="text-center p-8">Loading Settings...</div>;
    if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

    return (
        <div className="space-y-8">
            <div className="flex items-center space-x-3">
                <FaCog className="text-3xl text-blue-500" />
                <h1 className="text-2xl font-bold text-slate-800">Settings - Role Permissions</h1>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex flex-wrap items-end gap-4">
                    <div className="flex-grow">
                        <label htmlFor="role-select" className="block text-sm font-medium text-slate-700 mb-1">Select a Role to Manage</label>
                        <select 
                            id="role-select"
                            value={selectedRole}
                            onChange={(e) => handleRoleChange(e.target.value)}
                            className="w-full p-2 h-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">-- Select a Role --</option>
                            {roles.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}
                        </select>
                    </div>
                    <button onClick={handleSaveChanges} className="px-4 h-10 bg-blue-500 text-white font-semibold rounded-lg flex items-center gap-2 hover:bg-blue-600 disabled:bg-slate-400" disabled={!selectedRole}>
                        <FaSave /> Save Changes
                    </button>
                </div>

                {selectedRole && (
                    <div className="mt-8 border-t pt-6">
                        <h2 className="text-lg font-bold text-slate-700 mb-4">Assign Permissions for "{roles.find(r => r.id == selectedRole)?.name}"</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {permissions.map(p => (
                                <div key={p.id} className="flex items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                                    <input 
                                        type="checkbox"
                                        id={`perm-${p.id}`}
                                        checked={rolePermissions.includes(p.id)}
                                        onChange={() => handlePermissionToggle(p.id)}
                                        className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor={`perm-${p.id}`} className="ml-3 text-sm font-medium text-slate-800 flex items-center gap-2">
                                        <FaShieldAlt className="text-slate-400" /> {p.action}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SettingsPage;