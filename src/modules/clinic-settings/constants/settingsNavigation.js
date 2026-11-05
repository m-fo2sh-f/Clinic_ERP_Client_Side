import { Printer, Receipt, Building2, CreditCard } from 'lucide-react';

/**
 * Navigation items for ClinicSettingsLayout tabs.
 * Allows easy future expansion for accounting, branches, and clinic logs.
 */
export const SETTINGS_NAVIGATION_ITEMS = [
  {
    id: 'prescription',
    label: 'قالب وإعدادات الروشتة',
    subLabel: 'تخصيص الهوامش والقوالب والطباعة',
    icon: Printer,
    path: '/settings/prescription',
    badge: 'نشط',
    enabled: true,
  },
  {
    id: 'services',
    label: 'خدمات العيادة والتسعير',
    subLabel: 'قائمة الكشوفات والخدمات والأسعار',
    icon: Receipt,
    path: '/settings/services',
    enabled: true,
  },
  {
    id: 'billing_policy',
    label: 'سياسات الفواتير والضرائب',
    subLabel: 'قيد التطوير للمراكز الطبية',
    icon: CreditCard,
    path: '/settings/billing-policy',
    enabled: false,
    badge: 'قريباً',
  },
  {
    id: 'branches',
    label: 'الفروع والعيادات الشقيقة',
    subLabel: 'إدارة وتوزيع طاقم العمل',
    icon: Building2,
    path: '/settings/branches',
    enabled: false,
    badge: 'قريباً',
  },
];

export default SETTINGS_NAVIGATION_ITEMS;
