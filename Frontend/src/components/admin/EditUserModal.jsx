import React, { useState, useEffect } from 'react';
import { FaTimes, FaUser, FaUserTag, FaEnvelope, FaBriefcase, FaUserShield } from 'react-icons/fa';

const EditUserModal = ({ isOpen, onClose, user, roles, onSave }) => {
    // --- THIS IS THE FIX ---
    // We create a sanitized user object, ensuring no fields are null.
    const getInitialFormData = (user) => {
        return {
            full_name: user?.full_name || '',
            username: user?.username || '',
            email: user?.email || '',
            designation: user?.designation || '',
        };
    };
    
    const [formData, setFormData] = useState(getInitialFormData(user));
    const [selectedRole, setSelectedRole] = useState('');

    useEffect(() => {
        if (user && roles.length > 0) {
            const currentRole = roles.find(r => r.name === user.role_name);
            setSelectedRole(currentRole ? currentRole.id : '');
        }
        // When the user prop changes, reset the form data.
        setFormData(getInitialFormData(user));
    }, [user, roles]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRoleChange = (e) => {
        setSelectedRole(e.target.value);
    };

    const handleSave = () => {
        if (!selectedRole) {
            alert('Please select a role for the user.');
            return;
        }
        const userData = {
            ...formData, // Use the spread operator for cleanliness
            role_id: parseInt(selectedRole, 10),
        };
        onSave(user.id, userData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                    <FaTimes size={20} />
                </button>
                <h2 className="text-xl font-bold text-slate-800 mb-4">Edit User Details</h2>
                
                <div className="space-y-4">
                    <InputField label="Full Name" name="full_name" value={formData.full_name} onChange={handleChange} icon={<FaUser />} />
                    <InputField label="Username" name="username" value={formData.username} onChange={handleChange} icon={<FaUserTag />} />
                    <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} icon={<FaEnvelope />} />
                    <InputField label="Designation" name="designation" value={formData.designation} onChange={handleChange} icon={<FaBriefcase />} />
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                        <div className="relative">
                            <FaUserShield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <select value={selectedRole} onChange={handleRoleChange} className="w-full h-12 pl-12 pr-4 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="" disabled>Select a role</option>
                                {roles.map(role => (
                                    <option key={role.id} value={role.id}>{role.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                    <button onClick={onClose} className="px-6 py-2 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300">Cancel</button>
                    <button onClick={handleSave} className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600">Save Changes</button>
                </div>
            </div>
        </div>
    );
};

const InputField = ({ label, name, value, onChange, icon, type = 'text' }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        <div className="relative">
            {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
            <input 
                type={type} 
                name={name} 
                value={value || ''} 
                onChange={onChange} 
                className="w-full h-12 pl-12 pr-4 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
    </div>
);

export default EditUserModal;