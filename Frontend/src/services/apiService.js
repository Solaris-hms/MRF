import axios from 'axios';
import authService from './authService';

const API_URL = '/api';

const api = axios.create({
    baseURL: API_URL,
});

// Request interceptor - include token in requests
api.interceptors.request.use(
    (config) => {
        const token = authService.getCurrentToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle 401 errors automatically
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.log('401 Unauthorized - redirecting to login');
            authService.logout();
            // Redirect to login page
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// --- Admin Functions ---
export const getPendingUsers = () => { return api.get('/admin/pending-users'); };
export const getAllRoles = () => { return api.get('/admin/roles'); };
export const getAllUsers = () => { return api.get('/admin/users'); };
export const updateUser = (userId, userData) => { return api.put(`/admin/users/${userId}`, userData); };
export const approveUser = (userId, roleId) => { return api.post(`/admin/approve/${userId}`, { role_id: roleId }); };
export const rejectUser = (userId) => { return api.delete(`/admin/reject/${userId}`); };
export const getAllPermissions = () => { return api.get('/admin/permissions'); };
export const getPermissionsForRole = (roleId) => { return api.get(`/admin/roles/${roleId}/permissions`); };
export const updatePermissionsForRole = (roleId, permissionIds) => { return api.put(`/admin/roles/${roleId}/permissions`, { permission_ids: permissionIds }); };

// --- Inward Entry Functions ---
export const createInwardEntry = (entryData) => { return api.post('/operations/inward-entries', entryData); };
export const getPendingEntries = () => { return api.get('/operations/inward-entries/pending'); };
export const completeInwardEntry = (entryId, tareWeight, material = null) => {
    const payload = { tare_weight_tons: tareWeight, material: material };
    return api.put(`/operations/inward-entries/${entryId}/complete`, payload);
};
export const getCompletedEntries = () => { return api.get('/operations/inward-entries/completed'); };
export const deleteInwardEntry = (entryId) => {
    return api.delete(`/operations/inward-entries/${entryId}`);
};

// --- Sorting, Inventory, and Cashbook ---
export const createSortingLog = (logData) => { return api.post('/operations/sorting-log', logData); };
export const getSortingLogs = () => { return api.get('/operations/sorting-logs'); };
export const getInventory = () => { return api.get('/operations/inventory'); };
export const getCashbookData = (date) => { return api.get(`/operations/cashbook?date=${date}`); };
export const createCashbookTransaction = (transactionData) => { return api.post('/operations/cashbook', transactionData); };

// --- Sales Functions ---
export const getMaterialSales = () => {
    return api.get('/operations/sales');
};

export const createSaleEntry = (saleData) => {
    const payload = {
        inward_entry_id: saleData.id,
        party_id: saleData.party_id,
        transporter_id: saleData.transporter_id,
        sale_date: saleData.date,
        driver_name: saleData.driverName,
        driver_mobile: saleData.driverMobile,
        rate: parseFloat(saleData.rate) || 0,
        gst_percentage: parseFloat(saleData.gst) || 0,
        amount: saleData.amount,
        gst_amount: saleData.gst_amount,
        total_amount: saleData.total_amount_with_gst,
        mode_of_payment: saleData.modeOfPayment,
        remark: saleData.remark,
        transportation_expense: parseFloat(saleData.transportation_expense) || 0,
        // --- UPDATED DEDUCTION FIELDS ---
        original_weight_tons: saleData.original_weight_tons,
        deduction_type: saleData.deduction_type,
        deduction_value: saleData.deduction_value,
        deduction_amount: saleData.deduction_amount,
        deduction_reason: saleData.deduction_reason,
        billing_weight_tons: saleData.billing_weight_tons,
    };
    return api.post('/operations/sales', payload);
};


// --- Partner Functions ---
export const getAllPartners = () => { return api.get('/operations/partners'); };
export const createPartner = (name, type) => { return api.post('/operations/partners', { name: name, type: type }); };

// --- Employee & Attendance Functions ---
export const getEmployees = () => {
    return api.get('/operations/employees');
};
export const createEmployee = (employeeData) => {
    return api.post('/operations/employees', employeeData);
};
export const updateEmployee = (id, employeeData) => {
    return api.put(`/operations/employees/${id}`, employeeData);
};
export const deleteEmployee = (id) => {
    return api.delete(`/operations/employees/${id}`);
};

export const getAttendance = (month) => {
    return api.get(`/operations/attendance?month=${month}`);
};
export const saveAttendance = (date, records) => {
    return api.post('/operations/attendance', { date, records });
};

// --- Asset Functions ---
export const getAssets = () => {
    return api.get('/operations/assets');
};
export const createAsset = (assetData) => {
    return api.post('/operations/assets', assetData);
};
export const updateAsset = (id, assetData) => {
    return api.put(`/operations/assets/${id}`, assetData);
};
export const deleteAsset = (id) => {
    return api.delete(`/operations/assets/${id}`);
};
export const uploadAssetImage = (id, imageData) => {
    return api.post(`/operations/assets/${id}/image`, imageData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

// --- Vendor Functions ---
export const createVendor = (vendorData) => {
    return api.post('/operations/vendors', vendorData);
};

export const getVendors = () => {
    return api.get('/operations/vendors');
};

export const getVendor = (vendorId) => {
    return api.get(`/operations/vendors/${vendorId}`);
};

export const updateVendor = (vendorId, vendorData) => {
    return api.put(`/operations/vendors/${vendorId}`, vendorData);
};

export const deleteVendor = (vendorId) => {
    return api.delete(`/operations/vendors/${vendorId}`);
};

export const uploadVendorDocuments = (vendorId, files) => {
    const formData = new FormData();
    files.forEach(file => {
        formData.append('documents', file);
    });

    return api.post(`/operations/vendors/${vendorId}/documents`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const downloadVendorDocument = (docId) => {
    return api.get(`/operations/vendor-documents/${docId}/download`, {
        responseType: 'blob',
    });
};

export const deleteVendorDocument = (docId) => {
    return api.delete(`/operations/vendor-documents/${docId}`);
};

// --- NEW AUDIT FUNCTIONS ---
export const adjustInventory = (materialId, adjustmentAmount, reason) => {
    const payload = {
        material_id: materialId,
        adjustment_amount: adjustmentAmount,
        reason: reason,
    };
    return api.post('/operations/inventory/adjust', payload);
};

export const getAuditLogs = () => {
    return api.get('/operations/inventory/audits');
};
export const createPlantHeadReport = (reportData) => {
    return api.post('/operations/reports/plant-head', reportData);
};

export const createAsstPlantHeadReport = (reportData) => {
    return api.post('/operations/reports/asst-plant-head', reportData);
};

export const createWorkforceMaterialReport = (reportData) => {
    return api.post('/operations/reports/workforce-material', reportData);
};

// --- Reporting Functions ---
export const getPlantHeadReports = () => {
    return api.get('/operations/reports/plant-head');
};

export const getAsstPlantHeadReports = () => {
    return api.get('/operations/reports/asst-plant-head');
};

export const getWorkforceMaterialReports = () => {
    return api.get('/operations/reports/workforce-material');
};