import React, { useState } from 'react';
import { FaTimes, FaImage, FaUpload } from 'react-icons/fa';

const UploadImageModal = ({ isOpen, onClose, onUpload }) => {
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [description, setDescription] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!imageFile) {
            alert('Please select an image to upload.');
            return;
        }
        setIsUploading(true);
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('description', description);
        
        // Simulate network delay
        setTimeout(() => {
            onUpload(formData);
            // Reset state after upload
            setIsUploading(false);
            setImageFile(null);
            setPreview(null);
            setDescription('');
        }, 500);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
            <form onSubmit={handleSubmit} className="relative bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg">
                <button type="button" onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                    <FaTimes size={20} />
                </button>
                <h2 className="text-xl font-bold text-slate-800 mb-6">Upload Image</h2>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Image File</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                {preview ? (
                                    <img src={preview} alt="Preview" className="mx-auto h-32 w-auto rounded" />
                                ) : (
                                    <FaImage className="mx-auto h-12 w-12 text-slate-400" />
                                )}
                                <div className="flex text-sm text-slate-600">
                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                                        <span>Select a file</span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-slate-500">PNG, JPG, GIF up to 10MB</p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <textarea id="description" name="description" rows="3"
                            value={description} onChange={(e) => setDescription(e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Add a short description or note..."></textarea>
                    </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                    <button type="button" onClick={onClose} className="px-6 py-2 bg-slate-200 rounded-lg font-semibold">Cancel</button>
                    <button type="submit" disabled={isUploading || !imageFile} className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg disabled:bg-slate-400">
                        <FaUpload /> {isUploading ? 'Uploading...' : 'Upload'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UploadImageModal;