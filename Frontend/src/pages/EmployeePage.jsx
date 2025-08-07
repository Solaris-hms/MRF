import React, { useState, useEffect } from 'react';
import { FaUsers, FaPlus, FaEdit, FaTrash, FaTimes, FaUser, FaBriefcase, FaIdCard } from 'react-icons/fa';
import CreatableSelect from 'react-select/creatable';
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from '../services/apiService';

const EmployeePage = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const res = await getEmployees();
            setEmployees(res.data || []);
        } catch (error) {
            console.error("Failed to fetch employees", error);
            alert("Could not load employee data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const openModal = (employee = null) => {
        setEditingEmployee(employee);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingEmployee(null);
    };

    const handleSave = async (employeeData) => {
        try {
            if (editingEmployee) {
                await updateEmployee(editingEmployee.id, employeeData);
            } else {
                if (employees.some(emp => emp.id === employeeData.id)) {
                    alert('Employee ID already exists. Please use a unique ID.');
                    return;
                }
                await createEmployee(employeeData);
            }
            fetchEmployees();
            closeModal();
        } catch (error) {
            alert('Failed to save employee.');
        }
    };
    
    const handleDelete = async (employeeId) => {
        if (window.confirm('Are you sure you want to deactivate this employee? They will be removed from the active list but their past records will be kept.')) {
            try {
                await deleteEmployee(employeeId);
                fetchEmployees();
            } catch (error) {
                alert('Failed to deactivate employee.');
            }
        }
    };

    // --- THIS IS NEW: Create a unique list of designations for the dropdown ---
    const designationOptions = React.useMemo(() => {
        const uniqueDesignations = [...new Set(employees.map(e => e.designation))];
        return uniqueDesignations.map(d => ({ value: d, label: d }));
    }, [employees]);

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center space-x-3">
                    <FaUsers className="text-3xl text-blue-500" />
                    <h1 className="text-2xl font-bold text-slate-800">Employee Management</h1>
                </div>
                <button onClick={() => openModal()} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600">
                    <FaPlus />
                    Add New Employee
                </button>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="th">Employee ID</th>
                                <th className="th">Full Name</th>
                                <th className="th">Designation</th>
                                <th className="th text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {loading && <tr><td colSpan="4" className="text-center py-10">Loading...</td></tr>}
                            {!loading && employees.map(employee => (
                                <tr key={employee.id} className="hover:bg-slate-50">
                                    <td className="td font-mono text-slate-500">EMP-{String(employee.id).padStart(4, '0')}</td>
                                    <td className="td font-medium text-slate-900">{employee.name}</td>
                                    <td className="td">{employee.designation}</td>
                                    <td className="td text-center space-x-4">
                                        <button onClick={() => openModal(employee)} className="text-blue-600 hover:text-blue-800" title="Edit">
                                            <FaEdit />
                                        </button>
                                        <button onClick={() => handleDelete(employee.id)} className="text-red-600 hover:text-red-800" title="Delete">
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <EmployeeModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSave={handleSave}
                employee={editingEmployee}
                designationOptions={designationOptions}
            />
        </div>
    );
};


const EmployeeModal = ({ isOpen, onClose, onSave, employee, designationOptions }) => {
    const [id, setId] = useState('');
    const [name, setName] = useState('');
    // --- THIS IS UPDATED: State now holds a react-select object ---
    const [designation, setDesignation] = useState(null);

    useEffect(() => {
        if (employee) {
            setId(employee.id);
            setName(employee.name);
            setDesignation({ value: employee.designation, label: employee.designation });
        } else {
            setId('');
            setName('');
            setDesignation(null);
        }
    }, [employee]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!id || !name || !designation) {
            alert('Please fill out all fields.');
            return;
        }
        // --- THIS IS UPDATED: We now save the 'label' from the designation object ---
        onSave({ id: parseInt(id, 10), name, designation: designation.label });
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
            <form onSubmit={handleSubmit} className="relative bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg">
                <button type="button" onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                    <FaTimes size={20} />
                </button>
                <h2 className="text-xl font-bold text-slate-800 mb-6">{employee ? 'Edit Employee' : 'Add New Employee'}</h2>
                
                <div className="space-y-4">
                    <InputField 
                        label="Employee ID" 
                        value={id} 
                        onChange={(e) => setId(e.target.value)} 
                        icon={<FaIdCard />} 
                        placeholder="e.g., 105" 
                        type="number"
                        required 
                        disabled={!!employee}
                    />
                    <InputField label="Full Name" value={name} onChange={(e) => setName(e.target.value)} icon={<FaUser />} placeholder="e.g., John Doe" required />
                    
                    {/* --- THIS IS THE UPDATED DROPDOWN --- */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Designation</label>
                        <CreatableSelect
                            isClearable
                            options={designationOptions}
                            value={designation}
                            onChange={setDesignation}
                            placeholder="Select or create..."
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                    <button type="button" onClick={onClose} className="px-6 py-2 bg-slate-200 rounded-lg">Cancel</button>
                    <button type="submit" className="px-6 py-2 bg-blue-500 text-white rounded-lg">Save</button>
                </div>
            </form>
        </div>
    );
};

const InputField = ({ label, icon, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        <div className="relative">
            {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
            <input {...props} className="w-full h-10 pl-10 pr-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100" />
        </div>
    </div>
);

export default EmployeePage;