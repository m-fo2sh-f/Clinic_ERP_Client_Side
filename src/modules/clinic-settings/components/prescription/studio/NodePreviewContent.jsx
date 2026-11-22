import React from 'react';
import { VectorQrCode } from '../../../../clinical/templates/TemplateHelpers';
import { SAMPLE_STUDIO_DATA, FONT_SIZE_CLASSES, getNodeMetadata } from './canvasNodeDefinitions';

const getVitalDisplay = (key, rawVitals, fallbackObj, showUnit) => {
  const v = rawVitals || {};
  let val = '';
  let unit = '';
  let label = '';

  switch (key) {
    case 'blood_pressure':
    case 'bp':
      val = v.blood_pressure || v.bloodPressure || (v.bp_systolic && `${v.bp_systolic}/${v.bp_diastolic}`) || fallbackObj.bp;
      unit = 'mmHg';
      label = 'الضغط';
      break;
    case 'heart_rate':
    case 'hr':
    case 'pulse':
      val = v.heart_rate || v.heartRate || v.pulse || fallbackObj.hr;
      unit = 'bpm';
      label = 'النبض';
      break;
    case 'temperature':
    case 'temp':
      val = v.temperature || v.temp || fallbackObj.temp;
      unit = '°C';
      label = 'الحرارة';
      break;
    case 'blood_glucose':
    case 'blood_sugar':
    case 'randomBloodSugar':
    case 'sugar':
      val = v.blood_glucose || v.blood_sugar || v.randomBloodSugar || fallbackObj.sugar;
      unit = 'mg/dL';
      label = 'السكر';
      break;
    case 'weight':
      val = v.weight || '78';
      unit = 'kg';
      label = 'الوزن';
      break;
    case 'height':
      val = v.height || '175';
      unit = 'cm';
      label = 'الطول';
      break;
    case 'spo2':
      val = v.spo2 || '99';
      unit = '%';
      label = 'الأكسجين';
      break;
    default: {
      val = v[key] || '';
      const meta = getNodeMetadata(key);
      unit = meta?.unit || '';
      label = meta?.label || key;
      break;
    }
  }

  return { val, unit: showUnit ? unit : '', label };
};

