import React, { useState, useEffect, useMemo } from 'react';
import { FaShoppingCart, FaRupeeSign, FaWeightHanging, FaTimes, FaFileExcel, FaTruck, FaPercent, FaCalculator } from 'react-icons/fa';
import CreatableSelect from 'react-select/creatable';
import { getCompletedEntries, createSaleEntry, getAllPartners, getMaterialSales, createPartner } from '../services/apiService';
import * as XLSX from 'xlsx';

const SummaryCard = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg flex items-center space-x-4">
        <div className={`p-3 rounded-full bg-${color}-100 text-${color}-600`}>
            {icon}
        </div>
        <div>
            <p className="text-slate-500 font-semibold">{title}</p>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
        </div>
    </div>
);

const SaleEntryModal = ({ isOpen, onClose, entry, party, onSave, transporters }) => {
    const [formData, setFormData] = useState({
        driverName: '',
        driverMobile: '',
        rate: '',
        gst: '18',
        modeOfPayment: 'Bill',
        remark: '',
        transportationExpense: '',
    });
    const [selectedTransporter, setSelectedTransporter] = useState(null);
    const [rateUnit, setRateUnit] = useState('ton');
    
    // New moisture/deduction fields
    const [deductionType, setDeductionType] = useState('none'); // 'none', 'percentage', 'fixed'
    const [deductionValue, setDeductionValue] = useState('');
    const [deductionReason, setDeductionReason] = useState('moisture'); // 'moisture', 'impurity', 'other'
    const [customReason, setCustomReason] = useState('');

    useEffect(() => {
        if (entry) {
            setFormData({
                driverName: '', driverMobile: '', rate: '', gst: '18',
                modeOfPayment: 'Bill', remark: '', transportationExpense: ''
            });
            setSelectedTransporter(null);
            setDeductionType('none');
            setDeductionValue('');
            setDeductionReason('moisture');
            setCustomReason('');
        }
    }, [entry]);

    if (!isOpen || !entry) {
        return null;
    }

    const originalWeight = parseFloat(entry.net_weight_tons) || 0;
    const rate = parseFloat(formData.rate) || 0;
    const ratePerTon = rateUnit === 'kg' ? rate * 1000 : rate;
    const gstPercentage = parseFloat(formData.gst) || 0;
    
    // Calculate deduction
    let deductionAmount = 0;
    if (deductionType === 'percentage') {
        deductionAmount = (originalWeight * (parseFloat(deductionValue) || 0)) / 100;
    } else if (deductionType === 'fixed') {
        deductionAmount = parseFloat(deductionValue) || 0;
    }
    
    const billingWeight = Math.max(0, originalWeight - deductionAmount);
    const amount = billingWeight * ratePerTon;
    const gstAmount = amount * (gstPercentage / 100);
    const totalAmountWithGST = amount + gstAmount;

    const handleSave = () => {
        if (!party || !formData.rate) {
            alert('Please ensure a party is assigned and a rate is entered.');
            return;
        }
        
        const finalReason = deductionReason === 'other' ? customReason : deductionReason;
        
        onSave({
            ...formData,
            ...entry,
            party_id: party.id,
            transporter: selectedTransporter,
            rate: ratePerTon,
            original_weight_tons: originalWeight,
            deduction_type: deductionType,
            deduction_value: parseFloat(deductionValue) || 0,
            deduction_amount: deductionAmount,
            deduction_reason: finalReason,
            billing_weight_tons: billingWeight,
            amount: amount,
            gst_amount: gstAmount,
            total_amount_with_gst: totalAmountWithGST,
            transportation_expense: parseFloat(formData.transportationExpense) || 0,
        });
    };

    const deductionReasonOptions = [
        { value: 'moisture', label: 'Moisture Content' },
        { value: 'impurity', label: 'Impurity/Contamination' },
        { value: 'quality', label: 'Quality Adjustment' },
        { value: 'wastage', label: 'Wastage/Loss' },
        { value: 'agreement', label: 'Mutual Agreement' },
        { value: 'other', label: 'Other (Specify)' }
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-2xl p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
                <button type="button" onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                    <FaTimes size={20} />
                </button>
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Log Material Sale</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <InputField label="S.N" value={entry.id} readOnly />
                    <InputField label="Date" value={new Date().toLocaleDateString('en-GB')} readOnly />
                    <InputField label="Vehicle No" value={entry.vehicle_number} readOnly />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <InputField label="Material Name" value={entry.material} readOnly />
                    <InputField label="Original Weight (Tons)" value={entry.net_weight_tons?.toFixed(3)} readOnly />
                    <InputField label="Party Name" value={party?.name || 'N/A'} readOnly />
                </div>

                {/* Weight Deduction Section */}
                <div className="border-t border-b py-4 my-4 bg-amber-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <FaCalculator className="text-amber-600" />
                        Weight Adjustment for Billing
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Deduction Type</label>
                            <select 
                                value={deductionType} 
                                onChange={(e) => {
                                    setDeductionType(e.target.value);
                                    setDeductionValue('');
                                }}
                                className="w-full p-2 border border-slate-300 rounded-lg h-10 bg-white"
                            >
                                <option value="none">No Deduction</option>
                                <option value="percentage">Percentage (%)</option>
                                <option value="fixed">Fixed Amount (Tons)</option>
                            </select>
                        </div>

                        {deductionType !== 'none' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        {deductionType === 'percentage' ? 'Percentage (%)' : 'Amount (Tons)'}
                                    </label>
                                    <div className="relative">
                                        {deductionType === 'percentage' && (
                                            <FaPercent className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        )}
                                        <input 
                                            type="number" 
                                            step="0.01"
                                            value={deductionValue} 
                                            onChange={(e) => setDeductionValue(e.target.value)}
                                            className="w-full p-2 border border-slate-300 rounded-lg h-10 bg-white"
                                            placeholder={deductionType === 'percentage' ? 'e.g., 40' : 'e.g., 4.5'}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
                                    <select 
                                        value={deductionReason} 
                                        onChange={(e) => setDeductionReason(e.target.value)}
                                        className="w-full p-2 border border-slate-300 rounded-lg h-10 bg-white"
                                    >
                                        {deductionReasonOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {deductionReason === 'other' && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Custom Reason</label>
                                        <input 
                                            type="text" 
                                            value={customReason} 
                                            onChange={(e) => setCustomReason(e.target.value)}
                                            className="w-full p-2 border border-slate-300 rounded-lg h-10 bg-white"
                                            placeholder="Specify reason..."
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {deductionType !== 'none' && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                                <div className="text-center">
                                    <p className="text-slate-600 font-medium">Original Weight</p>
                                    <p className="text-lg font-bold text-slate-800">{originalWeight.toFixed(3)} Tons</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-slate-600 font-medium">Deduction</p>
                                    <p className="text-lg font-bold text-red-600">
                                        -{deductionAmount.toFixed(3)} Tons
                                        {deductionType === 'percentage' && ` (${deductionValue}%)`}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-slate-600 font-medium">Billing Weight</p>
                                    <p className="text-lg font-bold text-green-600">{billingWeight.toFixed(3)} Tons</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-slate-600 font-medium">Reason</p>
                                    <p className="text-sm font-semibold text-slate-700 capitalize">
                                        {deductionReason === 'other' ? customReason : deductionReason.replace('_', ' ')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Original form fields */}
                <div className="border-t pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Transporter Name</label>
                            <CreatableSelect
                                isClearable
                                options={transporters}
                                value={selectedTransporter}
                                onChange={setSelectedTransporter}
                                placeholder="Select or create..."
                            />
                        </div>
                        <InputField label="Driver Name" value={formData.driverName} onChange={(e) => setFormData({ ...formData, driverName: e.target.value })} />
                        <InputField label="Driver Mobile No" value={formData.driverMobile} onChange={(e) => setFormData({ ...formData, driverMobile: e.target.value })} />
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Rate (INR)</label>
                            <div className="flex">
                                <input type="number" value={formData.rate} onChange={(e) => setFormData({ ...formData, rate: e.target.value })} className="w-full p-2 border border-slate-300 rounded-l-lg h-10 bg-slate-50" />
                                <select value={rateUnit} onChange={(e) => setRateUnit(e.target.value)} className="p-2 border-t border-b border-r border-slate-300 rounded-r-lg h-10 bg-slate-100">
                                    <option value="ton">per Ton</option>
                                    <option value="kg">per Kilo</option>
                                </select>
                            </div>
                        </div>
                        <InputField label="GST (%)" type="number" value={formData.gst} onChange={(e) => setFormData({ ...formData, gst: e.target.value })} />
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Mode of Payment</label>
                            <select 
                                value={formData.modeOfPayment} 
                                onChange={(e) => setFormData({ ...formData, modeOfPayment: e.target.value })}
                                className="w-full p-2 border border-slate-300 rounded-lg h-10 bg-slate-50"
                            >
                                <option value="Bill">Bill</option>
                                <option value="Cash">Cash</option>
                            </select>
                        </div>

                        <InputField label="Transportation Expense" type="number" value={formData.transportationExpense} icon={<FaTruck/>} onChange={(e) => setFormData({ ...formData, transportationExpense: e.target.value })} />
                    </div>
                     <div className="mt-4">
                        <InputField label="Remark" value={formData.remark} onChange={(e) => setFormData({ ...formData, remark: e.target.value })} />
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t bg-slate-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center items-center">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Billing Weight</p>
                            <p className="text-lg font-bold text-green-600">{billingWeight.toFixed(3)} Tons</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Base Amount</p>
                            <p className="text-lg font-bold text-slate-800">{amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">GST Amount</p>
                            <p className="text-lg font-bold text-slate-800">{gstAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total Amount (with GST)</p>
                            <p className="text-2xl font-bold text-blue-600">{totalAmountWithGST.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</p>
                        </div>
                    </div>
                </div>
                 <div className="flex justify-end mt-6">
                    <button onClick={handleSave} className="px-8 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600">
                        Confirm & Save Sale
                    </button>
                </div>
            </div>
        </div>
    );
};

const InputField = ({ label, icon, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        <div className="relative">
            {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
            <input {...props} className={`w-full p-2 border border-slate-300 rounded-lg h-10 bg-slate-50 read-only:bg-slate-200 ${icon ? 'pl-10' : ''}`} />
        </div>
    </div>
);


const MaterialSalesPage = () => {
    const [completedEntries, setCompletedEntries] = useState([]);
    const [salesLog, setSalesLog] = useState([]);
    const [allPartners, setAllPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [selectedParty, setSelectedParty] = useState(null);

    const transporters = useMemo(() => 
        allPartners
            .filter(p => p.type === 'Transporter')
            .map(t => ({ value: t.id, label: t.name })), 
        [allPartners]
    );

    const fetchData = async () => {
        try {
            setLoading(true);
            const [entriesRes, partnersRes, salesRes] = await Promise.all([
                getCompletedEntries(),
                getAllPartners(),
                getMaterialSales()
            ]);

            const soldEntryIds = new Set((salesRes.data || []).map(s => s.inward_entry_id));
            setCompletedEntries((entriesRes.data || []).filter(e => e.entry_type === 'Item Export' && !soldEntryIds.has(e.id)));
            
            setAllPartners(partnersRes.data || []);
            setSalesLog(salesRes.data || []);
        } catch (err) {
            setError('Failed to fetch page data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenSaleModal = (entry) => {
        const party = allPartners.find(p => p.id === entry.party_id);
        setSelectedEntry(entry);
        setSelectedParty(party);
        setIsModalOpen(true);
    };

    const handleSaveSale = async (saleData) => {
        try {
            let transporter = saleData.transporter;
            if (transporter && transporter.__isNew__) {
                const res = await createPartner(transporter.label, 'Transporter');
                transporter = { value: res.data.id, label: res.data.name };
            }

            const finalSaleData = {
                ...saleData,
                id: saleData.id,
                date: new Date().toISOString().split('T')[0],
                party_id: saleData.party_id,
                transporter_id: transporter ? transporter.value : null,
            };

            await createSaleEntry(finalSaleData);
            fetchData();
            setIsModalOpen(false);
        } catch (err) {
            alert("Failed to save the sale. Please try again.");
        }
    };

    const handleExport = () => {
        const formattedData = salesLog.map((sale, index) => ({
            "S.N": index + 1,
            "Date": new Date(sale.sale_date).toLocaleDateString(),
            "Vehicle No": sale.vehicle_number,
            "Material Name": sale.material_name,
            "Original Weight (Tons)": sale.original_weight_tons || sale.net_weight_tons,
            "Deduction Type": sale.deduction_type || 'none',
            "Deduction Amount (Tons)": sale.deduction_amount || 0,
            "Deduction Reason": sale.deduction_reason || 'N/A',
            "Billing Weight (Tons)": sale.billing_weight_tons || sale.net_weight_tons,
            "Party Name": sale.party_name,
            "Transporter Name": sale.transporter_name,
            "Driver Name": sale.driver_name,
            "Rate per Ton": sale.rate,
            "Amount": sale.amount,
            "GST (%)": sale.gst_percentage,
            "GST Amount": sale.gst_amount,
            "Total Amount": sale.total_amount,
            "Transportation Expense": sale.transportation_expense,
            "Mode of Payment": sale.mode_of_payment,
            "Remark": sale.remark,
        }));

        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Material Sales");

        worksheet["!cols"] = [
            { wch: 5 }, { wch: 12 }, { wch: 15 }, { wch: 20 }, { wch: 18 }, { wch: 15 }, 
            { wch: 18 }, { wch: 20 }, { wch: 18 }, { wch: 25 }, { wch: 25 }, { wch: 20 }, 
            { wch: 15 }, { wch: 15 }, { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 22 }, 
            { wch: 18 }, { wch: 30 },
        ];
        
        XLSX.writeFile(workbook, "MaterialSalesLog_Detailed.xlsx");
    };

    const dailySummary = useMemo(() => {
        const totalSales = salesLog.reduce((sum, s) => sum + s.total_amount, 0);
        const totalQuantity = salesLog.reduce((sum, s) => sum + (s.billing_weight_tons || s.net_weight_tons), 0);
        return { totalSales, totalQuantity, transactionCount: salesLog.length };
    }, [salesLog]);

    if (loading) return <div className="text-center p-8">Loading available materials...</div>;
    if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

    return (
        <div className="space-y-8">
            <div className="flex items-center space-x-3">
                <FaShoppingCart className="text-3xl text-blue-500" />
                <h1 className="text-2xl font-bold text-slate-800">Material Sales</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SummaryCard title="Total Sales Value" value={dailySummary.totalSales.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })} icon={<FaRupeeSign />} color="green" />
                <SummaryCard title="Total Quantity Sold" value={`${dailySummary.totalQuantity.toFixed(3)} Tons`} icon={<FaWeightHanging />} color="blue" />
                <SummaryCard title="Total Sales Logged" value={dailySummary.transactionCount} icon={<FaShoppingCart />} color="purple" />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Completed Lots Available for Sale</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="th">Completed Date</th>
                                <th className="th">Material</th>
                                <th className="th">Vehicle No</th>
                                <th className="th text-right">Net Weight (Tons)</th>
                                <th className="th text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {completedEntries.length > 0 ? completedEntries.map(entry => (
                                <tr key={entry.id} className="hover:bg-slate-50">
                                    <td className="td">{new Date(entry.completed_at).toLocaleDateString()}</td>
                                    <td className="td font-medium">{entry.material}</td>
                                    <td className="td">{entry.vehicle_number}</td>
                                    <td className="td text-right font-bold">{entry.net_weight_tons?.toFixed(3)}</td>
                                    <td className="td text-center">
                                        <button onClick={() => handleOpenSaleModal(entry)} className="px-4 py-1.5 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600">
                                            Log Sale
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="5" className="text-center py-10 text-slate-500">No completed material lots are available for sale.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800">Past Sales Log</h2>
                    <button 
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-slate-400"
                        disabled={salesLog.length === 0}
                    >
                        <FaFileExcel />
                        Export to Excel
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="th">Sale Time</th>
                                <th className="th">Material</th>
                                <th className="th">Party</th>
                                <th className="th text-right">Original (Tons)</th>
                                <th className="th text-right">Billing (Tons)</th>
                                <th className="th text-right">Rate</th>
                                <th className="th text-right">Total Amount</th>
                                <th className="th text-center">Deduction</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {salesLog.length > 0 ? salesLog.map(sale => (
                                <tr key={sale.id} className="hover:bg-slate-50">
                                    <td className="td text-slate-500">{new Date(sale.created_at).toLocaleString()}</td>
                                    <td className="td font-medium">{sale.material_name}</td>
                                    <td className="td">{sale.party_name}</td>
                                    <td className="td text-right font-semibold text-slate-600">
                                        {(sale.original_weight_tons || sale.net_weight_tons)?.toFixed(3)}
                                    </td>
                                    <td className="td text-right font-semibold text-green-600">
                                        {(sale.billing_weight_tons || sale.net_weight_tons)?.toFixed(3)}
                                    </td>
                                    <td className="td text-right">{sale.rate.toLocaleString('en-IN')}</td>
                                    <td className="td text-right font-bold text-blue-600">{sale.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                    <td className="td text-center">
                                        {sale.deduction_amount && sale.deduction_amount > 0 ? (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800" title={`${sale.deduction_reason}: -${sale.deduction_amount?.toFixed(3)} tons`}>
                                                -{sale.deduction_amount?.toFixed(3)}T
                                            </span>
                                        ) : (
                                            <span className="text-slate-400">None</span>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="8" className="text-center py-10 text-slate-500">No sales have been logged yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <SaleEntryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                entry={selectedEntry}
                party={selectedParty}
                onSave={handleSaveSale}
                transporters={transporters}
            />
        </div>
    );
};

export default MaterialSalesPage;