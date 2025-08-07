import React, { useState, useEffect } from 'react';
import { FaUsersCog, FaCheckCircle, FaTimesCircle, FaEdit, FaTrash } from 'react-icons/fa';
import { getAllUsers, getAllRoles, updateUser, rejectUser } from '../services/apiService';
import EditUserModal from '../components/admin/EditUserModal';

const UserManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [usersResponse, rolesResponse] = await Promise.all([getAllUsers(), getAllRoles()]);
            setUsers(usersResponse.data || []);
            setRoles(rolesResponse.data || []);
        } catch (err) {
            setError('Failed to fetch data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenEditModal = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
    };

    const handleSaveUser = async (userId, userData) => {
        try {
            await updateUser(userId, userData);
            fetchData(); 
            handleCloseModal();
        } catch (err) {
            alert('Failed to update user.');
            console.error(err);
        }
    };
    
    const handleDeleteUser = async (userId, userName) => {
        if (window.confirm(`Are you sure you want to delete the user "${userName}"? This action cannot be undone.`)) {
            try {
                await rejectUser(userId);
                setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
            } catch (err) {
                alert('Failed to delete user.');
                console.error(err);
            }
        }
    };

    return (
        <>
            <div className="space-y-8">
                <div className="flex items-center space-x-3">
                    <FaUsersCog className="text-3xl text-blue-500" />
                    <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="th">Full Name</th>
                                    <th className="th">Username</th>
                                    <th className="th">Email</th>
                                    <th className="th">Designation</th>
                                    <th className="th">Role</th>
                                    <th className="th text-center">Status</th>
                                    <th className="th text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {loading && <tr><td colSpan="7" className="text-center py-10">Loading users...</td></tr>}
                                {error && <tr><td colSpan="7" className="text-center py-10 text-red-500">{error}</td></tr>}
                                {!loading && !error && users.map(user => (
                                    <tr key={user.id} className="hover:bg-slate-50">
                                        <td className="td font-medium">{user.full_name}</td>
                                        <td className="td font-mono">{user.username || 'N/A'}</td>
                                        <td className="td">{user.email}</td>
                                        <td className="td">{user.designation || 'N/A'}</td>
                                        <td className="td">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                user.role_name === 'Admin' ? 'bg-red-100 text-red-800' :
                                                user.role_name === 'Supervisor' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-blue-100 text-blue-800'
                                            }`}>
                                                {user.role_name || 'Not Assigned'}
                                            </span>
                                        </td>
                                        <td className="td text-center">
                                            {user.is_approved ? (
                                                <FaCheckCircle className="text-green-500 mx-auto" title="Approved" />
                                            ) : (
                                                <FaTimesCircle className="text-gray-400 mx-auto" title="Pending" />
                                            )}
                                        </td>
                                        <td className="td text-center space-x-4">
                                            <button onClick={() => handleOpenEditModal(user)} className="text-blue-600 hover:text-blue-800" title="Edit User">
                                                <FaEdit />
                                            </button>
                                            <button onClick={() => handleDeleteUser(user.id, user.full_name)} className="text-red-600 hover:text-red-800" title="Delete User">
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <EditUserModal 
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    user={selectedUser}
                    roles={roles}
                    onSave={handleSaveUser}
                />
            )}
        </>
    );
};

export default UserManagementPage;