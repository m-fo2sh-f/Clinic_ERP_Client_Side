import React, { useState, useEffect } from 'react';
import {
  Settings,
  Receipt,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Search,
  Sparkles,
  Tag,
  DollarSign,
  X,
} from 'lucide-react';
import { useBranchContext } from '../../../context/BranchContext';
import financialApi from '../../../services/financialApi';

export default function ClinicSettingsPage() {
  const { activeBranch } = useBranchContext();
  const branchId = activeBranch?.id;
  const branchName = activeBranch?.name || 'Main Branch';

  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const loadServices = async () => {
    if (!branchId) return;
    try {
      setIsLoading(true);
      const data = await financialApi.getBranchServices(branchId);
      setServices(data || []);
    } catch (err) {
      console.error('Failed to load clinic services:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, [branchId]);

  const handleOpenAdd = () => {
    setEditingService(null);
    setFormName('');
    setFormCode('');
    setFormPrice('');
    setFeedbackMsg('');
    setIsEditModalOpen(true);
  };

  const handleOpenEdit = (svc) => {
    setEditingService(svc);
    setFormName(svc.name);
    setFormCode(svc.code || '');
    setFormPrice(String(svc.price));
    setFeedbackMsg('');
    setIsEditModalOpen(true);
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    if (!formName.trim() || !formPrice) return;

    try {
      setIsSaving(true);
      setFeedbackMsg('');

      if (editingService) {
        // Update existing service
        await financialApi.updateService(editingService.id, {
          name: formName.trim(),
          code: formCode.trim() || undefined,
          price: Number(formPrice),
          branch_id: branchId,
        });
        setFeedbackMsg('Service and pricing updated successfully.');
      } else {
        // Create new service
        await financialApi.createService({
          name: formName.trim(),
          code: formCode.trim() || undefined,
          price: Number(formPrice),
          branch_id: branchId,
        });
        setFeedbackMsg('New service added successfully.');
      }

      await loadServices();
      setTimeout(() => {
        setIsEditModalOpen(false);
      }, 700);
    } catch (err) {
      console.error('Error saving service:', err);
      alert(err?.response?.data?.message || 'Failed to save service.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredServices = services.filter((svc) =>
    svc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (svc.code && svc.code.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto" dir="ltr">
      {/* Top Banner */}
      <div className="bg-white px-6 py-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-clinic-50 text-clinic-600 rounded-xl border border-clinic-100">
            <Settings className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 m-0">Clinic Settings & Medical Services Catalog</h2>
            <p className="text-xs text-slate-500 mt-1 m-0">
              Manage names, codes, and pricing for medical procedures for <strong className="text-clinic-600">{branchName}</strong>
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-clinic-600 hover:bg-clinic-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Service / Procedure</span>
        </button>
      </div>

      {/* Services Catalog Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-clinic-600" />
            <h3 className="font-bold text-sm text-slate-900 m-0">Approved Services & Pricing</h3>
            <span className="text-xs bg-slate-100 font-mono text-slate-600 px-2 py-0.5 rounded-full font-bold">
              {services.length} services
            </span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or code..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-1 focus:ring-clinic-500"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="py-16 flex items-center justify-center gap-2 text-xs text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin text-clinic-600" />
            <span>Loading services catalog...</span>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            No services matching your search.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredServices.map((svc) => (
              <div
                key={svc.id}
                className="p-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors flex-wrap gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-mono font-bold text-slate-600 text-xs shrink-0">
                    {svc.code ? svc.code.substring(0, 3) : 'SVC'}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 m-0 flex items-center gap-2">
                      {svc.name}
                      {(svc.code === 'CONSULTATION' || svc.code === 'CHECK_UP') && (
                        <span className="bg-clinic-50 text-clinic-700 text-[10px] px-2 py-0.5 rounded font-bold">
                          Consultation
                        </span>
                      )}
                    </h4>
                    {svc.code && (
                      <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                        Code: {svc.code}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right bg-emerald-50/70 border border-emerald-200/80 px-3.5 py-1.5 rounded-xl">
                    <span className="text-[10px] text-emerald-700 font-semibold block">Current Price</span>
                    <strong className="text-base font-bold font-mono text-emerald-800">
                      {Number(svc.price).toFixed(2)} EGP
                    </strong>
                  </div>

                  <button
                    onClick={() => handleOpenEdit(svc)}
                    className="p-2 text-slate-500 hover:text-clinic-600 hover:bg-clinic-50 border border-slate-200 hover:border-clinic-300 rounded-xl transition-all cursor-pointer"
                    title="Edit service details"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* EDIT / CREATE SERVICE MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in" dir="ltr">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm m-0 flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-clinic-400" />
                <span>{editingService ? 'Edit Service & Pricing' : 'Add New Service to Catalog'}</span>
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="p-6 space-y-4">
              {feedbackMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{feedbackMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Service / Procedure Name:
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. ECG Test or Ultrasound"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-1 focus:ring-clinic-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Service Code (Short identifier):
                </label>
                <input
                  type="text"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  placeholder="e.g. ECG or US-ABD"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:ring-1 focus:ring-clinic-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Price (EGP):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full pr-14 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold font-mono text-slate-900 focus:bg-white focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">EGP</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  This price will apply immediately to newly generated invoices for this branch.
                </p>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-clinic-600 hover:bg-clinic-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  <span>Save Changes</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
