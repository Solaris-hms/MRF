import React, { useState, useEffect } from 'react';
import { FaUsers, FaCheck, FaTimes, FaUserShield } from 'react-icons/fa';
import { getPendingUsers, approveUser, rejectUser, getAllRoles } from '../services/apiService';
import { useAppContext } from '../context/AppContext';

const ApprovalPage = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedRoles, setSelectedRoles] = useState({});
    const { setPendingApprovals } = useAppContext();

    const fetchData = async () => {
        try {
            setLoading(true);
            const [usersResponse, rolesResponse] = await Promise.all([
                getPendingUsers(),
                getAllRoles()
            ]);
            const pendingUsers = usersResponse.data || [];
            setUsers(pendingUsers);
            setRoles(rolesResponse.data || []);
            setPendingApprovals(pendingUsers.length);
        } catch (err) {
            setError('Failed to fetch data. Please ensure you have permissions.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRoleChange = (userId, roleId) => {
        // --- THIS IS THE FIX ---
        // We convert the roleId from a string to a number before setting state.
        setSelectedRoles(prev => ({ ...prev, [userId]: parseInt(roleId, 10) }));
    };

    const handleApprove = async (userId) => {
        const roleId = selectedRoles[userId];
        if (!roleId) {
            alert('Please select a role for the user before approving.');
            return;
        }
        try {
            await approveUser(userId, roleId);
            setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
            setPendingApprovals(prev => Math.max(0, prev - 1));
        } catch (err) {
            alert('Failed to approve user.');
        }
    };

    const handleReject = async (userId) => {
        if (window.confirm('Are you sure you want to reject this request?')) {
            try {
                await rejectUser(userId);
                setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
                setPendingApprovals(prev => Math.max(0, prev - 1));
            } catch (err) {
                alert('Failed to reject user.');
            }
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center space-x-3">
                <FaUserShield className="text-3xl text-blue-500" />
                <h1 className="text-2xl font-bold text-slate-800">Access Requests</h1>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="th">Full Name</th>
                                <th className="th">Username</th>
                                <th className="th">Designation</th>
                                <th className="th">Email</th>
                                <th className="th">Date Requested</th>
                                <th className="th text-center" style={{width: '250px'}}>Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {loading && <tr><td colSpan="6" className="text-center py-10">Loading...</td></tr>}
                            {error && <tr><td colSpan="6" className="text-center py-10 text-red-500">{error}</td></tr>}
                            {!loading && !error && users && users.length > 0 ? users.map(user => (
                                <tr key={user.id} className="hover:bg-slate-50">
                                    <td className="td font-medium">{user.full_name}</td>
                                    <td className="td font-mono">{user.username}</td>
                                    <td className="td">{user.designation}</td>
                                    <td className="td">{user.email}</td>
                                    <td className="td">{new Date(user.created_at).toLocaleDateString()}</td>
                                    <td className="td text-center space-x-2">
                                        <select 
                                            onChange={(e) => handleRoleChange(user.id, e.target.value)} 
                                            value={selectedRoles[user.id] || ''}
                                            className="p-1.5 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                        >
                                            <option value="" disabled>Select Role</option>
                                            {roles.map(role => (
                                                <option key={role.id} value={role.id}>{role.name}</option>
                                            ))}
                                        </select>
                                        <button onClick={() => handleApprove(user.id)} className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"><FaCheck /></button>
                                        <button onClick={() => handleReject(user.id)} className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"><FaTimes /></button>
                                    </td>
                                </tr>
                            )) : (
                                !loading && !error && <tr><td colSpan="6" className="text-center py-10 text-slate-500">No pending access requests.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ApprovalPage;