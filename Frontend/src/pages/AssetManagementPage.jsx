import React, { useState, useEffect } from 'react';
import { 
    FaHardHat, FaPlus, FaEdit, FaTrash, FaTimes, FaTag, FaCalendarAlt, 
    FaDollarSign, FaInfoCircle, FaImage, FaCamera, FaFileUpload 
} from 'react-icons/fa';

// Mock data updated with an imageUrl property
const initialAssets = [
    { id: 'ASSET-001', name: 'Baling Machine', category: 'Machinery', purchaseDate: '2022-08-15', value: '500000', status: 'Active', imageUrl: 'https://via.placeholder.com/150x100.png?text=Baling+Machine' },
    { id: 'ASSET-002', name: 'Forklift', category: 'Vehicle', purchaseDate: '2021-11-20', value: '1200000', status: 'Active', imageUrl: 'https://via.placeholder.com/150x100.png?text=Forklift' },
    { id: 'ASSET-003', name: 'Conveyor Belt', category: 'Machinery', purchaseDate: '2022-08-15', value: '350000', status: 'Under Maintenance', imageUrl: 'https://via.placeholder.com/150x100.png?text=Conveyor+Belt' },
];

const AssetManagementPage = () => {
    const [assets, setAssets] = useState(initialAssets);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState(null);

    const openModal = (asset = null) => {
        setEditingAsset(asset);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingAsset(null);
    };

    const handleSave = (assetData, imageFile) => {
        let newImageUrl = editingAsset ? editingAsset.imageUrl : 'https://via.placeholder.com/150x100.png?text=New+Asset';
        if (imageFile) {
            newImageUrl = URL.createObjectURL(imageFile);
        }

        const finalAssetData = { ...assetData, imageUrl: newImageUrl };

        if (editingAsset) {
            setAssets(assets.map(asset => asset.id === editingAsset.id ? { ...finalAssetData, id: editingAsset.id } : asset));
        } else {
            const newAsset = { ...finalAssetData, id: `ASSET-${String(assets.length + 1).padStart(3, '0')}` };
            setAssets([...assets, newAsset]);
        }
        closeModal();
    };
    
    const handleDelete = (assetId) => {
        if (window.confirm('Are you sure you want to delete this asset?')) {
            setAssets(assets.filter(asset => asset.id !== assetId));
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center space-x-3">
                    <FaHardHat className="text-3xl text-blue-500" />
                    <h1 className="text-2xl font-bold text-slate-800">Asset Management</h1>
                </div>
                <button onClick={() => openModal()} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600">
                    <FaPlus />
                    Add New Asset
                </button>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="th">Image</th>
                                <th className="th">Asset ID</th>
                                <th className="th">Name</th>
                                <th className="th">Category</th>
                                <th className="th">Status</th>
                                <th className="th text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-10">Loading assets...</td></tr>
                            ) : (
                                assets.map(asset => (
                                    <tr key={asset.id} className="hover:bg-slate-50">
                                        <td className="td">
                                            <img src={asset.imageUrl} alt={asset.name} className="w-16 h-12 rounded object-cover bg-slate-200" />
                                        </td>
                                        <td className="td font-mono text-slate-500">{asset.id}</td>
                                        <td className="td font-medium text-slate-900">{asset.name}</td>
                                        <td className="td">{asset.category}</td>
                                        <td className="td">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                asset.status === 'Active' ? 'bg-green-100 text-green-800' :
                                                asset.status === 'Under Maintenance' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {asset.status}
                                            </span>
                                        </td>
                                        <td className="td text-center space-x-4">
                                            <button onClick={() => openModal(asset)} className="text-blue-600 hover:text-blue-800" title="Edit">
                                                <FaEdit />
                                            </button>
                                            <button onClick={() => handleDelete(asset.id)} className="text-red-600 hover:text-red-800" title="Delete">
                                                <FaTrash />
                                            </button>
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
    );
};

const AssetModal = ({ isOpen, onClose, onSave, asset }) => {
    const [formData, setFormData] = useState({
        name: '', category: '', purchaseDate: '', value: '', status: 'Active',
    });
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        if (asset) {
            setFormData({
                name: asset.name, category: asset.category, purchaseDate: asset.purchaseDate,
                value: asset.value, status: asset.status,
            });
            setPreview(asset.imageUrl);
        } else {
            setFormData({
                name: '', category: '', purchaseDate: '', value: '', status: 'Active',
            });
            setPreview(null);
        }
        setImageFile(null); 
    }, [asset, isOpen]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData, imageFile);
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
            <form onSubmit={handleSubmit} className="relative bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <button type="button" onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                    <FaTimes size={20} />
                </button>
                <h2 className="text-xl font-bold text-slate-800 mb-6">{asset ? 'Edit Asset' : 'Add New Asset'}</h2>
                
                <div className="space-y-4">
                    {/* --- UPDATED ASSET IMAGE UPLOADER --- */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Asset Image</label>
                        <div className="mt-1 flex flex-col items-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md">
                            {preview ? (
                                <img src={preview} alt="Asset Preview" className="mb-4 h-32 w-auto rounded" />
                            ) : (
                                <FaImage className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                            )}
                            <div className="flex flex-wrap justify-center gap-4">
                                <label htmlFor="camera-upload" className="relative cursor-pointer bg-blue-100 text-blue-700 rounded-md font-medium py-2 px-4 hover:bg-blue-200 flex items-center gap-2">
                                    <FaCamera />
                                    <span>Take Photo</span>
                                    <input id="camera-upload" name="camera-upload" type="file" className="sr-only" accept="image/*" capture="environment" onChange={handleFileChange} />
                                </label>
                                <label htmlFor="gallery-upload" className="relative cursor-pointer bg-slate-100 text-slate-700 rounded-md font-medium py-2 px-4 hover:bg-slate-200 flex items-center gap-2">
                                    <FaFileUpload />
                                    <span>From Gallery</span>
                                    <input id="gallery-upload" name="gallery-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                                </label>
                            </div>
                        </div>
                    </div>

                    <InputField label="Asset Name" name="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} icon={<FaHardHat />} placeholder="e.g., Baling Machine" required />
                    <InputField label="Category" name="category" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} icon={<FaTag />} placeholder="e.g., Machinery" required />
                    <InputField label="Purchase Date" name="purchaseDate" value={formData.purchaseDate} onChange={(e) => setFormData({...formData, purchaseDate: e.target.value})} icon={<FaCalendarAlt />} type="date" required />
                    <InputField label="Asset Value (INR)" name="value" value={formData.value} onChange={(e) => setFormData({...formData, value: e.target.value})} icon={<FaDollarSign />} placeholder="e.g., 500000" type="number" required />
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                        <div className="relative">
                            <FaInfoCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <select name="status" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full h-10 pl-10 pr-3 border border-slate-300 rounded-lg">
                                <option>Active</option>
                                <option>Under Maintenance</option>
                                <option>Inactive</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                    <button type="button" onClick={onClose} className="px-6 py-2 bg-slate-200 rounded-lg">Cancel</button>
                    <button type="submit" className="px-6 py-2 bg-blue-500 text-white rounded-lg">Save</button>
                </div>
            </form>
        </div>
    );
};

const InputField = ({ label, icon, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        <div className="relative">
            {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
            <input {...props} className="w-full h-10 pl-10 pr-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
    </div>
);

export default AssetManagementPage;