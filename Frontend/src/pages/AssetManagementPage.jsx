import React, { useState, useEffect } from 'react';
import { 
    FaHardHat, FaPlus, FaEdit, FaTrash, FaTimes, FaTag, FaCalendarAlt, 
    FaDollarSign, FaInfoCircle, FaImage, FaCamera, FaFileUpload, FaSearch,
    FaFilter, FaDownload, FaChartLine, FaBuilding, FaFileInvoiceDollar
} from 'react-icons/fa';
import { getAssets, createAsset, updateAsset, deleteAsset, uploadAssetImage } from '../services/apiService';

// --- THIS IS THE NEW, SEPARATE COMPONENT FOR THE IMAGE ---
const AssetThumbnail = ({ asset }) => {
    const imageUrl = (asset.fullImageUrl && asset.fullImageUrl.trim() !== '')
        ? `url(${asset.fullImageUrl})`
        : `url(https://via.placeholder.com/200x150/6B7280/FFFFFF?text=${asset.name.replace(/\s/g, '+')})`;

    const imageStyle = {
        backgroundImage: imageUrl
    };

    return (
        <div
            aria-label={asset.name}
            className="w-20 h-16 rounded-lg shadow-md border-2 border-slate-100 group-hover:scale-105 transition-transform duration-200 bg-cover bg-center"
            style={imageStyle}
        ></div>
    );
};


