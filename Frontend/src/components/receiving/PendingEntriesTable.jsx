import React from 'react';
import { FaClock, FaTrash } from 'react-icons/fa'; // Import FaTrash

const PendingEntriesTable = ({ entries, loading, error, onWeighOut, onDelete }) => { // Add onDelete prop
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="flex items-center space-x-3 mb-4">
        <FaClock className="text-2xl text-orange-500" />
        <h2 className="text-xl font-bold text-slate-800">Vehicles In-Facility (Pending Weigh-Out)</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="th">Vehicle #</th>
              <th className="th">Source / Destination</th>
              <th className="th">Material</th>
              <th className="th">Time In</th>
              <th className="th text-right">Loaded Wt. (Tons)</th>
              <th className="th text-right">Empty Wt. (Tons)</th>
              <th className="th text-center">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {loading && (
              <tr><td colSpan="7" className="text-center py-8 text-slate-500">Loading pending entries...</td></tr>
            )}
            {error && (
              <tr><td colSpan="7" className="text-center py-8 text-red-500">{error}</td></tr>
            )}
            {!loading && !error && entries.length > 0 ? entries.map(entry => (
              <tr key={entry.id} className="hover:bg-slate-50">
                <td className="td font-medium text-slate-900">{entry.vehicle_number}</td>
                <td className="td">{entry.source_name}</td>
                <td className="td">{entry.material}</td>
                <td className="td">{new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                <td className="td text-right font-bold">
                  {entry.entry_type === 'Dry Waste' ? entry.gross_weight_tons.toFixed(3) : '-'}
                </td>
                <td className="td text-right font-bold">
                  {entry.entry_type === 'Empty Vehicle' ? entry.gross_weight_tons.toFixed(3) : '-'}
                </td>
                <td className="td text-center">
                  <div className="flex justify-center space-x-2">
                    <button onClick={() => onWeighOut(entry)} className="bg-green-500 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-green-600 transition">
                      Weigh Out
                    </button>
                    <button onClick={() => onDelete(entry.id)} className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-red-600 transition" title="Delete Entry">
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              !loading && !error && (
                <tr><td colSpan="7" className="text-center py-8 text-slate-500">No vehicles are currently pending weigh-out.</td></tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PendingEntriesTable;