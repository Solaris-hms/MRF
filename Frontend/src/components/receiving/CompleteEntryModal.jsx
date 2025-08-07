import React, { useState, useEffect } from 'react';
import { FaBalanceScale, FaTimes } from 'react-icons/fa';
import Select from 'react-select';
import { completeInwardEntry } from '../../services/apiService';

const CompleteEntryModal = ({ isOpen, onClose, entry, onSave, exportableMaterials }) => {
    const [tareWeight, setTareWeight] = useState('');
    const [netWeight, setNetWeight] = useState(0);
    const [selectedMaterial, setSelectedMaterial] = useState(null);

    const isExportingEmptyVehicle = entry?.entry_type === 'Empty Vehicle';

    // This effect runs ONLY when the entry changes (i.e., when the modal opens).
    // It is responsible for resetting the form fields.
    useEffect(() => {
        if (entry) {
            setTareWeight('');
            setSelectedMaterial(null);
        }
    }, [entry]);

    // This second effect is now ONLY for calculating the net weight.
    // It runs whenever the tare weight changes, without affecting the material dropdown.
    useEffect(() => {
        if (entry) {
            const gross = parseFloat(entry.gross_weight_tons) || 0;
            const tare = parseFloat(tareWeight) || 0;
            setNetWeight(Math.abs(gross - tare).toFixed(3));
        }
    }, [entry, tareWeight]);


    const handleSave = () => {
        if (!tareWeight || parseFloat(tareWeight) <= 0) {
            alert("Please enter a valid Outward Weight.");
            return;
        }
        if (isExportingEmptyVehicle && !selectedMaterial) {
            alert("Please select the material being exported.");
            return;
        }
        
        onSave(entry.id, tareWeight, selectedMaterial ? selectedMaterial.label : null);
        // Form fields are now reset by the useEffect hook when the modal re-opens.
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg">
                <button type="button" onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                    <FaTimes size={20} />
                </button>
                <div className="flex items-center space-x-3 mb-4">
                    <FaBalanceScale className="text-3xl text-green-500"/>
                    <h2 className="text-xl font-bold text-slate-800">Complete Entry: Weigh-Out</h2>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4 space-y-1">
                    <p><strong>Vehicle:</strong> <span className="font-mono text-blue-600">{entry?.vehicle_number}</span></p>
                    <p><strong>Location:</strong> <span className="font-medium">{entry?.source_name}</span></p>
                    <p><strong>Inward Weight:</strong> <span className="font-bold">{entry?.gross_weight_tons?.toFixed(3)} Tons</span></p>
                </div>
                
                {isExportingEmptyVehicle && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Material Exporting</label>
                        <Select
                            options={exportableMaterials} value={selectedMaterial}
                            onChange={setSelectedMaterial} placeholder="Select an item..." required
                        />
                    </div>
                )}
                
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Enter Outward Weight (Tons)</label>
                    <input 
                        type="number" step="0.001" value={tareWeight} 
                        onChange={(e) => setTareWeight(e.target.value)} 
                        className="w-full p-2.5 text-lg border-2 rounded-lg" 
                        autoFocus
                    />
                </div>
                <div className="mt-4">
                    <p className="text-sm font-medium text-slate-700">Calculated Net Weight:</p>
                    <p className="text-3xl font-bold text-green-600">{netWeight} Tons</p>
                </div>
                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                    <button type="button" onClick={onClose} className="px-6 py-2 bg-slate-200 rounded-lg">Cancel</button>
                    <button onClick={handleSave} className="px-6 py-2 bg-green-500 text-white rounded-lg">Save & Complete Entry</button>
                </div>
            </div>
        </div>
    );
};

export default CompleteEntryModal;