const AssetManagementPage = () => {
    const [assets, setAssets] = useState([]);
    const [filteredAssets, setFilteredAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [categoryFilter, setCategoryFilter] = useState('All');

    const fetchAssets = async () => {
        try {
            setLoading(true);
            const res = await getAssets();
            
            const assetsWithFullUrl = (res.data || []).map(asset => ({
                ...asset,
                fullImageUrl: asset.image_url
            }));

            setAssets(assetsWithFullUrl);
        } catch (error) {
            console.error("Failed to fetch assets", error);
            alert("Could not load asset data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssets();
    }, []);

    useEffect(() => {
        let filtered = assets;
        if (searchTerm) {
            filtered = filtered.filter(asset => 
                asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (asset.id && asset.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (asset.category && asset.category.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }
        if (statusFilter !== 'All') {
            filtered = filtered.filter(asset => asset.status === statusFilter);
        }
        if (categoryFilter !== 'All') {
            filtered = filtered.filter(asset => asset.category === categoryFilter);
        }
        setFilteredAssets(filtered);
    }, [assets, searchTerm, statusFilter, categoryFilter]);

    const openModal = (asset = null) => {
        setEditingAsset(asset);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingAsset(null);
    };

    const handleSave = async (assetData, imageFile) => {
        try {
            const dataToSend = {
                ...assetData,
                value: parseFloat(assetData.value) || 0,
            };

            if (editingAsset) {
                const updatedAsset = { ...editingAsset, ...dataToSend };
                await updateAsset(editingAsset.id, updatedAsset);
                
                if (imageFile) {
                    const formData = new FormData();
                    formData.append('image', imageFile);
                    const res = await uploadAssetImage(editingAsset.id, formData);
                    const imageUrl = res.data.imageUrl;
                    await updateAsset(editingAsset.id, { ...updatedAsset, image_url: imageUrl });
                }
            } else {
                const newAssetId = `ASSET-${String(Date.now()).slice(-5)}`;
                const newAsset = { 
                    ...dataToSend, 
                    id: newAssetId, 
                    image_url: '' 
                };

                const createdAssetResponse = await createAsset(newAsset);
                const createdAsset = createdAssetResponse.data;

                if (imageFile) {
                    const formData = new FormData();
                    formData.append('image', imageFile);
                    const res = await uploadAssetImage(createdAsset.id, formData);
                    const imageUrl = res.data.imageUrl;
                    await updateAsset(createdAsset.id, { ...createdAsset, image_url: imageUrl });
                }
            }
            fetchAssets();
            closeModal();
        } catch (error) {
            console.error("Failed to save asset:", error.response?.data || error);
            alert('Failed to save asset.');
        }
    };
    
    const handleDelete = async (assetId) => {
        if (window.confirm('Are you sure you want to delete this asset? This action cannot be undone.')) {
            try {
                await deleteAsset(assetId);
                fetchAssets();
            } catch (error) {
                alert('Failed to delete asset.');
            }
        }
    };

    const totalValue = assets.reduce((sum, asset) => sum + (asset.value || 0), 0);
    const activeAssets = assets.filter(asset => asset.status === 'Active').length;
    const maintenanceAssets = assets.filter(asset => asset.status === 'Under Maintenance').length;

    const categories = [...new Set(assets.map(asset => asset.category))];
    const statuses = [...new Set(assets.map(asset => asset.status))];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                                <FaBuilding className="text-2xl text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-slate-800">Asset Management</h1>
                                <p className="text-slate-600 mt-1">Manage and track your company assets</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => openModal()} 
                            className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                        >
                            <FaPlus className="text-lg" />
                            Add New Asset
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatCard 
                        title="Total Assets" 
                        value={assets.length} 
                        icon={<FaHardHat />} 
                        color="from-blue-500 to-blue-600" 
                    />
                    <StatCard 
                        title="Active Assets" 
                        value={activeAssets} 
                        icon={<FaChartLine />} 
                        color="from-green-500 to-emerald-600" 
                    />
                    <StatCard 
                        title="Under Maintenance" 
                        value={maintenanceAssets} 
                        icon={<FaInfoCircle />} 
                        color="from-yellow-500 to-orange-600" 
                    />
                    <StatCard 
                        title="Total Value" 
                        value={`₹${(totalValue / 100000).toFixed(1)}L`} 
                        icon={<FaDollarSign />} 
                        color="from-purple-500 to-indigo-600" 
                    />
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex-1 min-w-64">
                            <div className="relative">
                                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search assets by name, ID, or category..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full h-12 pl-12 pr-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                />
                            </div>
                        </div>
                        
                        <div className="flex gap-3">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="h-12 px-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-40"
                            >
                                <option value="All">All Status</option>
                                {statuses.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                            
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="h-12 px-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-40"
                            >
                                <option value="All">All Categories</option>
                                {categories.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                            
                            <button className="h-12 px-4 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors duration-200 flex items-center gap-2">
                                <FaDownload />
                                Export
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                            <FaFilter className="text-blue-500" />
                            Assets Overview ({filteredAssets.length} items)
                        </h2>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-slate-800 text-white">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Image</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Asset Details</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Financial Info</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-16">
                                            <div className="flex flex-col items-center space-y-4">
                                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                                                <p className="text-slate-600">Loading assets...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredAssets.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-16">
                                            <div className="flex flex-col items-center space-y-4">
                                                <FaHardHat className="text-6xl text-slate-300" />
                                                <p className="text-slate-600 text-lg">No assets found matching your criteria</p>
                                                <button 
                                                    onClick={() => openModal()}
                                                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                                                >
                                                    Add Your First Asset
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAssets.map((asset, index) => (
                                        <tr key={asset.id} className={`hover:bg-slate-50 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                            <td className="px-6 py-4">
                                                <AssetThumbnail asset={asset} />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <div className="font-semibold text-slate-900 text-lg">{asset.name}</div>
                                                    <div className="text-sm text-slate-600 font-mono bg-slate-100 px-2 py-1 rounded inline-block">{asset.id}</div>
                                                    <div className="text-sm text-slate-500 flex items-center gap-1">
                                                        <FaBuilding className="text-xs" />
                                                        {asset.location}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                                    <FaTag className="mr-2 text-xs" />
                                                    {asset.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <div className="font-bold text-lg text-slate-900">₹{asset.value.toLocaleString('en-IN')}</div>
                                                    <div className="text-sm text-slate-500">{asset.purchase_date}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-semibold shadow-sm ${
                                                    asset.status === 'Active' ? 'bg-green-100 text-green-800 border border-green-200' :
                                                    asset.status === 'Under Maintenance' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                                                    'bg-red-100 text-red-800 border border-red-200'
                                                }`}>
                                                    <div className={`w-2 h-2 rounded-full mr-2 ${
                                                        asset.status === 'Active' ? 'bg-green-500' :
                                                        asset.status === 'Under Maintenance' ? 'bg-yellow-500' :
                                                        'bg-red-500'
                                                    }`}></div>
                                                    {asset.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex justify-center space-x-3">
                                                    <button 
                                                        onClick={() => openModal(asset)} 
                                                        className="p-2 text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg transition-all duration-200 border border-blue-200 hover:border-blue-600"
                                                        title="Edit Asset"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(asset.id)} 
                                                        className="p-2 text-red-600 hover:text-white hover:bg-red-600 rounded-lg transition-all duration-200 border border-red-200 hover:border-red-600"
                                                        title="Delete Asset"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <AssetModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    onSave={handleSave}
                    asset={editingAsset}
                />
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">{title}</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
            </div>
            <div className={`p-4 bg-gradient-to-r ${color} rounded-xl shadow-lg`}>
                <div className="text-white text-2xl">{icon}</div>
            </div>
        </div>
    </div>
);

const AssetModal = ({ isOpen, onClose, onSave, asset }) => {
    const [formData, setFormData] = useState({
        name: '', category: '', purchase_date: '', value: '', status: 'Active',
        location: '', invoice_number: '', supplier: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (asset) {
            setFormData({
                name: asset.name || '', 
                category: asset.category || '', 
                purchase_date: asset.purchase_date || '',
                value: asset.value || '', 
                status: asset.status || 'Active',
                location: asset.location || '',
                // Changed from serial_number to invoice_number
                invoice_number: asset.serial_number || '',
                supplier: asset.supplier || ''
            });
            setPreview(asset.fullImageUrl);
        } else {
            setFormData({
                name: '', category: '', purchase_date: '', value: '', status: 'Active',
                location: '', invoice_number: '', supplier: ''
            });
            setPreview(null);
        }
        setImageFile(null);
        setErrors({});
    }, [asset, isOpen]);
	
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 100 * 1024 * 1024) { // 100MB limit
                setErrors({...errors, image: 'Image size cannot exceed 100MB'});
                return;
            }
            setImageFile(file);
            setPreview(URL.createObjectURL(file));
            setErrors({...errors, image: null});
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Asset name is required';
        if (!formData.category.trim()) newErrors.category = 'Category is required';
        if (!formData.value || parseInt(formData.value) <= 0) newErrors.value = 'Valid asset value is required';
        if (!formData.purchase_date) newErrors.purchase_date = 'Purchase date is required';
        if (!formData.location.trim()) newErrors.location = 'Location is required';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            // Convert invoice_number back to serial_number for backend compatibility
            const dataToSend = {
                ...formData,
                serial_number: formData.invoice_number
            };
            delete dataToSend.invoice_number;
            onSave(dataToSend, imageFile);
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200">
                <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-t-2xl">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="absolute top-4 right-4 text-white hover:text-slate-200 p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-200"
                    >
                        <FaTimes size={20} />
                    </button>
                    <h2 className="text-2xl font-bold">{asset ? 'Edit Asset' : 'Add New Asset'}</h2>
                    <p className="text-blue-100 mt-1">Fill in the details below to {asset ? 'update' : 'create'} your asset</p>
                </div>
                
                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Asset Image</label>
                        <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors duration-200">
                            {preview ? (
                                <div className="space-y-4">
                                    <img src={preview} alt="Asset Preview" className="mx-auto h-40 w-auto rounded-lg shadow-md" />
                                    <p className="text-sm text-slate-600">Image selected successfully</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <FaImage className="mx-auto h-16 w-16 text-slate-400" />
                                    <p className="text-slate-600">Upload an image of your asset</p>
                                </div>
                            )}
                            <div className="flex flex-wrap justify-center gap-3 mt-4">
                                <label className="cursor-pointer bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium py-3 px-4 hover:from-blue-600 hover:to-indigo-700 flex items-center gap-2 shadow-lg transition-all duration-200 transform hover:scale-105">
                                    <FaCamera />
                                    <span>Take Photo</span>
                                    <input type="file" className="sr-only" accept="image/*" capture="environment" onChange={handleFileChange} />
                                </label>
                                <label className="cursor-pointer bg-slate-600 text-white rounded-lg font-medium py-3 px-4 hover:bg-slate-700 flex items-center gap-2 shadow-lg transition-all duration-200 transform hover:scale-105">
                                    <FaFileUpload />
                                    <span>From Gallery</span>
                                    <input type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                                </label>
                            </div>
                            {errors.image && <p className="text-red-500 text-sm mt-2">{errors.image}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField 
                            label="Asset Name" 
                            name="name" 
                            value={formData.name} 
                            onChange={(e) => setFormData({...formData, name: e.target.value})} 
                            icon={<FaHardHat />} 
                            placeholder="e.g., Hydraulic Baling Machine" 
                            required 
                            error={errors.name}
                        />
                        
                        <InputField 
                            label="Invoice Number" 
                            name="invoice_number" 
                            value={formData.invoice_number} 
                            onChange={(e) => setFormData({...formData, invoice_number: e.target.value})} 
                            icon={<FaFileInvoiceDollar />} 
                            placeholder="e.g., INV-2024-001" 
                        />
                        
                        <InputField 
                            label="Category" 
                            name="category" 
                            value={formData.category} 
                            onChange={(e) => setFormData({...formData, category: e.target.value})} 
                            icon={<FaTag />} 
                            placeholder="e.g., Machinery" 
                            required 
                            error={errors.category}
                        />
                        
                        <InputField 
                            label="Location" 
                            name="location" 
                            value={formData.location} 
                            onChange={(e) => setFormData({...formData, location: e.target.value})} 
                            icon={<FaBuilding />} 
                            placeholder="e.g., Factory Floor A" 
                            required 
                            error={errors.location}
                        />
                        
                        <InputField 
                            label="Purchase Date" 
                            name="purchase_date" 
                            value={formData.purchase_date} 
                            onChange={(e) => setFormData({...formData, purchase_date: e.target.value})} 
                            icon={<FaCalendarAlt />} 
                            type="date" 
                            required 
                            error={errors.purchase_date}
                        />
                        
                        <InputField 
                            label="Asset Value (₹)" 
                            name="value" 
                            value={formData.value} 
                            onChange={(e) => setFormData({...formData, value: e.target.value})} 
                            icon={<FaDollarSign />} 
                            placeholder="e.g., 500000" 
                            type="number" 
                            required 
                            error={errors.value}
                            // Fix for scrolling issue
                            onWheel={(e) => e.target.blur()}
                        />
                    </div>

                    <InputField 
                        label="Supplier" 
                        name="supplier" 
                        value={formData.supplier} 
                        onChange={(e) => setFormData({...formData, supplier: e.target.value})} 
                        icon={<FaBuilding />} 
                        placeholder="e.g., Industrial Solutions Ltd." 
                    />
                    
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                        <div className="relative">
                            <FaInfoCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <select 
                                name="status" 
                                value={formData.status} 
                                onChange={(e) => setFormData({...formData, status: e.target.value})} 
                                className="w-full h-12 pl-12 pr-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all duration-200"
                            >
                                <option value="Active">Active</option>
                                <option value="Under Maintenance">Under Maintenance</option>
                                <option value="Inactive">Inactive</option>
                                <option value="Disposed">Disposed</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-4 p-6 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="px-8 py-3 bg-slate-300 hover:bg-slate-400 text-slate-700 font-semibold rounded-xl transition-all duration-200 transform hover:scale-105"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
                    >
                        {asset ? 'Update Asset' : 'Create Asset'}
                    </button>
                </div>
            </form>
        </div>
    );
};

const InputField = ({ label, icon, error, onWheel, ...props }) => (
    <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
        <div className="relative">
            {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
            <input 
                {...props}
                onWheel={onWheel || ((e) => {
                    // Fix for scroll issue on number inputs
                    if (props.type === 'number') {
                        e.target.blur();
                    }
                })}
                className={`w-full h-12 pl-12 pr-4 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                    error 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-slate-200 focus:border-transparent'
                }`} 
            />
        </div>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
);

export default AssetManagementPage;