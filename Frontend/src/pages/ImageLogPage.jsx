import React, { useState, useEffect } from 'react';
import { FaImages, FaPlus } from 'react-icons/fa';
import UploadImageModal from '../components/imagelog/UploadImageModal';

// --- Mock Data for UI Demonstration ---
const mockImageLogs = [
    {
        id: 1,
        file_path: 'https://via.placeholder.com/300x200.png?text=Bale+of+Cardboard',
        description: 'Bale of cardboard ready for dispatch.',
        uploaded_by_user: 'Admin User',
        created_at: '2025-08-18T10:30:00Z'
    },
    {
        id: 2,
        file_path: 'https://via.placeholder.com/300x200.png?text=Incoming+Truck',
        description: 'New truck arriving from Zone A.',
        uploaded_by_user: 'Supervisor',
        created_at: '2025-08-18T09:15:00Z'
    },
    {
        id: 3,
        file_path: 'https://via.placeholder.com/300x200.png?text=Shredder+Machine',
        description: 'Maintenance check on the shredder.',
        uploaded_by_user: 'Admin User',
        created_at: '2025-08-17T15:45:00Z'
    },
];


const ImageLogPage = () => {
    const [imageLogs, setImageLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        // Simulate fetching data
        setTimeout(() => {
            setImageLogs(mockImageLogs);
            setLoading(false);
        }, 1000);
    }, []);

    const handleUpload = (formData) => {
        // Simulate an upload
        const newLog = {
            id: imageLogs.length + 1,
            file_path: URL.createObjectURL(formData.get('image')),
            description: formData.get('description'),
            uploaded_by_user: 'Current User', // Placeholder
            created_at: new Date().toISOString(),
        };
        setImageLogs([newLog, ...imageLogs]);
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center space-x-3">
                    <FaImages className="text-3xl text-blue-500" />
                    <h1 className="text-2xl font-bold text-slate-800">Image Log</h1>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600">
                    <FaPlus />
                    Upload New Image
                </button>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
                {loading ? (
                    <div className="text-center py-10">Loading Image Logs...</div>
                ) : imageLogs.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {imageLogs.map(log => (
                            <div key={log.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                <img src={log.file_path} alt={log.description} className="w-full h-48 object-cover bg-slate-200" />
                                <div className="p-4">
                                    <p className="text-sm text-slate-700 font-medium truncate" title={log.description}>{log.description || 'No description'}</p>
                                    <p className="text-xs text-slate-500 mt-2">Uploaded by: {log.uploaded_by_user}</p>
                                    <p className="text-xs text-slate-500">{new Date(log.created_at).toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 text-slate-500">
                        <FaImages className="mx-auto text-4xl mb-2" />
                        No images have been logged yet.
                    </div>
                )}
            </div>

            <UploadImageModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onUpload={handleUpload}
            />
        </div>
    );
};

export default ImageLogPage;