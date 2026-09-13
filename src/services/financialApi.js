import api from './api';

export const financialApi = {
  getPendingInvoices: async (branchId) => {
    const response = await api.get('/invoices/pending', {
      params: { branch_id: branchId },
    });
    return response.data?.data || [];
  },

  getInvoices: async (branchId, filters = {}) => {
    const response = await api.get('/invoices', {
      params: { branch_id: branchId, ...filters },
    });
    return response.data?.data || null;
  },

  getInvoice: async (invoiceId) => {
    const response = await api.get(`/invoices/${invoiceId}`);
    return response.data?.data || null;
  },

  getInvoiceForAppointment: async (appointmentId) => {
    const response = await api.get(`/invoices/appointment/${appointmentId}`);
    return response.data?.data || null;
  },

  addInvoiceItem: async (invoiceId, serviceId, quantity = 1) => {
    const response = await api.post(`/invoices/${invoiceId}/items`, {
      service_id: serviceId,
      quantity,
    });
    return response.data?.data || null;
  },

  removeInvoiceItem: async (invoiceId, itemId) => {
    const response = await api.delete(`/invoices/${invoiceId}/items/${itemId}`);
    return response.data?.data || null;
  },

  processPayment: async (invoiceId, payments) => {
    const response = await api.post(`/invoices/${invoiceId}/pay`, {
      payments,
    });
    return response.data?.data || null;
  },

  getBranchServices: async (branchId) => {
    const response = await api.get('/billing/services', {
      params: { branch_id: branchId },
    });
    return response.data?.data || [];
  },

  createService: async (data) => {
    const response = await api.post('/billing/services', data);
    return response.data?.data || null;
  },

  updateService: async (serviceId, data) => {
    const response = await api.put(`/billing/services/${serviceId}`, data);
    return response.data?.data || null;
  },

  deleteService: async (serviceId) => {
    const response = await api.delete(`/billing/services/${serviceId}`);
    return response.data?.data || null;
  },
};

export default financialApi;
