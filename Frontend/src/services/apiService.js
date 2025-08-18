import axios from 'axios';
import authService from './authService';

// --- THIS IS THE FIX ---
// The API_URL is now a relative path. It will automatically use the
// domain of the frontend, which is exactly what we want when using Nginx.
const API_URL = '/api';

const api = axios.create({
    baseURL: API_URL,
});

// Add a request interceptor to include the token in all requests
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

// --- Operations Functions ---
export const createInwardEntry = (entryData) => { return api.post('/operations/inward-entries', entryData); };
export const getPendingEntries = () => { return api.get('/operations/inward-entries/pending'); };
export const completeInwardEntry = (entryId, tareWeight, material = null) => {
    const payload = { tare_weight_tons: tareWeight, material: material };
    return api.put(`/operations/inward-entries/${entryId}/complete`, payload);
};
export const getCompletedEntries = () => { return api.get('/operations/inward-entries/completed'); };
export const createSortingLog = (logData) => { return api.post('/operations/sorting-log', logData); };
export const getSortingLogs = () => { return api.get('/operations/sorting-logs'); };
export const getInventory = () => { return api.get('/operations/inventory'); };
export const getCashbookData = (date) => { return api.get(`/operations/cashbook?date=${date}`); };
export const createCashbookTransaction = (transactionData) => { return api.post('/operations/cashbook', transactionData); };

export const getMaterialSales = () => {
    return api.get('/operations/sales');
};

export const createSaleEntry = (saleData) => {
    const payload = {
        inward_entry_id: saleData.id,
        party_id: saleData.party_id,
        transporter_id: saleData.transporter_id,
        sale_date: saleData.date,
        driver_name: saleData.driver_name,
        driver_mobile: saleData.driver_mobile,
        rate: saleData.rate,
        gst_percentage: saleData.gst_percentage,
        amount: saleData.amount,
        gst_amount: saleData.gst_amount,
        total_amount: saleData.total_amount_with_gst,
        mode_of_payment: saleData.mode_of_payment,
        remark: saleData.remark,
        transportation_expense: saleData.transportation_expense,
    };
    return api.post('/operations/sales', payload);
};

// --- Partner Functions ---
export const getAllPartners = () => { return api.get('/operations/partners'); };
export const createPartner = (name, type) => { return api.post('/operations/partners', { name: name, type: type }); };


// --- NEW EMPLOYEE FUNCTIONS ---
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

// --- NEW ATTENDANCE FUNCTIONS ---
export const getAttendance = (month) => { // month is 'YYYY-MM'
    return api.get(`/operations/attendance?month=${month}`);
};
export const saveAttendance = (date, records) => { // date is 'YYYY-MM-DD'
    return api.post('/operations/attendance', { date, records });
};