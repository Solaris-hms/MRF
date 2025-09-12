import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { FaBook, FaPlus, FaMinus, FaCalendarAlt, FaArrowUp, FaArrowDown, FaWallet, FaDotCircle } from 'react-icons/fa';
import { getCashbookData, createCashbookTransaction } from '../services/apiService';

const getTodayDate = () => new Date().toISOString().split('T')[0];

const SummaryCard = ({ title, amount, icon, borderColor }) => (
    <div className="bg-white rounded-xl p-6 shadow-lg flex items-center space-x-4 border-l-4" style={{ borderColor }}>
        <div className="p-3 rounded-full" style={{ backgroundColor: `${borderColor}20` }}>
            {React.cloneElement(icon, { style: { color: borderColor } })}
        </div>
        <div>
            <p className="text-slate-500 font-semibold">{title}</p>
            <p className="text-2xl font-bold text-slate-800">
                {amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
            </p>
        </div>
    </div>
);

const CashbookPage = () => {
    const [transactions, setTransactions] = useState([]);
    const [openingBalance, setOpeningBalance] = useState(0);
    const [entryType, setEntryType] = useState('Cash In');
    const [entryDate, setEntryDate] = useState(getTodayDate());
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const dateInputRef = useRef(null);
    
    const fetchDataForDate = useCallback(async (date) => {
        try {
            setLoading(true);
            setError('');
            const response = await getCashbookData(date);
            setOpeningBalance(response.data.openingBalance || 0);
            setTransactions(response.data.transactions || []);
        } catch (err) {
            setError('Failed to fetch cashbook data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDataForDate(entryDate);
    }, [entryDate, fetchDataForDate]);

    const { totalCashIn, totalCashOut, closingBalance } = useMemo(() => {
        const totalCashIn = transactions.reduce((sum, t) => sum + t.cash_in, 0);
        const totalCashOut = transactions.reduce((sum, t) => sum + t.cash_out, 0);
        const closingBalance = openingBalance + totalCashIn - totalCashOut;
        return { totalCashIn, totalCashOut, closingBalance };
    }, [transactions, openingBalance]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!description || !amount || parseFloat(amount) <= 0) {
            alert('Please enter a valid description and amount.');
            return;
        }
        const newTransaction = {
            date: entryDate,
            description,
            type: entryType,
            amount: parseFloat(amount),
        };
        try {
            await createCashbookTransaction(newTransaction);
            fetchDataForDate(entryDate); 
            setDescription('');
            setAmount('');
        } catch (err) {
            alert('Failed to save transaction.');
            console.error(err);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center space-x-3">
                <FaBook className="text-3xl text-blue-500" />
                <h1 className="text-2xl font-bold text-slate-800">Daily Cashbook</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <SummaryCard title="Opening Balance" amount={openingBalance} icon={<FaWallet />} borderColor="#3b82f6" />
                <SummaryCard title="Total Cash In" amount={totalCashIn} icon={<FaArrowUp />} borderColor="#22c55e" />
                <SummaryCard title="Total Cash Out" amount={totalCashOut} icon={<FaArrowDown />} borderColor="#ef4444" />
                <SummaryCard title="Closing Balance" amount={closingBalance} icon={<FaWallet />} borderColor="#8b5cf6" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1">
                    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg space-y-4 sticky top-28">
                        <h2 className="text-xl font-bold text-slate-800 border-b pb-3">New Transaction</h2>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Entry Date</label>
                            <div
                                className="relative h-10 w-full border border-slate-300 rounded-lg flex items-center px-3 bg-white cursor-pointer"
                                onClick={() => dateInputRef.current?.showPicker()}
                            >
                                <span>
                                    {new Date(entryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                                </span>
                                <FaCalendarAlt className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    ref={dateInputRef}
                                    type="date"
                                    value={entryDate}
                                    onChange={(e) => setEntryDate(e.target.value)}
                                    className="opacity-0 absolute top-0 left-0 w-full h-full cursor-pointer"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Transaction Type</label>
                            <div className="flex rounded-lg border border-slate-300 p-1">
                                <button type="button" onClick={() => setEntryType('Cash In')}
                                    className={`w-1/2 flex items-center justify-center gap-2 p-1.5 rounded-md text-sm font-semibold ${entryType === 'Cash In' ? 'bg-green-500 text-white shadow' : 'hover:bg-slate-100'}`}>
                                    <FaPlus /> Cash In
                                </button>
                                <button type="button" onClick={() => setEntryType('Cash Out')}
                                    className={`w-1/2 flex items-center justify-center gap-2 p-1.5 rounded-md text-sm font-semibold ${entryType === 'Cash Out' ? 'bg-red-500 text-white shadow' : 'hover:bg-slate-100'}`}>
                                    <FaMinus /> Cash Out
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)}
                                placeholder="e.g., Sale of Cardboard" required
                                className="w-full p-2 border border-slate-300 rounded-lg h-10" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
                            <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00" required
                                className="w-full p-2 border border-slate-300 rounded-lg h-10" />
                        </div>
                        <button type="submit" className="w-full px-6 py-2.5 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-transform hover:scale-105">
                            Save Transaction
                        </button>
                    </form>
                </div>

                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Transactions for {new Date(entryDate).toLocaleDateString('en-GB')}</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="th w-40">Time & Type</th>
                                    <th className="th">Description</th>
                                    <th className="th text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {loading && (<tr><td colSpan="3" className="text-center py-16 text-slate-500">Loading...</td></tr>)}
                                {error && (<tr><td colSpan="3" className="text-center py-16 text-red-500">{error}</td></tr>)}
                                {!loading && !error && transactions.length > 0 ? transactions.map(t => (
                                    <tr key={t.id}>
                                        <td className="td">
                                            <div className="flex items-center space-x-2">
                                                <FaDotCircle className={`text-xs ${t.cash_in > 0 ? 'text-green-500' : 'text-red-500'}`} />
                                                <span className="font-semibold text-slate-600">{new Date(t.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </td>
                                        <td className="td font-medium text-slate-800">{t.description}</td>
                                        <td className={`td text-right font-bold ${t.cash_in > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {t.cash_in > 0 ? t.cash_in.toLocaleString('en-IN', {minimumFractionDigits: 2}) : t.cash_out.toLocaleString('en-IN', {minimumFractionDigits: 2})}
                                        </td>
                                    </tr>
                                )) : (
                                    !loading && !error && <tr><td colSpan="3" className="text-center py-16 text-slate-500">No transactions logged for this date.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CashbookPage;