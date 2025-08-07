// src/pages/Dashboard.jsx

import React from 'react';
import { FaTruck, FaBoxOpen, FaRecycle, FaExclamationTriangle } from 'react-icons/fa';

const StatCard = ({ title, value, detail, icon, iconBgColor }) => (
  <div className="bg-white rounded-xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
    <div className="flex items-center space-x-4">
      <div className={`p-4 rounded-full ${iconBgColor}`}>
        {icon}
      </div>
      <div>
        <p className="text-slate-500 font-semibold">{title}</p>
        <p className="text-4xl font-bold text-slate-800 my-1">{value}</p>
        <p className="text-sm text-slate-500">{detail}</p>
      </div>
    </div>
    <a href="#" className="text-sm font-semibold text-blue-600 mt-4 inline-block hover:underline">View details</a>
  </div>
);

const Dashboard = () => {
  return (
    <>
      {/* Stat Cards Grid - This is now the main content of the page */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-8">
        <StatCard 
          title="Material Received" 
          value="15.2 Tons" 
          detail="Today"
          icon={<FaTruck className="text-blue-500 text-2xl" />}
          iconBgColor="bg-blue-100"
        />
        <StatCard 
          title="Bales Produced" 
          value="320" 
          detail="Plastics, Cardboard"
          icon={<FaBoxOpen className="text-green-500 text-2xl" />}
          iconBgColor="bg-green-100"
        />
        <StatCard 
          title="Recovery Rate" 
          value="91.5%" 
          detail="Facility Average"
          icon={<FaRecycle className="text-cyan-500 text-2xl" />}
          iconBgColor="bg-cyan-100"
        />
        <StatCard 
          title="Contamination" 
          value="8.5%" 
          detail="Inbound Loads"
          icon={<FaExclamationTriangle className="text-red-500 text-2xl" />}
          iconBgColor="bg-red-100"
        />
      </div>

      {/* Graph Placeholder */}
      <div className="mt-12 bg-white rounded-xl p-6 md:p-8 shadow-lg">
        <h2 className="text-xl font-bold text-slate-700 mb-4">Inbound vs. Outbound Tonnage (Last 30 Days)</h2>
        <div className="h-64 mt-4 bg-slate-100 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300">
          <span className="text-slate-400 font-medium">Chart Area</span>
        </div>
      </div>
    </>
  );
};

export default Dashboard;