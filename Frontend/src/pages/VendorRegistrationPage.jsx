import React, { useState, useRef } from 'react';
import { 
    FaBuilding, FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, 
    FaIndustry, FaFileContract, FaSave, FaSpinner, FaCheckCircle,
    FaIdCard, FaCalendarAlt, FaPlus, FaTimes, FaWarehouse, FaUpload,
    FaEdit, FaTrash, FaDownload, FaEye, FaFileAlt, FaTable
} from 'react-icons/fa';

const VendorRegistrationPage = () => {
    const [currentView, setCurrentView] = useState('form'); // 'form' or 'table'
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [vendors, setVendors] = useState([]); // Store all registered vendors
    const [editingVendor, setEditingVendor] = useState(null);
    
    const [formData, setFormData] = useState({
        // General Information
        vendorName: '',
        vendorCode: '',
        yearOfEstablishment: '',
        
        // Factory Details
        factories: [{
            address1: '',
            address2: '',
            address3: '',
            mobNo: '',
            faxNo: '',
            emailId: ''
        }],
        
        // Company Information
        typeOfOwnership: '',
        typeOfBusiness: '',
        isSSI_MSME: '',
        registrationNo: '',
        
        // Tax Details
        cpcbLicNo: '',
        salesTaxNo: '',
        gstNo: '',
        panNo: '',
        
        // Document Attachments
        documents: [],
        
        // Signature Details
        preparedBy: '',
        authorizedBy: '',
        approvedBy: '',
        
        // Meta
        submissionDate: '',
        status: 'Pending'
    });

    const [attachments, setAttachments] = useState([]);
    const fileInputRef = useRef(null);

    const ownershipTypes = [
        'Public Sector', 'Private Sector', 'Joint Sector', 'Proprietorship', 'Partnership'
    ];

    const businessTypes = [
        'Manufacturing', 'Trading', 'Contractors', 'Transporters', 'Service Company'
    ];

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

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
                address1: '', address2: '', address3: '', mobNo: '', faxNo: '', emailId: ''
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
        files.forEach(file => {
            const newDoc = {
                id: Date.now() + Math.random(),
                name: file.name,
                size: file.size,
                type: file.type,
                file: file
            };
            setAttachments(prev => [...prev, newDoc]);
        });
        e.target.value = '';
    };

    const removeDocument = (docId) => {
        setAttachments(prev => prev.filter(doc => doc.id !== docId));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const newVendor = {
            ...formData,
            id: editingVendor ? editingVendor.id : Date.now(),
            documents: attachments,
            submissionDate: new Date().toLocaleDateString(),
            status: 'Pending'
        };

        if (editingVendor) {
            setVendors(prev => prev.map(v => v.id === editingVendor.id ? newVendor : v));
            setEditingVendor(null);
        } else {
            setVendors(prev => [...prev, newVendor]);
        }

        // Reset form
        setFormData({
            vendorName: '', vendorCode: '', yearOfEstablishment: '',
            factories: [{ address1: '', address2: '', address3: '', mobNo: '', faxNo: '', emailId: '' }],
            typeOfOwnership: '', typeOfBusiness: '', isSSI_MSME: '', registrationNo: '',
            cpcbLicNo: '', salesTaxNo: '', gstNo: '', panNo: '',
            documents: [], preparedBy: '', authorizedBy: '', approvedBy: '',
            submissionDate: '', status: 'Pending'
        });
        setAttachments([]);
        setIsSubmitting(false);
        setCurrentView('table');
    };

    const editVendor = (vendor) => {
        setFormData(vendor);
        setAttachments(vendor.documents || []);
        setEditingVendor(vendor);
        setCurrentView('form');
    };

    const deleteVendor = (vendorId) => {
        if (window.confirm('Are you sure you want to delete this vendor?')) {
            setVendors(prev => prev.filter(v => v.id !== vendorId));
        }
    };

    const downloadVendorForm = (vendor) => {
        const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Vendor Registration Form - ${vendor.vendorName}</title>
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
                            <span><strong>Date:</strong> ${vendor.submissionDate || new Date().toLocaleDateString()}</span>
                        </div>
                    </div>

                    <div class="section">
                        <div class="section-title">GENERAL INFORMATION</div>
                        <div class="field-row">
                            <div class="field">
                                <span class="field-label">Name of Vendor:</span>
                                <span class="field-value">${vendor.vendorName || ''}</span>
                            </div>
                        </div>
                        <div class="field-row">
                            <div class="field">
                                <span class="field-label">Vendor Code:</span>
                                <span class="field-value">${vendor.vendorCode || ''}</span>
                            </div>
                            <div class="field">
                                <span class="field-label">Year of Establishment:</span>
                                <span class="field-value">${vendor.yearOfEstablishment || ''}</span>
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
                                        <td>${factory.mobNo || ''}</td>
                                        <td>${factory.faxNo || ''}</td>
                                        <td>${factory.emailId || ''}</td>
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
                                <span class="field-value">${vendor.typeOfOwnership || ''}</span>
                            </div>
                            <div class="field">
                                <span class="field-label">Type of Business:</span>
                                <span class="field-value">${vendor.typeOfBusiness || ''}</span>
                            </div>
                        </div>
                        <div class="field-row">
                            <div class="field">
                                <span class="field-label">SSI/MSME Registered:</span>
                                <span class="field-value">${vendor.isSSI_MSME || ''}</span>
                            </div>
                            <div class="field">
                                <span class="field-label">Registration No:</span>
                                <span class="field-value">${vendor.registrationNo || ''}</span>
                            </div>
                        </div>
                    </div>

                    <div class="section">
                        <div class="section-title">EXCISE & TAX DETAILS</div>
                        <div class="field-row">
                            <div class="field">
                                <span class="field-label">CPCB Lic No:</span>
                                <span class="field-value">${vendor.cpcbLicNo || ''}</span>
                            </div>
                            <div class="field">
                                <span class="field-label">Sales Tax No:</span>
                                <span class="field-value">${vendor.salesTaxNo || ''}</span>
                            </div>
                        </div>
                        <div class="field-row">
                            <div class="field">
                                <span class="field-label">GST No:</span>
                                <span class="field-value">${vendor.gstNo || ''}</span>
                            </div>
                            <div class="field">
                                <span class="field-label">PAN No:</span>
                                <span class="field-value">${vendor.panNo || ''}</span>
                            </div>
                        </div>
                    </div>

                    <div class="signatures">
                        <div class="sig-row">
                            <div class="sig-box">
                                <div class="sig-line"></div>
                                <div class="sig-title">Prepared by</div>
                                <div class="sig-name">${vendor.preparedBy || ''}</div>
                                <div style="font-size: 7pt; margin-top: 8px;">Date: ___________</div>
                            </div>
                            <div class="sig-box">
                                <div class="sig-line"></div>
                                <div class="sig-title">Authorized by</div>
                                <div class="sig-name">${vendor.authorizedBy || ''}</div>
                                <div style="font-size: 7pt; margin-top: 8px;">Date: ___________</div>
                            </div>
                            <div class="sig-box">
                                <div class="sig-line"></div>
                                <div class="sig-title">Approved by</div>
                                <div class="sig-name">${vendor.approvedBy || ''}</div>
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
                            onClick={() => setCurrentView('form')}
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
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submission Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {vendors.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                                <FaTable className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                                                <p>No vendors registered yet</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        vendors.map(vendor => (
                                            <tr key={vendor.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="font-medium text-gray-900">{vendor.vendorName}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                                    {vendor.vendorCode}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                                    {vendor.typeOfBusiness}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                                                        {vendor.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                                    {vendor.submissionDate}
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
                                                            onClick={() => deleteVendor(vendor.id)}
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
                                    value={formData.vendorName}
                                    onChange={(e) => handleInputChange('vendorName', e.target.value)}
                                    placeholder="Enter vendor name"
                                />
                                
                                <InputField
                                    label="Vendor Code"
                                    value={formData.vendorCode}
                                    onChange={(e) => handleInputChange('vendorCode', e.target.value)}
                                    placeholder="Auto-generated or enter code"
                                />
                                
                                <InputField
                                    label="Year of Establishment"
                                    type="number"
                                    value={formData.yearOfEstablishment}
                                    onChange={(e) => handleInputChange('yearOfEstablishment', e.target.value)}
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
                                                value={factory.address1}
                                                onChange={(e) => handleFactoryChange(index, 'address1', e.target.value)}
                                                placeholder="Building, Street"
                                            />
                                        </div>
                                        
                                        <InputField
                                            label="Address Line 2"
                                            value={factory.address2}
                                            onChange={(e) => handleFactoryChange(index, 'address2', e.target.value)}
                                            placeholder="Area, Locality"
                                        />
                                        
                                        <InputField
                                            label="Address Line 3"
                                            value={factory.address3}
                                            onChange={(e) => handleFactoryChange(index, 'address3', e.target.value)}
                                            placeholder="City, State, PIN"
                                        />
                                        
                                        <InputField
                                            label="Mobile Number"
                                            type="tel"
                                            value={factory.mobNo}
                                            onChange={(e) => handleFactoryChange(index, 'mobNo', e.target.value)}
                                            placeholder="+91 98765 43210"
                                        />
                                        
                                        <InputField
                                            label="Fax Number"
                                            value={factory.faxNo}
                                            onChange={(e) => handleFactoryChange(index, 'faxNo', e.target.value)}
                                            placeholder="Fax number"
                                        />
                                        
                                        <InputField
                                            label="Email ID"
                                            type="email"
                                            value={factory.emailId}
                                            onChange={(e) => handleFactoryChange(index, 'emailId', e.target.value)}
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
                                <SelectField
                                    label="Type of Ownership"
                                    value={formData.typeOfOwnership}
                                    onChange={(e) => handleInputChange('typeOfOwnership', e.target.value)}
                                    options={ownershipTypes}
                                    placeholder="Select ownership type"
                                />
                                
                                <SelectField
                                    label="Type of Business"
                                    value={formData.typeOfBusiness}
                                    onChange={(e) => handleInputChange('typeOfBusiness', e.target.value)}
                                    options={businessTypes}
                                    placeholder="Select business type"
                                />
                                
                                <SelectField
                                    label="Whether registered as SSI unit / MSME"
                                    value={formData.isSSI_MSME}
                                    onChange={(e) => handleInputChange('isSSI_MSME', e.target.value)}
                                    options={['Yes', 'No']}
                                    placeholder="Select Yes/No"
                                />
                                
                                <InputField
                                    label="Registration Number"
                                    value={formData.registrationNo}
                                    onChange={(e) => handleInputChange('registrationNo', e.target.value)}
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
                                    value={formData.cpcbLicNo}
                                    onChange={(e) => handleInputChange('cpcbLicNo', e.target.value)}
                                    placeholder="CPCB License Number"
                                />
                                
                                <InputField
                                    label="Sales Tax Number"
                                    value={formData.salesTaxNo}
                                    onChange={(e) => handleInputChange('salesTaxNo', e.target.value)}
                                    placeholder="Sales Tax Number"
                                />
                                
                                <InputField
                                    label="GST Number"
                                    value={formData.gstNo}
                                    onChange={(e) => handleInputChange('gstNo', e.target.value)}
                                    placeholder="22ABCDE1234F1Z5"
                                />
                                
                                <InputField
                                    label="PAN Number"
                                    value={formData.panNo}
                                    onChange={(e) => handleInputChange('panNo', e.target.value)}
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
                                                    <p className="font-medium">{doc.name}</p>
                                                    <p className="text-sm text-gray-500">{(doc.size / 1024).toFixed(1)} KB</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => removeDocument(doc.id)}
                                                className="text-red-500 hover:text-red-700 p-1"
                                            >
                                                <FaTimes />
                                            </button>
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
                                    value={formData.preparedBy}
                                    onChange={(e) => handleInputChange('preparedBy', e.target.value)}
                                    placeholder="Name of person preparing"
                                />
                                
                                <InputField
                                    label="Authorized by"
                                    value={formData.authorizedBy}
                                    onChange={(e) => handleInputChange('authorizedBy', e.target.value)}
                                    placeholder="Department head name"
                                />
                                
                                <InputField
                                    label="Approved by"
                                    value={formData.approvedBy}
                                    onChange={(e) => handleInputChange('approvedBy', e.target.value)}
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
                                    type="button"
                                    onClick={handleSubmit}
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
                </div>
            </div>
        </div>
    );
};

// Input Field Component
const InputField = ({ label, required, ...props }) => (
    <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            {...props}
            className="w-full h-11 px-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 hover:border-gray-300 bg-white"
        />
    </div>
);

// Select Field Component
const SelectField = ({ label, options, placeholder, required, ...props }) => (
    <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <select
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