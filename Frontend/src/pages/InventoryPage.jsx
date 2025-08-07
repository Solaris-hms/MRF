import React, { useState, useMemo, useEffect } from 'react';
import {
    FaBoxes, FaSearch, FaLeaf, FaTshirt, FaGlassMartini, FaBook,
    FaQuestionCircle, FaShoppingBag, FaBoxOpen, FaWineBottle, FaRecycle
} from 'react-icons/fa';
import { getInventory } from '../services/apiService';

const InventoryPage = () => {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // --- THIS IS THE FIX ---
    // The icon map is updated to match the new SORTABLE_MATERIALS list.
    const materialIcons = {
        'Alluminium Cane': <FaRecycle />,
        'Bhangar': <FaQuestionCircle />,
        'Black Plastic': <FaShoppingBag />,
        'Carton': <FaBoxOpen />,
        'Duplex': <FaBook />,
        'Glass': <FaGlassMartini />,
        'Grey Board': <FaBook />,
        'HD Cloth': <FaTshirt />,
        'HM Polythene': <FaShoppingBag />,
        'LD Polythene': <FaShoppingBag />,
        'Milk Pouch': <FaShoppingBag />,
        'Mix Plastic': <FaShoppingBag />,
        'Pet Bottle': <FaWineBottle />, // Corrected typo from "Pet" to "Pet Bottle"
        'Record': <FaBook />,
        'Sole': <FaLeaf />,
    };

    useEffect(() => {
        const fetchInventory = async () => {
            try {
                setLoading(true);
                const response = await getInventory();
                const sortedData = (response.data || []).sort((a, b) => b.current_stock_tons - a.current_stock_tons);
                setInventory(sortedData);
            } catch (err) {
                setError('Failed to fetch inventory data.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchInventory();
    }, []);

    const filteredInventory = inventory.filter(item =>
        item.material_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const grandTotalInTons = inventory.reduce((total, item) => total + item.current_stock_tons, 0);

    const getStockLevel = (quantityInTons) => {
        if (quantityInTons > 10) return { label: 'High', color: 'bg-green-100 text-green-800' };
        if (quantityInTons > 2) return { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' };
        return { label: 'Low', color: 'bg-red-100 text-red-800' };
    };

    if (loading) return <div className="text-center p-8">Loading Inventory...</div>;
    if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <FaBoxes className="text-3xl text-blue-500" />
                    <h1 className="text-2xl font-bold text-slate-800">Inventory Status</h1>
                </div>
                <div className="text-right">
                    <p className="text-slate-500 font-semibold">Grand Total Stock</p>
                    <p className="text-2xl font-bold text-blue-600">
                        {grandTotalInTons.toLocaleString('en-IN', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} Tons
                    </p>
                </div>
            </div>

            <div className="relative">
                <FaSearch className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search for a material..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 pl-12 border border-slate-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="th">Material Name</th>
                                <th className="th text-center">Stock Level</th>
                                <th className="th text-right">Current Stock</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredInventory.length > 0 ? filteredInventory.map(item => (
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="td font-medium text-slate-900">
                                        <div className="flex items-center gap-3">
                                            <span className="text-blue-500 text-lg">
                                                {materialIcons[item.material_name] || <FaBoxes />}
                                            </span>
                                            {item.material_name}
                                        </div>
                                    </td>
                                    <td className="td text-center">
                                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStockLevel(item.current_stock_tons).color}`}>
                                            {getStockLevel(item.current_stock_tons).label}
                                        </span>
                                    </td>
                                    <td className="td text-right font-bold text-lg text-slate-700">
                                        {item.current_stock_tons.toLocaleString('en-IN', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
                                        <span className="text-sm font-medium text-slate-500 ml-1">Tons</span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="3" className="text-center py-10 text-slate-500">
                                        No materials found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default InventoryPage;