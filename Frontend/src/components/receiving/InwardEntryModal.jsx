import React, { useState, useEffect } from 'react';
import { FaTimes, FaTruck, FaMapMarkerAlt, FaBalanceScale, FaBoxes, FaUserTie } from 'react-icons/fa';
import CreatableSelect from 'react-select/creatable';

const InwardEntryModal = ({ isOpen, onClose, entryType, sources, destinations, materials, parties, onSave }) => {
    const isDryWaste = entryType === 'Dry Waste';

    // --- THIS IS THE FIX ---
    // It finds the 'Dry Waste' object from the materials list to use as a default.
    const defaultDryWasteMaterial = materials.find(m => m.label === 'Dry Waste');

    const getInitialFormState = () => ({
        vehicleNumber: '',
        grossWeight: '',
        // If it's a Dry Waste entry, use the default object. Otherwise, use 'Empty'.
        material: isDryWaste ? defaultDryWasteMaterial : { value: 'empty', label: 'Empty' },
    });

    const [formData, setFormData] = useState(getInitialFormState());
    const [selectedPartner, setSelectedPartner] = useState(null);
    const [selectedParty, setSelectedParty] = useState(null);

    useEffect(() => {
        // This effect now correctly resets the form state every time the modal is opened.
        setFormData(getInitialFormState());
        setSelectedPartner(null);
        setSelectedParty(null);
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleMaterialChange = (newValue) => {
        setFormData(prevState => ({ ...prevState, material: newValue }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!formData.vehicleNumber || !selectedPartner || !formData.grossWeight) {
            alert('Please fill all required fields.');
            return;
        }
        if (isDryWaste && !formData.material) {
            alert('Please select a material type.');
            return;
        }
        if (!isDryWaste && !selectedParty) {
            alert('Please select a party.');
            return;
        }

        onSave({ ...formData, partner: selectedPartner, party: selectedParty, entryType: entryType });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
            <form onSubmit={handleSubmit} className="relative bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl">
                <button type="button" onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                    <FaTimes size={20} />
                </button>
                
                <h2 className="text-xl font-bold text-slate-800 mb-6">{isDryWaste ? 'Log New Dry Waste Vehicle' : 'Log New Empty Vehicle'}</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Vehicle Number" name="vehicleNumber" value={formData.vehicleNumber} onChange={handleChange} icon={<FaTruck />} required />
                    
                    {isDryWaste ? (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Source Location</label>
                            <CreatableSelect
                                isClearable options={sources} value={selectedPartner}
                                onChange={setSelectedPartner}
                                placeholder="Select or create a source..." required
                            />
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Destination</label>
                            <CreatableSelect
                                isClearable options={destinations} value={selectedPartner}
                                onChange={setSelectedPartner}
                                placeholder="Select or create a destination..." required
                            />
                        </div>
                    )}
                    
                    <InputField label="Gross Weight (Tons)" name="grossWeight" type="number" step="0.001" value={formData.grossWeight} onChange={handleChange} icon={<FaBalanceScale />} required />
                    
                    {isDryWaste ? (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Material Type</label>
                             <CreatableSelect
                                isClearable options={materials} value={formData.material}
                                onChange={handleMaterialChange}
                                placeholder="Select or type a material..." required
                            />
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Party Name</label>
                            <CreatableSelect
                                isClearable options={parties} value={selectedParty}
                                onChange={setSelectedParty}
                                placeholder="Select or create a party..." required
                            />
                        </div>
                    )}
                </div>

                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                    <button type="button" onClick={onClose} className="px-6 py-2 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300">Cancel</button>
                    <button type="submit" className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600">Save Entry</button>
                </div>
            </form>
        </div>
    );
};

const InputField = ({ label, name, icon, ...props }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>
            <input 
                id={name} name={name}
                className="w-full h-10 pl-10 pr-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...props}
            />
        </div>
    </div>
);

export default InwardEntryModal;