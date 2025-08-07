import React, { useState, useMemo, useEffect } from 'react';
import { FaCheckCircle, FaFileExcel } from 'react-icons/fa';
// --- THIS IS THE FIX ---
// The import path has been corrected to point to the right directory.
import { getCompletedEntries } from '../services/apiService';

const CompletedEntriesPage = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getCompletedEntries();
        setEntries(response.data || []);
      } catch (err) {
        setError('Failed to fetch completed entries. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  
  const handleDateChange = (e) => {
      setDateRange({...dateRange, [e.target.name]: e.target.value });
  }

  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      const matchesSearch = searchTerm === '' ||
        entry.vehicle_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (entry.source_name && entry.source_name.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const entryDate = new Date(entry.completed_at);
      const startDate = dateRange.start ? new Date(dateRange.start) : null;
      const endDate = dateRange.end ? new Date(dateRange.end) : null;

      let matchesDate = true;
      if(startDate) startDate.setHours(0,0,0,0);
      if(endDate) endDate.setHours(23,59,59,999);
      
      if(startDate && endDate) {
        matchesDate = entryDate >= startDate && entryDate <= endDate;
      } else if (startDate) {
        matchesDate = entryDate >= startDate;
      } else if (endDate) {
        matchesDate = entryDate <= endDate;
      }

      return matchesSearch && matchesDate;
    });
  }, [entries, searchTerm, dateRange]);

  if (loading) return <div className="text-center p-8">Loading Completed Entries...</div>;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
            <FaCheckCircle className="text-3xl text-green-500" />
            <h1 className="text-2xl font-bold text-slate-800">Completed Inward Entries</h1>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-green-700 text-white font-semibold rounded-lg hover:bg-green-800 transition shadow-md">
            <FaFileExcel/>
            <span>Export to Excel</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-lg flex flex-wrap items-end gap-4">
        <div className="flex-grow">
            <label htmlFor="search" className="text-sm font-medium text-slate-600">Search Vehicle or Source</label>
            <input id="search" type="text" placeholder="e.g., TS 08 or Municipal Zone A" 
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full mt-1 p-2 border rounded-lg h-10" 
            />
        </div>
         <div className="flex-grow">
            <label htmlFor="start" className="text-sm font-medium text-slate-600">Start Date</label>
            <input id="start" name="start" type="date" onChange={handleDateChange} className="w-full mt-1 p-2 border rounded-lg h-10" />
        </div>
        <div className="flex-grow">
            <label htmlFor="end" className="text-sm font-medium text-slate-600">End Date</label>
            <input id="end" name="end" type="date" onChange={handleDateChange} className="w-full mt-1 p-2 border rounded-lg h-10" />
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-lg">
         <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
                <tr>
                    <th className="th">Date / Time</th>
                    <th className="th">Vehicle #</th>
                    <th className="th">Source / Destination</th>
                    <th className="th text-right">Gross Wt. (Tons)</th>
                    <th className="th text-right">Tare Wt. (Tons)</th>
                    <th className="th text-right !text-blue-600">Net Wt. (Tons)</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredEntries.length > 0 ? filteredEntries.map(entry => (
                <tr key={entry.id} className="hover:bg-slate-50">
                  <td className="td">{new Date(entry.completed_at).toLocaleDateString()} <span className="text-slate-500">{new Date(entry.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></td>
                  <td className="td font-medium text-slate-900">{entry.vehicle_number}</td>
                  <td className="td">{entry.source_name}</td>
                  <td className="td text-right">{(entry.gross_weight_tons ?? 0).toFixed(3)}</td>
                  <td className="td text-right">{(entry.tare_weight_tons ?? 0).toFixed(3)}</td>
                  <td className="td text-right font-bold text-lg text-blue-600">{(entry.net_weight_tons ?? 0).toFixed(3)}</td>
                </tr>
              )) : (
                <tr><td colSpan="6" className="text-center py-10 text-slate-500">No completed entries match your criteria.</td></tr>
              )}
            </tbody>
          </table>
         </div>
      </div>
    </div>
  );
};

export default CompletedEntriesPage;