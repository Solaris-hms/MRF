import React, { useState, useEffect } from 'react';
import { FaClipboardCheck, FaSearch, FaPlus, FaMinus, FaFileAlt } from 'react-icons/fa';
import { getInventory, getAuditLogs } from '../services/apiService';
import AuditModal from '../components/audit/AuditModal'; 

const AuditPage = () => {
    const [inventory, setInventory] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [inventoryRes, logsRes] = await Promise.all([
                getInventory(),
                getAuditLogs() // Fetch mock audit logs
            ]);
            setInventory(inventoryRes.data || []);
            setAuditLogs(logsRes.data || []);
        } catch (err) {
            setError('Failed to fetch page data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenModal = (material) => {
        setSelectedMaterial(material);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedMaterial(null);
    };

    const handleSaveAudit = (auditedMaterial, newLogEntry) => {
        setInventory(inventory.map(item =>
            item.id === auditedMaterial.id ? auditedMaterial : item
        ));
        // Add the new log to the top of the list
        setAuditLogs(prevLogs => [newLogEntry, ...prevLogs]);
        handleCloseModal();
    };

    const filteredInventory = inventory.filter(item =>
        item.material_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="text-center p-8">Loading Inventory...</div>;
    if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <FaClipboardCheck className="text-3xl text-blue-500" />
                    <h1 className="text-2xl font-bold text-slate-800">Inventory Audit</h1>
                </div>
            </div>

            <div className="relative">
                <FaSearch className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search for a material..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 pl-12 border border-slate-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="th">Material Name</th>
                                <th className="th text-right">Current Stock (Tons)</th>
                                <th className="th text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredInventory.map(item => (
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="td font-medium text-slate-900">{item.material_name}</td>
                                    <td className="td text-right font-bold text-lg text-slate-700">
                                        {item.current_stock_tons.toLocaleString('en-IN', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
                                    </td>
                                    <td className="td text-center">
                                        <button
                                            onClick={() => handleOpenModal(item)}
                                            className="px-4 py-1.5 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600"
                                        >
                                            Adjust Stock
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Audit Log Section */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center space-x-3 mb-4">
                    <FaFileAlt className="text-2xl text-slate-500" />
                    <h2 className="text-xl font-bold text-slate-800">Audit Log</h2>
                </div>
                <div className="overflow-x-auto max-h-96">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50 sticky top-0">
                            <tr>
                                <th className="th">Timestamp</th>
                                <th className="th">Material</th>
                                <th className="th text-right">Adjustment</th>
                                <th className="th text-right">Old Stock</th>
                                <th className="th text-right">New Stock</th>
                                <th className="th">Reason</th>
                                <th className="th">Audited By</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {auditLogs.length > 0 ? auditLogs.map(log => (
                                <tr key={log.id} className="hover:bg-slate-50">
                                    <td className="td text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                                    <td className="td font-medium">{log.material_name}</td>
                                    <td className={`td text-right font-bold ${log.adjustment_amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {log.adjustment_amount > 0 ? '+' : ''}{log.adjustment_amount.toFixed(3)}
                                    </td>
                                    <td className="td text-right">{log.old_stock.toFixed(3)}</td>
                                    <td className="td text-right font-semibold">{log.new_stock.toFixed(3)}</td>
                                    <td className="td">{log.reason}</td>
                                    <td className="td">{log.audited_by}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-10 text-slate-500">
                                        No audit records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AuditModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                material={selectedMaterial}
                onSave={handleSaveAudit}
            />
        </div>
    );
};

export default AuditPage;