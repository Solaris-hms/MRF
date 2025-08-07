import React, { useState, useEffect } from 'react';
import { FaRecycle, FaSave, FaCalendarAlt } from 'react-icons/fa';
import { createSortingLog, getSortingLogs } from '../services/apiService';
// --- THIS IS THE FIX ---
import { SORTABLE_MATERIALS } from '../config/materials';

const getTodayDate = () => new Date().toISOString().split('T')[0];

const SortingPage = () => {
    const [materialQuantities, setMaterialQuantities] = useState({});
    const [entryDate, setEntryDate] = useState(getTodayDate());
    const [allLogs, setAllLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const response = await getSortingLogs();
            setAllLogs(response.data || []);
        } catch (err) {
            setError('Failed to fetch sorting logs.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const handleQuantityChange = (materialName, quantity) => {
        setMaterialQuantities(prev => ({ ...prev, [materialName]: quantity }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        // The page now maps over the imported SORTABLE_MATERIALS list
        const entriesToSave = SORTABLE_MATERIALS
            .map(material => ({
                material: material,
                quantity_tons: parseFloat(materialQuantities[material]) || 0,
            }))
            .filter(entry => entry.quantity_tons > 0);

        if (entriesToSave.length === 0) {
            alert('Please enter a quantity for at least one material.');
            setIsSubmitting(false);
            return;
        }

        const logData = { log_date: entryDate, entries: entriesToSave };

        try {
            await createSortingLog(logData);
            alert(`Sorting log for ${entryDate} saved successfully!`);
            setMaterialQuantities({});
            fetchLogs();
        } catch (error) {
            alert(`Error: ${error.response?.data?.error || "Failed to save sorting log."}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center space-x-3">
                <FaRecycle className="text-3xl text-green-500" />
                <h1 className="text-2xl font-bold text-slate-800">Daily Sorting Log</h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex flex-wrap justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-xl font-bold text-slate-800">Log Sorted Quantities (in Tons)</h2>
                    <div className="relative">
                        <label htmlFor="entryDate" className="font-semibold text-slate-700 mr-2">Entry Date:</label>
                        <input
                            type="date" id="entryDate" value={entryDate}
                            onChange={(e) => setEntryDate(e.target.value)}
                            className="p-2 border rounded-lg h-10"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {SORTABLE_MATERIALS.map(material => (
                        <div key={material}>
                            <label className="block text-sm font-medium text-slate-600 mb-1">{material}</label>
                            <input
                                type="number" step="0.001" placeholder="0.000"
                                value={materialQuantities[material] || ''}
                                onChange={(e) => handleQuantityChange(material, e.target.value)}
                                className="w-full p-2 border rounded-lg"
                            />
                        </div>
                    ))}
                </div>
                
                <div className="flex justify-end mt-6 pt-4 border-t">
                    <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg">
                        <FaSave /> {isSubmitting ? 'Saving...' : 'Save Log for Date'}
                    </button>
                </div>
            </form>

            <div className="bg-white p-6 rounded-xl shadow-lg">
                 <h2 className="text-xl font-bold text-slate-800 mb-4">All Sorting Log Entries</h2>
                 <div className="overflow-x-auto">
                    <table className="min-w-full divide-y">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="th">Date</th>
                                <th className="th">Time</th>
                                <th className="th">Logged Materials</th>
                            </tr>
                        </thead>
                         <tbody className="bg-white divide-y">
                            {loading && <tr><td colSpan="3" className="text-center py-10">Loading logs...</td></tr>}
                            {error && <tr><td colSpan="3" className="text-center py-10 text-red-500">{error}</td></tr>}
                            {!loading && !error && allLogs.length > 0 ? allLogs.map(log => (
                                <tr key={log.id}>
                                    <td className="td">{new Date(log.log_date).toLocaleDateString()}</td>
                                    <td className="td">{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                    <td className="td">
                                        <div className="flex flex-wrap gap-2">
                                            {log.entries.map(entry => (
                                                <span key={entry.material} className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                                    {entry.material}: {entry.quantity_tons.toFixed(3)} Tons
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                !loading && !error && <tr><td colSpan="3" className="text-center py-10">No sorting logs saved yet.</td></tr>
                            )}
                         </tbody>
                    </table>
                 </div>
            </div>
        </div>
    );
};

export default SortingPage;