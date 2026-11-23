import React from 'react';
import { Eye } from 'lucide-react';

export default function EyeRefractionForm({
  refractionData = {},
  onChangeRefraction,
}) {
  const od = refractionData?.od || {};
  const os = refractionData?.os || {};
  const pd = refractionData?.pd || '';

  const handleFieldChange = (eye, field, value) => {
    const updated = {
      ...refractionData,
      [eye]: {
        ...(refractionData[eye] || {}),
        [field]: value,
      },
    };
    onChangeRefraction(updated);
  };

  const handlePdChange = (value) => {
    onChangeRefraction({
      ...refractionData,
      pd: value,
    });
  };

  return (
    <div className="p-4 rounded-xl border border-sky-200 bg-sky-50/40 space-y-3" dir="rtl">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-sky-900 m-0 flex items-center gap-1.5">
          <Eye className="h-4 w-4 text-sky-600 shrink-0" />
          <span>قياس وفحص النظر وانكسار العين (OD / OS Refraction)</span>
        </h4>
        <div className="flex items-center gap-2">
          <label className="text-[11px] font-semibold text-slate-600">المسافة بين البؤبؤين (PD):</label>
          <input
            type="text"
            value={pd}
            onChange={(e) => handlePdChange(e.target.value)}
            placeholder="62 mm"
            className="w-16 px-2 py-1 text-xs border border-sky-300 rounded-lg bg-white text-center font-mono focus:ring-1 focus:ring-sky-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-center border-collapse bg-white rounded-lg overflow-hidden border border-sky-200">
          <thead>
            <tr className="bg-sky-100/70 text-sky-900 font-bold border-b border-sky-200">
              <th className="py-1.5 px-2">العين</th>
              <th className="py-1.5 px-2">SPH (الكرة)</th>
              <th className="py-1.5 px-2">CYL (الأسطوانة)</th>
              <th className="py-1.5 px-2">AXIS (المحور)</th>
              <th className="py-1.5 px-2">VA (حدة الإبصار)</th>
              <th className="py-1.5 px-2">IOP (ضغط العين)</th>
              <th className="py-1.5 px-2">ADD (إضافة القراءة)</th>
            </tr>
          </thead>
          <tbody>
            {/* OD - Right Eye */}
            <tr className="border-b border-sky-100 hover:bg-sky-50/50">
              <td className="py-1.5 px-2 font-bold text-sky-800 bg-sky-50/80">OD (اليمنى)</td>
              <td className="p-1">
                <input
                  type="text"
                  value={od.sph || ''}
                  onChange={(e) => handleFieldChange('od', 'sph', e.target.value)}
                  placeholder="-1.25"
                  className="w-full px-1.5 py-1 text-center font-mono border border-slate-200 rounded focus:border-sky-500"
                />
              </td>
              <td className="p-1">
                <input
                  type="text"
                  value={od.cyl || ''}
                  onChange={(e) => handleFieldChange('od', 'cyl', e.target.value)}
                  placeholder="-0.50"
                  className="w-full px-1.5 py-1 text-center font-mono border border-slate-200 rounded focus:border-sky-500"
                />
              </td>
              <td className="p-1">
                <input
                  type="text"
                  value={od.axis || ''}
                  onChange={(e) => handleFieldChange('od', 'axis', e.target.value)}
                  placeholder="90°"
                  className="w-full px-1.5 py-1 text-center font-mono border border-slate-200 rounded focus:border-sky-500"
                />
              </td>
              <td className="p-1">
                <input
                  type="text"
                  value={od.va || ''}
                  onChange={(e) => handleFieldChange('od', 'va', e.target.value)}
                  placeholder="6/6"
                  className="w-full px-1.5 py-1 text-center font-mono border border-slate-200 rounded focus:border-sky-500"
                />
              </td>
              <td className="p-1">
                <input
                  type="text"
                  value={od.iop || ''}
                  onChange={(e) => handleFieldChange('od', 'iop', e.target.value)}
                  placeholder="15 mmHg"
                  className="w-full px-1.5 py-1 text-center font-mono border border-slate-200 rounded focus:border-sky-500"
                />
              </td>
              <td className="p-1">
                <input
                  type="text"
                  value={od.add || ''}
                  onChange={(e) => handleFieldChange('od', 'add', e.target.value)}
                  placeholder="+1.50"
                  className="w-full px-1.5 py-1 text-center font-mono border border-slate-200 rounded focus:border-sky-500"
                />
              </td>
            </tr>

            {/* OS - Left Eye */}
            <tr className="hover:bg-sky-50/50">
              <td className="py-1.5 px-2 font-bold text-sky-800 bg-sky-50/80">OS (اليسرى)</td>
              <td className="p-1">
                <input
                  type="text"
                  value={os.sph || ''}
                  onChange={(e) => handleFieldChange('os', 'sph', e.target.value)}
                  placeholder="-1.00"
                  className="w-full px-1.5 py-1 text-center font-mono border border-slate-200 rounded focus:border-sky-500"
                />
              </td>
              <td className="p-1">
                <input
                  type="text"
                  value={os.cyl || ''}
                  onChange={(e) => handleFieldChange('os', 'cyl', e.target.value)}
                  placeholder="-0.25"
                  className="w-full px-1.5 py-1 text-center font-mono border border-slate-200 rounded focus:border-sky-500"
                />
              </td>
              <td className="p-1">
                <input
                  type="text"
                  value={os.axis || ''}
                  onChange={(e) => handleFieldChange('os', 'axis', e.target.value)}
                  placeholder="85°"
                  className="w-full px-1.5 py-1 text-center font-mono border border-slate-200 rounded focus:border-sky-500"
                />
              </td>
              <td className="p-1">
                <input
                  type="text"
                  value={os.va || ''}
                  onChange={(e) => handleFieldChange('os', 'va', e.target.value)}
                  placeholder="6/6"
                  className="w-full px-1.5 py-1 text-center font-mono border border-slate-200 rounded focus:border-sky-500"
                />
              </td>
              <td className="p-1">
                <input
                  type="text"
                  value={os.iop || ''}
                  onChange={(e) => handleFieldChange('os', 'iop', e.target.value)}
                  placeholder="16 mmHg"
                  className="w-full px-1.5 py-1 text-center font-mono border border-slate-200 rounded focus:border-sky-500"
                />
              </td>
              <td className="p-1">
                <input
                  type="text"
                  value={os.add || ''}
                  onChange={(e) => handleFieldChange('os', 'add', e.target.value)}
                  placeholder="+1.50"
                  className="w-full px-1.5 py-1 text-center font-mono border border-slate-200 rounded focus:border-sky-500"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
