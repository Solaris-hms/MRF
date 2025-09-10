import React, { useState, useEffect } from 'react';
import { FaTimes, FaPlus, FaMinus } from 'react-icons/fa';
import { adjustInventory } from '../../services/apiService';
import authService from '../../services/authService';


const AuditModal = ({ isOpen, onClose, material, onSave }) => {
    const [adjustmentType, setAdjustmentType] = useState('Increase');
    const [adjustmentAmount, setAdjustmentAmount] = useState('');
    const [reason, setReason] = useState('');
    const [newQuantity, setNewQuantity] = useState(material?.current_stock_tons || 0);

    useEffect(() => {
        if (material) {
            const currentStock = material.current_stock_tons || 0;
            const adjustment = parseFloat(adjustmentAmount) || 0;
            let calculatedNewQuantity = currentStock;

            if (adjustmentType === 'Increase') {
                calculatedNewQuantity = currentStock + adjustment;
            } else {
                calculatedNewQuantity = currentStock - adjustment;
            }
            setNewQuantity(calculatedNewQuantity);
        }
    }, [material, adjustmentType, adjustmentAmount]);
    
    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setAdjustmentType('Increase');
            setAdjustmentAmount('');
            setReason('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSave = async () => {
        if (!adjustmentAmount || parseFloat(adjustmentAmount) <= 0) {
            alert('Please enter a valid adjustment amount.');
            return;
        }
        if (!reason.trim()) {
            alert('Please provide a reason for the adjustment.');
            return;
        }

        const adjustment = parseFloat(adjustmentAmount);
        const finalAdjustment = adjustmentType === 'Increase' ? adjustment : -adjustment;

        try {
            // This is where you would make the API call in a real app
            const response = await adjustInventory(material.id, finalAdjustment, reason);
            
            const newLogEntry = response.data.logEntry;

            onSave({
                ...material,
                current_stock_tons: newQuantity
            }, newLogEntry);

        } catch (error) {
            alert('Failed to save audit.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg">
                <button type="button" onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                    <FaTimes size={20} />
                </button>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Adjust Inventory</h2>
                <p className="text-slate-500 mb-6">Material: <span className="font-semibold">{material.material_name}</span></p>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Current Stock</label>
                        <input
                            type="text"
                            readOnly
                            value={`${material.current_stock_tons.toFixed(3)} Tons`}
                            className="w-full h-10 px-3 border border-slate-300 rounded-lg bg-slate-100"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Adjustment Type</label>
                        <div className="flex rounded-lg border border-slate-300 p-1">
                            <button
                                type="button"
                                onClick={() => setAdjustmentType('Increase')}
                                className={`w-1/2 flex items-center justify-center gap-2 p-1.5 rounded-md text-sm font-semibold ${adjustmentType === 'Increase' ? 'bg-green-500 text-white shadow' : 'hover:bg-slate-100'}`}
                            >
                                <FaPlus /> Increase Stock
                            </button>
                            <button
                                type="button"
                                onClick={() => setAdjustmentType('Decrease')}
                                className={`w-1/2 flex items-center justify-center gap-2 p-1.5 rounded-md text-sm font-semibold ${adjustmentType === 'Decrease' ? 'bg-red-500 text-white shadow' : 'hover:bg-slate-100'}`}
                            >
                                <FaMinus /> Decrease Stock
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Adjustment Amount (Tons)</label>
                        <input
                            type="number"
                            step="0.001"
                            placeholder="e.g., 1.250"
                            value={adjustmentAmount}
                            onChange={(e) => setAdjustmentAmount(e.target.value)}
                            className="w-full h-10 px-3 border border-slate-300 rounded-lg"
                            required
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Reason for Adjustment</label>
                        <textarea
                            rows="3"
                            placeholder="e.g., Physical count correction, damaged goods, etc."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full p-3 border border-slate-300 rounded-lg"
                            required
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">New Quantity</label>
                        <input
                            type="text"
                            readOnly
                            value={`${newQuantity.toFixed(3)} Tons`}
                            className="w-full h-10 px-3 border border-slate-300 rounded-lg bg-slate-100 font-bold"
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                    <button type="button" onClick={onClose} className="px-6 py-2 bg-slate-200 rounded-lg">Cancel</button>
                    <button onClick={handleSave} className="px-6 py-2 bg-blue-500 text-white rounded-lg">Save Adjustment</button>
                </div>
            </div>
        </div>
    );
};

export default AuditModal;