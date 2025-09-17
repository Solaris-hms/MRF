import React, { useState, useEffect, useMemo } from 'react';
import { FaTruckLoading, FaTruck, FaTint } from 'react-icons/fa';
import PendingEntriesTable from '../components/receiving/PendingEntriesTable';
import CompleteEntryModal from '../components/receiving/CompleteEntryModal';
import InwardEntryModal from '../components/receiving/InwardEntryModal';
import { getPendingEntries, createInwardEntry, completeInwardEntry, getAllPartners, createPartner, deleteInwardEntry } from '../services/apiService';
import { EXPORTABLE_MATERIALS } from '../config/materials';

const defaultMaterials = [
    { value: 'dry-waste', label: 'Dry Waste' },
    { value: 'cardboard', label: 'Cardboard' },
    { value: 'mixed-plastic', label: 'Mixed Plastic' },
    { value: 'paper', label: 'Paper' },
];

const exportableMaterials = EXPORTABLE_MATERIALS.map(item => ({
    value: item.toLowerCase().replace(/ /g, '-'),
    label: item
}));


const ReceivingPage = () => {
    const [entries, setEntries] = useState([]);
    const [allPartners, setAllPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
    const [entryType, setEntryType] = useState(null);
    const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
    const [entryToComplete, setEntryToComplete] = useState(null);

    const sources = useMemo(() => allPartners.filter(p => p.type === 'Source').map(s => ({ value: s.id, label: s.name })), [allPartners]);
    const destinations = useMemo(() => allPartners.filter(p => p.type === 'Destination').map(d => ({ value: d.id, label: d.name })), [allPartners]);
    const parties = useMemo(() => allPartners.filter(p => p.type === 'Party').map(p => ({ value: p.id, label: p.name })), [allPartners]);
    const waterTankerVendors = useMemo(() => allPartners.filter(p => p.type === 'Water Tanker Vendor').map(p => ({ value: p.id, label: p.name })), [allPartners]);


    const fetchData = async () => {
        try {
            setLoading(true);
            const [pendingRes, partnersRes] = await Promise.all([
                getPendingEntries(),
                getAllPartners()
            ]);
            setEntries(pendingRes.data || []);
            setAllPartners(partnersRes.data || []);
        } catch (err) {
            setError('Failed to fetch initial data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenEntryModal = (type) => {
        setEntryType(type);
        setIsEntryModalOpen(true);
    };

    const handleOpenCompleteModal = (entry) => {
        setEntryToComplete(entry);
        setIsCompleteModalOpen(true);
    };

    const handleCloseModals = () => {
        setIsEntryModalOpen(false);
        setIsCompleteModalOpen(false);
    };

    const handleSaveNewEntry = async (formData) => {
        try {
            let partner = formData.partner;
            let party = formData.party;

            if (partner && partner.__isNew__) {
                const type = formData.entryType === 'Dry Waste' ? 'Source' : formData.entryType === 'Water Tanker' ? 'Water Tanker Vendor' : 'Destination';
                const res = await createPartner(partner.label, type);
                partner = { value: res.data.id, label: res.data.name };
            }
            if (party && party.__isNew__) {
                const res = await createPartner(party.label, 'Party');
                party = { value: res.data.id, label: res.data.name };
            }

            const requestData = {
                vehicle_number: formData.vehicleNumber,
                source_id: entryType === 'Dry Waste' || entryType === 'Water Tanker' ? partner.value : null,
                destination_id: entryType === 'Empty Vehicle' ? partner.value : null,
                party_id: entryType === 'Empty Vehicle' ? party.value : null,
                material: formData.material.label,
                entry_type: entryType,
                gross_weight_tons: parseFloat(formData.grossWeight),
            };
            
            await createInwardEntry(requestData);
            fetchData();
            handleCloseModals();
        } catch (err) {
            alert('Failed to save new entry.');
        }
    };
    
    const handleSaveCompletedEntry = async (entryId, tareWeight, material = null) => {
        try {
            await completeInwardEntry(entryId, parseFloat(tareWeight), material);
            fetchData();
            handleCloseModals();
        } catch (err) {
            alert('Failed to complete entry.');
        }
    };

    const handleDeleteEntry = async (entryId) => {
        if (window.confirm('Are you sure you want to delete this pending entry? This action cannot be undone.')) {
            try {
                await deleteInwardEntry(entryId);
                fetchData(); 
            } catch (err) {
                alert('Failed to delete entry. Please try again.');
                console.error(err);
            }
        }
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button 
                    onClick={() => handleOpenEntryModal('Dry Waste')}
                    className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                >
                    <FaTruckLoading className="text-5xl text-blue-500 mb-4" />
                    <h2 className="text-xl font-bold text-slate-800">New Dry Waste Entry</h2>
                    <p className="text-slate-500 mt-1">Log a new vehicle arriving with waste material.</p>
                </button>
                <button 
                    onClick={() => handleOpenEntryModal('Empty Vehicle')}
                    className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                >
                    <FaTruck className="text-5xl text-green-500 mb-4" />
                    <h2 className="text-xl font-bold text-slate-800">New Empty Vehicle Entry</h2>
                    <p className="text-slate-500 mt-1">Log an empty vehicle arriving for pickup.</p>
                </button>
                 <button 
                    onClick={() => handleOpenEntryModal('Water Tanker')}
                    className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                >
                    <FaTint className="text-5xl text-cyan-500 mb-4" />
                    <h2 className="text-xl font-bold text-slate-800">New Water Tanker Entry</h2>
                    <p className="text-slate-500 mt-1">Log a new water tanker arrival.</p>
                </button>
            </div>

            <PendingEntriesTable 
                entries={entries} 
                loading={loading} 
                error={error} 
                onWeighOut={handleOpenCompleteModal} 
                onDelete={handleDeleteEntry}
            />

            {isEntryModalOpen && (
                <InwardEntryModal
                    isOpen={isEntryModalOpen}
                    onClose={handleCloseModals}
                    entryType={entryType}
                    sources={sources}
                    destinations={destinations}
                    materials={defaultMaterials}
                    parties={parties}
                    waterTankerVendors={waterTankerVendors}
                    onSave={handleSaveNewEntry}
                />
            )}
            
            {isCompleteModalOpen && (
                <CompleteEntryModal
                    isOpen={isCompleteModalOpen}
                    onClose={handleCloseModals}
                    entry={entryToComplete}
                    onSave={handleSaveCompletedEntry}
                    exportableMaterials={exportableMaterials}
                />
            )}
        </div>
    );
};

export default ReceivingPage;