export default function NodePreviewContent({ nodeId, node, data = null, isPrint = false }) {
  const showLabel = node?.show_label !== false;
  const fontSizeClass = FONT_SIZE_CLASSES[node?.font_size] || FONT_SIZE_CLASSES.sm;
  const textColor = isPrint ? 'text-black' : 'text-slate-800';
  const s = SAMPLE_STUDIO_DATA;

  switch (nodeId) {
    case 'patient_unified': {
      const patientName = data?.patient?.name || data?.patient?.full_name || s.patient.name;
      const patientAge = data?.patient?.age
        ? `${data.patient.age}${String(data.patient.age).includes('سنة') ? '' : ' سنة'}${data?.patient?.gender ? ` / ${data.patient.gender === 'female' ? 'أنثى' : 'ذكر'}` : ''}`
        : s.patient.age;
      const rxDate = data?.encounter?.date || data?.encounter?.created_at?.slice(0, 10) || s.patient.date;
      const rxCode = data?.encounter?.prescription_code || data?.encounter?.serial_no || s.patient.rxCode;

      return (
        <div className={`w-full h-full flex items-center justify-between gap-2 px-2 py-1 ${textColor} ${fontSizeClass}`}>
          <div>{showLabel && <span className="font-bold opacity-75">المريض: </span>}<span>{patientName}</span></div>
          <div>{showLabel && <span className="font-bold opacity-75">السن: </span>}<span>{patientAge}</span></div>
          <div>{showLabel && <span className="font-bold opacity-75">التاريخ: </span>}<span className="font-mono">{rxDate}</span></div>
          <div>{showLabel && <span className="font-bold opacity-75">الكود: </span>}<span className="font-mono font-bold">{rxCode}</span></div>
        </div>
      );
    }

    case 'patient_name':
      return (
        <div className={`w-full h-full flex items-center px-1.5 py-0.5 ${textColor} ${fontSizeClass}`}>
          {showLabel && <span className="font-bold opacity-75 ml-1">المريض:</span>}
          <span className="font-semibold truncate">{data?.patient?.name || data?.patient?.full_name || s.patient.name}</span>
        </div>
      );

    case 'patient_age':
      return (
        <div className={`w-full h-full flex items-center px-1.5 py-0.5 ${textColor} ${fontSizeClass}`}>
          {showLabel && <span className="font-bold opacity-75 ml-1">السن:</span>}
          <span>{data?.patient?.age || s.patient.age}</span>
        </div>
      );

    case 'patient_date':
      return (
        <div className={`w-full h-full flex items-center px-1.5 py-0.5 font-mono ${textColor} ${fontSizeClass}`}>
          {showLabel && <span className="font-bold opacity-75 font-sans ml-1">التاريخ:</span>}
          <span>{data?.encounter?.date || data?.encounter?.created_at?.slice(0, 10) || s.patient.date}</span>
        </div>
      );

    case 'patient_rx_code':
      return (
        <div className={`w-full h-full flex items-center px-1.5 py-0.5 font-mono font-bold ${textColor} ${fontSizeClass}`}>
          {showLabel && <span className="font-bold opacity-75 font-sans ml-1">الكود:</span>}
          <span>{data?.encounter?.prescription_code || data?.encounter?.serial_no || s.patient.rxCode}</span>
        </div>
      );

    case 'patient_phone':
      return (
        <div className={`w-full h-full flex items-center px-1.5 py-0.5 font-mono ${textColor} ${fontSizeClass}`}>
          {showLabel && <span className="font-bold opacity-75 font-sans ml-1">الهاتف:</span>}
          <span>{data?.patient?.phone || s.patient.phone}</span>
        </div>
      );

    case 'vitals_block': {
      const showUnit = node?.show_unit !== false;
      const bp = getVitalDisplay('blood_pressure', data?.vitals, s.vitals, showUnit);
      const hr = getVitalDisplay('heart_rate', data?.vitals, s.vitals, showUnit);
      const temp = getVitalDisplay('temperature', data?.vitals, s.vitals, showUnit);
      const sugar = getVitalDisplay('blood_glucose', data?.vitals, s.vitals, showUnit);

      return (
        <div className={`w-full h-full flex flex-col justify-center px-1.5 py-0.5 ${fontSizeClass} ${textColor}`}>
          {showLabel && <div className={`font-bold ${isPrint ? 'text-black' : 'text-slate-600'} text-[9px] mb-0.5`}>العلامات الحيوية:</div>}
          <div className="flex flex-col items-start text-nowrap  gap-x-2.5 gap-y-0.5 text-[10.5px]">
            {bp.val && <span><strong>{bp.label}:</strong> <span dir="ltr">{bp.val}</span>{bp.unit && <span className="text-[9px] mr-0.5">{bp.unit}</span>}</span>}
            {hr.val && <span><strong>{hr.label}:</strong> <span dir="ltr">{hr.val}</span>{hr.unit && <span className="text-[9px] mr-0.5">{hr.unit}</span>}</span>}
            {temp.val && <span><strong>{temp.label}:</strong> <span dir="ltr">{temp.val}</span>{temp.unit && <span className="text-[9px] mr-0.5">{temp.unit}</span>}</span>}
            {sugar.val && <span><strong>{sugar.label}:</strong> <span dir="ltr">{sugar.val}</span>{sugar.unit && <span className="text-[9px] mr-0.5">{sugar.unit}</span>}</span>}
          </div>
        </div>
      );
    }

    case 'diagnosis_block': {
      const diagList = (data?.diagnoses && data.diagnoses.length > 0)
        ? data.diagnoses.map((d) => (typeof d === 'string' ? d : d.name || d.description || ''))
        : [s.diagnosis];
      return (
        <div className={`w-full h-full flex flex-col justify-center px-1.5 py-0.5 ${textColor} ${fontSizeClass}`}>
          {showLabel && <div className="font-bold text-[9.5px] mb-0.5">التشخيص الطبي:</div>}
          <div className="font-semibold ">{diagList.join(' ، ')}</div>
        </div>
      );
    }

    case 'refraction_block': {
      const refr = data?.visionData?.od ? data.visionData : data?.vitals?.refraction;
      return (
        <div className={`w-full h-full flex flex-col justify-center px-1.5 py-0.5 ${textColor} ${fontSizeClass}`}>
          {showLabel && <div className="font-bold text-[9.5px] mb-0.5">قياسات النظر (Refraction):</div>}
          {refr?.od ? (
            <div className="text-[10px] font-mono border border-black/25 p-1 rounded" dir="ltr">
              <div>OD: SPH {refr.od.sph || '-'} | CYL {refr.od.cyl || '-'} | AXIS {refr.od.axis || '-'}</div>
              <div>OS: SPH {refr.os?.sph || '-'} | CYL {refr.os?.cyl || '-'} | AXIS {refr.os?.axis || '-'}</div>
            </div>
          ) : (
            <div className="font-mono text-xs truncate" dir="ltr">{s.refraction}</div>
          )}
        </div>
      );
    }

    case 'medications_block': {
      const meds = (data?.medications && data.medications.length > 0) ? data.medications : s.medications;
      return (
        <div className={`w-full h-full flex flex-col p-1.5 ${textColor} ${fontSizeClass}`}>
          <div className="flex items-center gap-1.5 pb-0.5 mb-1 border-b border-black/20 shrink-0">
            <span className="text-sm font-serif font-black text-black">℞</span>
            {showLabel && <span className="font-bold text-xs">الأدوية والجرعات:</span>}
          </div>
          <div className="space-y-1 overflow-hidden">
            {meds.map((m, idx) => (
              <div key={m.id || idx} className="leading-tight">
                <div className="font-bold text-xs text-left font-mono" dir="ltr">{idx + 1} - {m.name || m.drug_name}</div>
                <div className="text-[10.5px] font-medium text-right pr-2">{m.dosage || m.dose || m.instructions || 'قرص بعد الأكل'}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'advice_block': {
      const adv = data?.advice || s.advice;
      const followUp = data?.followUpDate || '';
      return (
        <div className={`w-full h-full flex flex-col justify-center px-1.5 py-0.5 ${textColor} ${fontSizeClass}`}>
          {showLabel && <div className="font-bold text-[9.5px] mb-0.5">إرشادات الطبيب والمتابعة:</div>}
          <p className="m-0 leading-tight line-clamp-2">{adv}</p>
          {followUp && <div className="text-[10px] font-semibold mt-0.5">الاستشارة القادمة: {followUp}</div>}
        </div>
      );
    }

    case 'qr_block': {
      const rxCode = data?.encounter?.prescription_code || data?.encounter?.serial_no || s.patient.rxCode;
      const qrUrl = data?.qrUrl || `https://verify.clinic/rx/${rxCode}`;
      const docName = data?.doctor?.name;
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-0.5 text-center">
          <VectorQrCode value={qrUrl} size={38} color="#000000" />
          {showLabel && <span className="text-[7.5px] font-mono font-bold mt-0.5">QR-VERIFIED</span>}
          {docName && <span className="text-[8px] font-bold mt-0.5 truncate max-w-full">د. {docName}</span>}
        </div>
      );
    }

    default: {
      const showUnit = node?.show_unit !== false;
      const item = getVitalDisplay(nodeId, data?.vitals, s.vitals, showUnit);
      const label = node?.label || item.label;
      const unit = node?.unit || item.unit;

      return (
        <div className={`w-full h-full flex items-center px-1 py-0.5 overflow-hidden ${fontSizeClass} ${textColor}`}>
          {showLabel && <span className={`font-bold ${isPrint ? 'text-black' : 'text-slate-600'} ml-1 shrink-0`}>{label}:</span>}
          <span className="font-semibold font-mono truncate" dir="ltr">{item.val}</span>
          {unit && <span className="text-[9px] mr-1 shrink-0 font-sans" dir="ltr">{unit}</span>}
        </div>
      );
    }
  }
}
