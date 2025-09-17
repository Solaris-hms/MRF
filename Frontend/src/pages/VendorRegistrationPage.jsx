import React, { useState, useRef, useEffect } from 'react';
import { 
    FaBuilding, FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, 
    FaIndustry, FaFileContract, FaSave, FaSpinner, FaCheckCircle,
    FaIdCard, FaCalendarAlt, FaPlus, FaTimes, FaWarehouse, FaUpload,
    FaEdit, FaTrash, FaDownload, FaEye, FaFileAlt, FaTable
} from 'react-icons/fa';
import Select from 'react-select';
import { createVendor, getVendors, updateVendor, deleteVendor, uploadVendorDocuments, downloadVendorDocument } from '../services/apiService';

const VendorRegistrationPage = () => {
    const [currentView, setCurrentView] = useState('table'); // 'form' or 'table'
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [vendors, setVendors] = useState([]); // Store all registered vendors
    const [editingVendor, setEditingVendor] = useState(null);
    
    const initialFormData = {
        vendor_name: '',
        vendor_code: '',
        year_of_establishment: '',
        factories: [{
            address1: '', address2: '', address3: '', mob_no: '', fax_no: '', email_id: ''
        }],
        type_of_ownership: [],
        type_of_business: [],
        is_ssi_msme: '',
        registration_no: '',
        cpcb_lic_no: '',
        sales_tax_no: '',
        gst_no: '',
        pan_no: '',
        prepared_by: '',
        authorized_by: '',
        approved_by: '',
    };
    
    const [formData, setFormData] = useState(initialFormData);
    const [attachments, setAttachments] = useState([]);
    const fileInputRef = useRef(null);

    const fetchVendors = async () => {
        try {
            const response = await getVendors();
            setVendors(response.data || []);
        } catch (error) {
            console.error("Failed to fetch vendors", error);
        }
    };

    useEffect(() => {
        fetchVendors();
    }, []);

    const ownershipOptions = [
        'Public Sector', 'Private Sector', 'Joint Sector', 'Proprietorship', 'Partnership'
    ].map(o => ({ value: o, label: o }));

    const businessTypeOptions = [
        'Manufacturing', 'Trading', 'Contractors', 'Transporters', 'Service Company'
    ].map(b => ({ value: b, label: b }));

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleMultiSelectChange = (field, selectedOptions) => {
        setFormData(prev => ({...prev, [field]: selectedOptions || []}))
    }

    const handleFactoryChange = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            factories: prev.factories.map((factory, i) => 
                i === index ? { ...factory, [field]: value } : factory
            )
        }));
    };

    const addFactory = () => {
        setFormData(prev => ({
            ...prev,
            factories: [...prev.factories, {
                address1: '', address2: '', address3: '', mob_no: '', fax_no: '', email_id: ''
            }]
        }));
    };

    const removeFactory = (index) => {
        if (formData.factories.length > 1) {
            setFormData(prev => ({
                ...prev,
                factories: prev.factories.filter((_, i) => i !== index)
            }));
        }
    };

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        const newAttachments = files.map(file => ({
            id: Date.now() + Math.random(),
            name: file.name,
            size: file.size,
            type: file.type,
            file: file
        }));
        setAttachments(prev => [...prev, ...newAttachments]);
        e.target.value = '';
    };

    const removeDocument = (docId) => {
        setAttachments(prev => prev.filter(doc => doc.id !== docId));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const dataToSend = {
            ...formData,
            type_of_ownership: formData.type_of_ownership.map(o => o.value),
            type_of_business: formData.type_of_business.map(b => b.value)
        }
        
        try {
            if (editingVendor) {
                await updateVendor(editingVendor.id, dataToSend);
                if (attachments.length > 0) {
                    const filesToUpload = attachments.filter(a => a.file).map(a => a.file);
                    if(filesToUpload.length > 0) {
                        await uploadVendorDocuments(editingVendor.id, filesToUpload);
                    }
                }
            } else {
                const response = await createVendor(dataToSend);
                const newVendor = response.data;
                if (attachments.length > 0) {
                     const filesToUpload = attachments.filter(a => a.file).map(a => a.file);
                    if (filesToUpload.length > 0) {
                        await uploadVendorDocuments(newVendor.id, filesToUpload);
                    }
                }
            }
            
            setFormData(initialFormData);
            setAttachments([]);
            setEditingVendor(null);
            fetchVendors();
            setCurrentView('table');
        } catch (error) {
            console.error("Failed to save vendor", error);
            alert("Failed to save vendor. Check the console for more details.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const editVendor = (vendor) => {
        setFormData({
            vendor_name: vendor.vendor_name,
            vendor_code: vendor.vendor_code || '',
            year_of_establishment: vendor.year_of_establishment || '',
            factories: vendor.factories.length > 0 ? vendor.factories : initialFormData.factories,
            type_of_ownership: (vendor.type_of_ownership || []).map(o => ({value: o, label: o})),
            type_of_business: (vendor.type_of_business || []).map(b => ({value: b, label: b})),
            is_ssi_msme: vendor.is_ssi_msme || '',
            registration_no: vendor.registration_no || '',
            cpcb_lic_no: vendor.cpcb_lic_no || '',
            sales_tax_no: vendor.sales_tax_no || '',
            gst_no: vendor.gst_no || '',
            pan_no: vendor.pan_no || '',
            prepared_by: vendor.prepared_by || '',
            authorized_by: vendor.authorized_by || '',
            approved_by: vendor.approved_by || '',
        });
        setAttachments(vendor.documents || []);
        setEditingVendor(vendor);
        setCurrentView('form');
    };

    const deleteVendorHandler = async (vendorId) => {
        if (window.confirm('Are you sure you want to delete this vendor?')) {
            try {
                await deleteVendor(vendorId);
                fetchVendors();
            } catch (error) {
                console.error("Failed to delete vendor", error);
                alert("Failed to delete vendor.");
            }
        }
    };
    
    const handleDownload = async (doc) => {
        try {
            const response = await downloadVendorDocument(doc.id);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', doc.original_name);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Failed to download document", error);
            alert("Failed to download document.");
        }
    };

    const downloadVendorForm = (vendor) => {
        const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Vendor Registration Form - ${vendor.vendor_name}</title>
                <style>
                    @page {
                        margin: 0.5in;
                        size: A4;
                    }
                    
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        font-family: Arial, sans-serif;
                        font-size: 9pt;
                        line-height: 1.3;
                        color: #000;
                        background: white;
                    }
                    
                    .document {
                        width: 100%;
                        max-width: 8in;
                        margin: 0 auto;
                    }
                    
                    .header {
                        text-align: center;
                        border-bottom: 2px solid #000;
                        padding-bottom: 10px;
                        margin-bottom: 15px;
                    }
                    
                    .header h1 {
                        font-size: 14pt;
                        font-weight: bold;
                        margin-bottom: 4px;
                    }
                    
                    .header h2 {
                        font-size: 10pt;
                        margin-bottom: 8px;
                        text-transform: uppercase;
                    }
                    
                    .doc-info {
                        font-size: 8pt;
                        display: flex;
                        justify-content: space-between;
                        margin-top: 6px;
                    }
                    
                    .section {
                        margin-bottom: 10px;
                        page-break-inside: avoid;
                    }
                    
                    .section-title {
                        background: #f8f8f8;
                        border: 1px solid #000;
                        padding: 4px 8px;
                        font-weight: bold;
                        font-size: 9pt;
                        text-transform: uppercase;
                        margin-bottom: 6px;
                    }
                    
                    .field-row {
                        display: flex;
                        margin-bottom: 4px;
                        gap: 15px;
                    }
                    
                    .field {
                        flex: 1;
                        display: flex;
                        align-items: baseline;
                    }
                    
                    .field-label {
                        font-weight: bold;
                        margin-right: 8px;
                        white-space: nowrap;
                        min-width: 90px;
                        font-size: 8pt;
                    }
                    
                    .field-value {
                        border-bottom: 1px solid #000;
                        flex: 1;
                        min-height: 16px;
                        padding: 2px 4px;
                        font-size: 9pt;
                    }
                    
                    .factory-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 8px;
                        font-size: 8pt;
                    }
                    
                    .factory-table th {
                        background: #f0f0f0;
                        border: 1px solid #000;
                        padding: 4px 3px;
                        text-align: center;
                        font-weight: bold;
                        font-size: 7pt;
                    }
                    
                    .factory-table td {
                        border: 1px solid #000;
                        padding: 4px 3px;
                        text-align: left;
                        min-height: 20px;
                        font-size: 8pt;
                        word-wrap: break-word;
                    }
                    
                    .signatures {
                        margin-top: 15px;
                        border-top: 1px solid #000;
                        padding-top: 10px;
                    }
                    
                    .sig-row {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 30px;
                    }
                    
                    .sig-box {
                        text-align: center;
                        width: 30%;
                    }
                    
                    .sig-line {
                        border-bottom: 1px solid #000;
                        height: 25px;
                        margin-bottom: 4px;
                    }
                    
                    .sig-title {
                        font-weight: bold;
                        font-size: 8pt;
                    }
                    
                    .sig-name {
                        font-size: 8pt;
                        margin-top: 2px;
                    }
                    
                    .footer {
                        margin-top: 10px;
                        text-align: center;
                        font-size: 7pt;
                        color: #666;
                        border-top: 1px solid #ccc;
                        padding-top: 5px;
                    }
                    
                    @media print {
                        body { 
                            print-color-adjust: exact; 
                            -webkit-print-color-adjust: exact;
                        }
                        .section { 
                            page-break-inside: avoid; 
                        }
                    }
                </style>
            </head>
            <body>
                <div class="document">
                    <div class="header">
                        <h1>VENDOR REGISTRATION FORM</h1>
                        <h2>For Manufacturing / Trading / Contractors / Transporters / Service Company</h2>
                        <div class="doc-info">
                            <span><strong>DOC NO:</strong> VRF-001</span>
                            <span><strong>Page:</strong> 1 of 1</span>
                            <span><strong>Date:</strong> ${new Date(vendor.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <div class="section">
                        <div class="section-title">GENERAL INFORMATION</div>
                        <div class="field-row">
                            <div class="field">
                                <span class="field-label">Name of Vendor:</span>
                                <span class="field-value">${vendor.vendor_name || ''}</span>
                            </div>
                        </div>
                        <div class="field-row">
                            <div class="field">
                                <span class="field-label">Vendor Code:</span>
                                <span class="field-value">${vendor.vendor_code || ''}</span>
                            </div>
                            <div class="field">
                                <span class="field-label">Year of Establishment:</span>
                                <span class="field-value">${vendor.year_of_establishment || ''}</span>
                            </div>
                        </div>
                    </div>

                    <div class="section">
                        <div class="section-title">FACTORY / OFFICE CONTACT DETAILS</div>
                        <table class="factory-table">
                            <thead>
                                <tr>
                                    <th style="width: 8%;">Factory</th>
                                    <th style="width: 18%;">Address Line 1</th>
                                    <th style="width: 18%;">Address Line 2</th>
                                    <th style="width: 18%;">Address Line 3</th>
                                    <th style="width: 12%;">Mobile No</th>
                                    <th style="width: 12%;">Fax No</th>
                                    <th style="width: 14%;">Email ID</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${vendor.factories.map((factory, index) => `
                                    <tr>
                                        <td>Factory ${index + 1}</td>
                                        <td>${factory.address1 || ''}</td>
                                        <td>${factory.address2 || ''}</td>
                                        <td>${factory.address3 || ''}</td>
                                        <td>${factory.mob_no || ''}</td>
                                        <td>${factory.fax_no || ''}</td>
                                        <td>${factory.email_id || ''}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>

                    <div class="section">
                        <div class="section-title">COMPANY INFORMATION AND TYPE OF BUSINESS</div>
                        <div class="field-row">
                            <div class="field">
                                <span class="field-label">Type of Ownership:</span>
                                <span class="field-value">${(vendor.type_of_ownership || []).join(', ')}</span>
                            </div>
                            <div class="field">
                                <span class="field-label">Type of Business:</span>
                                <span class="field-value">${(vendor.type_of_business || []).join(', ')}</span>
                            </div>
                        </div>
                        <div class="field-row">
                            <div class="field">
                                <span class="field-label">SSI/MSME Registered:</span>
                                <span class="field-value">${vendor.is_ssi_msme || ''}</span>
                            </div>
                            <div class="field">
                                <span class="field-label">Registration No:</span>
                                <span class="field-value">${vendor.registration_no || ''}</span>
                            </div>
                        </div>
                    </div>

                    <div class="section">
                        <div class="section-title">EXCISE & TAX DETAILS</div>
                        <div class="field-row">
                            <div class="field">
                                <span class="field-label">CPCB Lic No:</span>
                                <span class="field-value">${vendor.cpcb_lic_no || ''}</span>
                            </div>
                            <div class="field">
                                <span class="field-label">Sales Tax No:</span>
                                <span class="field-value">${vendor.sales_tax_no || ''}</span>
                            </div>
                        </div>
                        <div class="field-row">
                            <div class="field">
                                <span class="field-label">GST No:</span>
                                <span class="field-value">${vendor.gst_no || ''}</span>
                            </div>
                            <div class="field">
                                <span class="field-label">PAN No:</span>
                                <span class="field-value">${vendor.pan_no || ''}</span>
                            </div>
                        </div>
                    </div>
                    
                    ${vendor.documents && vendor.documents.length > 0 ? `
                    <div class="section">
                        <div class="section-title">ATTACHED DOCUMENTS</div>
                        <ul>
                            ${vendor.documents.map(doc => `<li>${doc.original_name}</li>`).join('')}
                        </ul>
                    </div>
                    ` : ''}

                    <div class="signatures">
                        <div class="sig-row">
                            <div class="sig-box">
                                <div class="sig-line"></div>
                                <div class="sig-title">Prepared by</div>
                                <div class="sig-name">${vendor.prepared_by || ''}</div>
                                <div style="font-size: 7pt; margin-top: 8px;">Date: ___________</div>
                            </div>
                            <div class="sig-box">
                                <div class="sig-line"></div>
                                <div class="sig-title">Authorized by</div>
                                <div class="sig-name">${vendor.authorized_by || ''}</div>
                                <div style="font-size: 7pt; margin-top: 8px;">Date: ___________</div>
                            </div>
                            <div class="sig-box">
                                <div class="sig-line"></div>
                                <div class="sig-title">Approved by</div>
                                <div class="sig-name">${vendor.approved_by || ''}</div>
                                <div style="font-size: 7pt; margin-top: 8px;">Date: ___________</div>
                            </div>
                        </div>
                    </div>

                    <div class="footer">
                        Generated on: ${new Date().toLocaleString()} | Vendor Registration System
                    </div>
                </div>
                
                <script>
                    window.onload = function() {
                        setTimeout(function() {
                            window.print();
                        }, 500);
                    }
                </script>
            </body>
            </html>
        `;

        // Create blob and open in new window
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const printWindow = window.open(url, '_blank', 'width=800,height=600');
        
        // Clean up
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 5000);
    };

    if (currentView === 'table') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">Registered Vendors</h1>
                            <p className="text-gray-600">Manage your vendor database</p>
                        </div>
                        <button
                            onClick={() => {
                                setEditingVendor(null);
                                setFormData(initialFormData);
                                setAttachments([]);
                                setCurrentView('form');
                            }}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <FaPlus />
                            Add New Vendor
                        </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submission Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {vendors.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                                <FaTable className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                                                <p>No vendors registered yet</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        vendors.map(vendor => (
                                            <tr key={vendor.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="font-medium text-gray-900">{vendor.vendor_name}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                                    {vendor.vendor_code}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                                    {(vendor.type_of_business || []).join(', ')}
                                                </td>
                                               
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                                    {new Date(vendor.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => editVendor(vendor)}
                                                            className="text-blue-600 hover:text-blue-800 p-1"
                                                            title="Edit"
                                                        >
                                                            <FaEdit />
                                                        </button>
                                                        <button
                                                            onClick={() => downloadVendorForm(vendor)}
                                                            className="text-green-600 hover:text-green-800 p-1"
                                                            title="Download PDF"
                                                        >
                                                            <FaDownload />
                                                        </button>
                                                        <button
                                                            onClick={() => deleteVendorHandler(vendor.id)}
                                                            className="text-red-600 hover:text-red-800 p-1"
                                                            title="Delete"
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
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div className="text-center flex-1">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4 shadow-lg">
                            <FaBuilding className="text-3xl text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-gray-800 mb-2">
                            {editingVendor ? 'Edit Vendor' : 'Vendor Registration Form'}
                        </h1>
                        <p className="text-lg text-gray-600 mb-2">
                            For Manufacturing / Trading / Contractors / Transporters / Service Company
                        </p>
                        <div className="text-sm text-gray-500 space-x-4">
                            <span>DOC NO: VRF-001</span>
                            <span>Date: {new Date().toLocaleDateString()}</span>
                        </div>
                    </div>
                    
                    {vendors.length > 0 && (
                        <button
                            onClick={() => setCurrentView('table')}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            <FaTable />
                            View All Vendors
                        </button>
                    )}
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <form onSubmit={handleSubmit}>
                    <div className="p-8 space-y-10">
                        
                        {/* General Information */}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3 border-b border-gray-200 pb-3">
                                <FaBuilding className="text-blue-600" />
                                General Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <InputField
                                    label="Name of the Vendor"
                                    name="vendor_name"
                                    value={formData.vendor_name}
                                    onChange={(e) => handleInputChange('vendor_name', e.target.value)}
                                    placeholder="Enter vendor name"
                                    required
                                />
                                
                                <InputField
                                    label="Vendor Code"
                                    name="vendor_code"
                                    value={formData.vendor_code}
                                    onChange={(e) => handleInputChange('vendor_code', e.target.value)}
                                    placeholder="Auto-generated or enter code"
                                />
                                
                                <InputField
                                    label="Year of Establishment"
                                    name="year_of_establishment"
                                    type="number"
                                    value={formData.year_of_establishment}
                                    onChange={(e) => handleInputChange('year_of_establishment', e.target.value)}
                                    placeholder="e.g., 2010"
                                    min="1900"
                                    max={new Date().getFullYear()}
                                />
                            </div>
                        </div>

                        {/* Factory Details */}
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3 border-b border-gray-200 pb-3">
                                    <FaWarehouse className="text-blue-600" />
                                    Factory / Office Contact Details
                                </h2>
                                <button
                                    type="button"
                                    onClick={addFactory}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <FaPlus />
                                    Add Factory
                                </button>
                            </div>
                            
                            {formData.factories.map((factory, index) => (
                                <div key={index} className="relative border border-gray-200 rounded-lg p-6 mb-6 bg-gray-50">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-700">
                                            Factory {index + 1}
                                        </h3>
                                        {formData.factories.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeFactory(index)}
                                                className="text-red-500 hover:text-red-700 p-1"
                                            >
                                                <FaTimes />
                                            </button>
                                        )}
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div className="lg:col-span-3">
                                            <InputField
                                                label="Address Line 1"
                                                name={`address1_${index}`}
                                                value={factory.address1}
                                                onChange={(e) => handleFactoryChange(index, 'address1', e.target.value)}
                                                placeholder="Building, Street"
                                            />
                                        </div>
                                        
                                        <InputField
                                            label="Address Line 2"
                                             name={`address2_${index}`}
                                            value={factory.address2}
                                            onChange={(e) => handleFactoryChange(index, 'address2', e.target.value)}
                                            placeholder="Area, Locality"
                                        />
                                        
                                        <InputField
                                            label="Address Line 3"
                                             name={`address3_${index}`}
                                            value={factory.address3}
                                            onChange={(e) => handleFactoryChange(index, 'address3', e.target.value)}
                                            placeholder="City, State, PIN"
                                        />
                                        
                                        <InputField
                                            label="Mobile Number"
                                            name={`mob_no_${index}`}
                                            type="tel"
                                            value={factory.mob_no}
                                            onChange={(e) => handleFactoryChange(index, 'mob_no', e.target.value)}
                                            placeholder="+91 98765 43210"
                                        />
                                        
                                        <InputField
                                            label="Fax Number"
                                            name={`fax_no_${index}`}
                                            value={factory.fax_no}
                                            onChange={(e) => handleFactoryChange(index, 'fax_no', e.target.value)}
                                            placeholder="Fax number"
                                        />
                                        
                                        <InputField
                                            label="Email ID"
                                            name={`email_id_${index}`}
                                            type="email"
                                            value={factory.email_id}
                                            onChange={(e) => handleFactoryChange(index, 'email_id', e.target.value)}
                                            placeholder="email@company.com"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Company Information */}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3 border-b border-gray-200 pb-3">
                                <FaIndustry className="text-blue-600" />
                                Company Information and Type of Business
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                     <label className="block text-sm font-semibold text-gray-700">Type of Ownership</label>
                                     <Select
                                        isMulti
                                        name="type_of_ownership"
                                        options={ownershipOptions}
                                        value={formData.type_of_ownership}
                                        onChange={(options) => handleMultiSelectChange('type_of_ownership', options)}
                                        className="basic-multi-select"
                                        classNamePrefix="select"
                                     />
                                </div>
                                
                                <div className="space-y-2">
                                     <label className="block text-sm font-semibold text-gray-700">Type of Business</label>
                                     <Select
                                        isMulti
                                        name="type_of_business"
                                        options={businessTypeOptions}
                                        value={formData.type_of_business}
                                        onChange={(options) => handleMultiSelectChange('type_of_business', options)}
                                        className="basic-multi-select"
                                        classNamePrefix="select"
                                     />
                                </div>
                                
                                <SelectField
                                    label="Whether registered as SSI unit / MSME"
                                    name="is_ssi_msme"
                                    value={formData.is_ssi_msme}
                                    onChange={(e) => handleInputChange('is_ssi_msme', e.target.value)}
                                    options={['Yes', 'No']}
                                    placeholder="Select Yes/No"
                                />
                                
                                <InputField
                                    label="Registration Number"
                                     name="registration_no"
                                    value={formData.registration_no}
                                    onChange={(e) => handleInputChange('registration_no', e.target.value)}
                                    placeholder="SSI/MSME Registration No."
                                />
                            </div>
                        </div>

                        {/* Tax Details */}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3 border-b border-gray-200 pb-3">
                                <FaFileContract className="text-blue-600" />
                                Excise & Tax Details
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField
                                    label="CPCB License Number"
                                    name="cpcb_lic_no"
                                    value={formData.cpcb_lic_no}
                                    onChange={(e) => handleInputChange('cpcb_lic_no', e.target.value)}
                                    placeholder="CPCB License Number"
                                />
                                
                                <InputField
                                    label="Sales Tax Number"
                                    name="sales_tax_no"
                                    value={formData.sales_tax_no}
                                    onChange={(e) => handleInputChange('sales_tax_no', e.target.value)}
                                    placeholder="Sales Tax Number"
                                />
                                
                                <InputField
                                    label="GST Number"
                                    name="gst_no"
                                    value={formData.gst_no}
                                    onChange={(e) => handleInputChange('gst_no', e.target.value)}
                                    placeholder="22ABCDE1234F1Z5"
                                />
                                
                                <InputField
                                    label="PAN Number"
                                    name="pan_no"
                                    value={formData.pan_no}
                                    onChange={(e) => handleInputChange('pan_no', e.target.value)}
                                    placeholder="ABCDE1234F"
                                />
                            </div>
                        </div>

                        {/* Document Attachments */}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3 border-b border-gray-200 pb-3">
                                <FaUpload className="text-blue-600" />
                                Document Attachments
                            </h2>
                            
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    multiple
                                    className="hidden"
                                    accept=".pdf,.doc,.docx,.jpg,.png,.jpeg"
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <FaPlus />
                                    Add Documents
                                </button>
                                <p className="text-sm text-gray-500 mt-2">
                                    Upload GST Certificate, PAN Card, Registration Documents, etc.
                                </p>
                            </div>

                            {attachments.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    {attachments.map(doc => (
                                        <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <FaFileAlt className="text-blue-600" />
                                                <div>
                                                    <p className="font-medium">{doc.original_name || doc.name}</p>
                                                    <p className="text-sm text-gray-500">{(doc.file_size / 1024).toFixed(1)} KB</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {doc.file_path && 
                                                    <button type="button" onClick={() => handleDownload(doc)} className="text-green-600 hover:text-green-800 p-1"><FaDownload/></button>
                                                }
                                                <button
                                                    onClick={() => removeDocument(doc.id)}
                                                    className="text-red-500 hover:text-red-700 p-1"
                                                >
                                                    <FaTimes />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Signature Details */}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3 border-b border-gray-200 pb-3">
                                <FaUser className="text-blue-600" />
                                Authorization & Approval
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <InputField
                                    label="Prepared by"
                                    name="prepared_by"
                                    value={formData.prepared_by}
                                    onChange={(e) => handleInputChange('prepared_by', e.target.value)}
                                    placeholder="Name of person preparing"
                                />
                                
                                <InputField
                                    label="Authorized by"
                                    name="authorized_by"
                                    value={formData.authorized_by}
                                    onChange={(e) => handleInputChange('authorized_by', e.target.value)}
                                    placeholder="Department head name"
                                />
                                
                                <InputField
                                    label="Approved by"
                                    name="approved_by"
                                    value={formData.approved_by}
                                    onChange={(e) => handleInputChange('approved_by', e.target.value)}
                                    placeholder="Management approval"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Section */}
                    <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
                        <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
                            <div className="text-sm text-gray-600 space-y-2">
                                <p>All fields are optional unless specified</p>
                                <p>Documents can be uploaded for verification</p>
                            </div>
                            
                            <div className="flex gap-4">
                                {editingVendor && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditingVendor(null);
                                            setCurrentView('table');
                                        }}
                                        className="px-8 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                )}
                                
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-12 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-3"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <FaSpinner className="animate-spin text-xl" />
                                            <span>{editingVendor ? 'Updating...' : 'Submitting...'}</span>
                                        </>
                                    ) : (
                                        <>
                                            <FaSave className="text-xl" />
                                            <span>{editingVendor ? 'Update Vendor' : 'Register Vendor'}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// Input Field Component
const InputField = ({ label, required, ...props }) => (
    <div className="space-y-2">
        <label htmlFor={props.name} className="block text-sm font-semibold text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            id={props.name}
            {...props}
            className="w-full h-11 px-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 hover:border-gray-300 bg-white"
        />
    </div>
);

// Select Field Component
const SelectField = ({ label, options, placeholder, required, ...props }) => (
    <div className="space-y-2">
        <label htmlFor={props.name} className="block text-sm font-semibold text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <select
             id={props.name}
            {...props}
            className="w-full h-11 px-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 hover:border-gray-300 bg-white appearance-none"
        >
            <option value="">{placeholder}</option>
            {options.map(option => (
                <option key={option} value={option}>{option}</option>
            ))}
        </select>
    </div>
);

export default VendorRegistrationPage;