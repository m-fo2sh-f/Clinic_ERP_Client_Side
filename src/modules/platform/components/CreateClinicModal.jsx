import React, { useState, useEffect } from 'react';
import {
  Building2,
  Globe,
  Mail,
  User,
  Lock,
  Phone,
  Eye,
  EyeOff,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '../../../components/ui/Dialog';
import Button from '../../../components/ui/Button';
import { useCreateTenant } from '../hooks/usePlatformTenants';

// Generate clean URL slug from clinic name
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

// Generate random secure temporary password
const generatePassword = () => {
  const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*';
  let pwd = '';
  for (let i = 0; i < 12; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pwd;
};

export default function CreateClinicModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    clinic_name: '',
    subdomain: '',
    admin_name: '',
    admin_email: '',
    admin_password: '',
    phone: '',
  });

  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [createdTenant, setCreatedTenant] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  const { mutate: createTenant, isPending } = useCreateTenant();

  // Reset form on open/close
  useEffect(() => {
    if (isOpen) {
      setFormData({
        clinic_name: '',
        subdomain: '',
        admin_name: '',
        admin_email: '',
        admin_password: generatePassword(),
        phone: '',
      });
      setIsSlugManuallyEdited(false);
      setShowPassword(false);
      setErrorMsg(null);
      setFieldErrors({});
      setCreatedTenant(null);
      setCopiedField(null);
    }
  }, [isOpen]);

  // Handle Clinic Name changes & auto-slugify
  const handleClinicNameChange = (e) => {
    const val = e.target.value;
    setFormData((prev) => {
      const next = { ...prev, clinic_name: val };
      if (!isSlugManuallyEdited) {
        next.subdomain = slugify(val);
      }
      return next;
    });
    if (fieldErrors.clinic_name) {
      setFieldErrors((prev) => ({ ...prev, clinic_name: null }));
    }
  };

  const handleSubdomainChange = (e) => {
    setIsSlugManuallyEdited(true);
    const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setFormData((prev) => ({ ...prev, subdomain: val }));
    if (fieldErrors.subdomain) {
      setFieldErrors((prev) => ({ ...prev, subdomain: null }));
    }
  };

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setFieldErrors({});

    // Client-side quick validations
    const errors = {};
    if (!formData.clinic_name.trim()) errors.clinic_name = 'اسم العيادة مطلوب (Clinic name is required)';
    if (!formData.subdomain.trim() || formData.subdomain.length < 3) {
      errors.subdomain = 'الدومين الفرعي يجب ألا يقل عن 3 أحرف (Subdomain min 3 chars)';
    }
    if (!formData.admin_name.trim()) errors.admin_name = 'اسم المدير مطلوب (Admin name is required)';
    if (!formData.admin_email.trim()) errors.admin_email = 'البريد الإلكتروني مطلوب (Admin email is required)';
    if (!formData.admin_password || formData.admin_password.length < 8) {
      errors.admin_password = 'كلمة المرور يجب ألا تقل عن 8 أحرف (Password min 8 chars)';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    createTenant(formData, {
      onSuccess: (res) => {
        setCreatedTenant(res?.data || {
          clinic_name: formData.clinic_name,
          subdomain: formData.subdomain,
          domain: `${formData.subdomain}.localhost`,
          url: `http://${formData.subdomain}.localhost:5173`,
          owner_email: formData.admin_email,
        });
      },
      onError: (err) => {
        const responseData = err.response?.data;
        if (responseData?.errors) {
          setFieldErrors(responseData.errors);
        }
        setErrorMsg(
          responseData?.message ||
          'Failed to provision tenant clinic. Please verify inputs and database connection.'
        );
      },
    });
  };

  if (!isOpen) return null;

  const previewDomain = formData.subdomain
    ? `${formData.subdomain}.localhost:5173`
    : '[subdomain].localhost:5173';

  return (
    <Dialog isOpen={isOpen} onClose={isPending ? () => {} : onClose}>
      <DialogClose onClick={isPending ? () => {} : onClose} />

      {createdTenant ? (
        /* ================= SUCCESS STATE ================= */
        <div className="space-y-6 py-2">
          <div className="text-center space-y-2">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shadow-xs">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <DialogTitle className="text-xl font-bold text-slate-900">
              تم إنشاء العيادة وقاعدة البيانات بنجاح! 🎉
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-600">
              Isolated MySQL database, schema migrations, roles, and administrator account have been provisioned.
            </DialogDescription>
          </div>

          {/* Details Card */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">اسم العيادة (Clinic):</span>
              <strong className="text-slate-900">{createdTenant.clinic_name}</strong>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">قاعدة البيانات المعزولة:</span>
              <span className="font-mono text-clinic-700 font-bold">
                tenant_{createdTenant.subdomain || createdTenant.id}
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">الرابط الفرعي (Domain):</span>
              <span className="font-mono text-clinic-700 font-bold flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-slate-400" />
                {createdTenant.domain}
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium">حساب المدير (Admin Email):</span>
              <span className="font-mono text-slate-800 flex items-center gap-2">
                {createdTenant.owner_email}
                <button
                  type="button"
                  onClick={() => handleCopy(createdTenant.owner_email, 'email')}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {copiedField === 'email' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">كلمة المرور المؤقتة:</span>
              <span className="font-mono text-slate-800 flex items-center gap-2 bg-white px-2 py-0.5 rounded border border-slate-200">
                {formData.admin_password}
                <button
                  type="button"
                  onClick={() => handleCopy(formData.admin_password, 'pwd')}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {copiedField === 'pwd' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </span>
            </div>
          </div>

          {/* Action Link Button */}
          <div className="space-y-2">
            <a
              href={createdTenant.url || `http://${createdTenant.domain}:5173`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-clinic-600 hover:bg-clinic-700 text-white font-bold rounded-xl shadow-md transition-all text-sm group cursor-pointer"
            >
              <span>فتح لوحة تحكم العيادة مباشرة (Launch Clinic Workspace)</span>
              <ExternalLink className="h-4 w-4 group-hover:translate-x-0.5 -translate-y-0.5 transition-transform" />
            </a>

            <Button
              variant="outline"
              onClick={onClose}
              className="w-full text-xs font-semibold"
            >
              تم وإغلاق (Done)
            </Button>
          </div>
        </div>
      ) : (
        /* ================= FORM INPUT STATE ================= */
        <form onSubmit={handleSubmit} className="space-y-4 my-1">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-clinic-50 border border-clinic-200 text-clinic-600 flex items-center justify-center shrink-0">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-slate-900 text-base font-bold flex items-center gap-2">
                  <span>إضافة عيادة جديدة (Provision New Tenant)</span>
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 mt-0.5">
                  Automated Database-per-Tenant provisioning with isolated schema and custom subdomain.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* General Error Notice */}
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">خطأ في إنشاء العيادة:</strong>
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          {/* Pipeline Loading Overlay / Banner */}
          {isPending && (
            <div className="p-4 rounded-xl bg-clinic-50/80 border border-clinic-200 text-clinic-900 text-xs space-y-2">
              <div className="flex items-center gap-2.5 font-bold text-clinic-800">
                <Loader2 className="h-4 w-4 text-clinic-600 animate-spin" />
                <span>جاري تهيئة العيادة وإنشاء قاعدة البيانات المعزولة...</span>
              </div>
              <ul className="text-[11px] text-clinic-700/80 space-y-1 pl-6 list-disc">
                <li>إنشاء قاعدة البيانات الخاصة <code className="font-mono font-bold">tenant_{formData.subdomain || 'id'}</code></li>
                <li>ترحيل جداول النظام التشغيلي (17 migration tables)</li>
                <li>زرع الصلاحيات والرتب وإنشاء الحساب الإداري الرئيسي</li>
              </ul>
            </div>
          )}

          <div className="space-y-3.5 text-xs">
            {/* Clinic Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                اسم العيادة (Clinic Name) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  disabled={isPending}
                  value={formData.clinic_name}
                  onChange={handleClinicNameChange}
                  placeholder="مثال: عيادة النور التخصصية / Al Noor Medical Center"
                  className={`w-full pl-9 pr-3 py-2 bg-white border rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-clinic-500 transition-all ${
                    fieldErrors.clinic_name ? 'border-rose-400' : 'border-slate-200'
                  }`}
                />
              </div>
              {fieldErrors.clinic_name && (
                <p className="text-[11px] text-rose-500 mt-1 font-medium">{fieldErrors.clinic_name}</p>
              )}
            </div>

            {/* Subdomain + Live Preview */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  الدومين الفرعي (Subdomain) <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] text-slate-400">حروف إنجليزية وأرقام وشرطات فقط</span>
              </div>
              <div className="relative">
                <Globe className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  disabled={isPending}
                  value={formData.subdomain}
                  onChange={handleSubdomainChange}
                  placeholder="alnoor"
                  className={`w-full pl-9 pr-24 py-2 bg-white border rounded-lg font-mono text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-clinic-500 transition-all ${
                    fieldErrors.subdomain ? 'border-rose-400' : 'border-slate-200'
                  }`}
                />
                <span className="absolute right-3 top-2.5 text-[11px] font-mono text-slate-400 pointer-events-none">
                  .localhost
                </span>
              </div>
              {fieldErrors.subdomain && (
                <p className="text-[11px] text-rose-500 mt-1 font-medium">{fieldErrors.subdomain}</p>
              )}

              {/* Live Preview Badge */}
              <div className="mt-1.5 p-2 bg-slate-50 border border-slate-200/80 rounded-lg flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium">رابط العيادة المباشر:</span>
                <span className="font-mono font-bold text-clinic-700 flex items-center gap-1">
                  <span>http://${previewDomain}</span>
                </span>
              </div>
            </div>

            {/* Admin Name & Phone Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اسم مدير العيادة (Admin Name) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    disabled={isPending}
                    value={formData.admin_name}
                    onChange={(e) => handleChange('admin_name', e.target.value)}
                    placeholder="د. أحمد منصور"
                    className={`w-full pl-9 pr-3 py-2 bg-white border rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-clinic-500 transition-all ${
                      fieldErrors.admin_name ? 'border-rose-400' : 'border-slate-200'
                    }`}
                  />
                </div>
                {fieldErrors.admin_name && (
                  <p className="text-[11px] text-rose-500 mt-1 font-medium">{fieldErrors.admin_name}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  رقم الهاتف (Phone)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    disabled={isPending}
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="01012345678"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-clinic-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Email & Password Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  البريد الإلكتروني (Admin Email) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    disabled={isPending}
                    value={formData.admin_email}
                    onChange={(e) => handleChange('admin_email', e.target.value)}
                    placeholder="admin@alnoor.com"
                    className={`w-full pl-9 pr-3 py-2 bg-white border rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-clinic-500 transition-all ${
                      fieldErrors.admin_email ? 'border-rose-400' : 'border-slate-200'
                    }`}
                  />
                </div>
                {fieldErrors.admin_email && (
                  <p className="text-[11px] text-rose-500 mt-1 font-medium">{fieldErrors.admin_email}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    كلمة المرور المؤقتة <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleChange('admin_password', generatePassword())}
                    disabled={isPending}
                    className="text-[10px] text-clinic-600 hover:text-clinic-800 font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="h-2.5 w-2.5" />
                    توليد تلقائي
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    disabled={isPending}
                    value={formData.admin_password}
                    onChange={(e) => handleChange('admin_password', e.target.value)}
                    className={`w-full pl-9 pr-9 py-2 bg-white border rounded-lg font-mono text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-clinic-500 transition-all ${
                      fieldErrors.admin_password ? 'border-rose-400' : 'border-slate-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {fieldErrors.admin_password && (
                  <p className="text-[11px] text-rose-500 mt-1 font-medium">{fieldErrors.admin_password}</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="text-xs font-semibold"
            >
              إلغاء (Cancel)
            </Button>
            <Button
              variant="default"
              type="submit"
              isLoading={isPending}
              loadingText="جاري إنشاء العيادة والداتابيز..."
              leftIcon={<Sparkles className="h-4 w-4 shrink-0" />}
              className="bg-clinic-600 hover:bg-clinic-700 text-white text-xs font-bold shadow-sm"
            >
              تأكيد وإنشاء العيادة (Provision Clinic)
            </Button>
          </DialogFooter>
        </form>
      )}
    </Dialog>
  );
}
