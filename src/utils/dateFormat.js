import dayjs from 'dayjs';

/**
 * Format any ISO date string or timestamp into YYYY-MM-DD HH:mm:ss
 */
export const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    const parsed = dayjs(dateStr);
    return parsed.isValid() ? parsed.format('YYYY-MM-DD HH:mm:ss') : dateStr;
};

/**
 * Format any date string into 12-hour time format (e.g. 05:39 PM)
 */
export const formatTimeOnly = (dateStr) => {
    if (!dateStr) return '';
    const parsed = dayjs(dateStr);
    return parsed.isValid() ? parsed.format('hh:mm A') : dateStr;
};

/**
 * Format any date string into YYYY-MM-DD
 */
export const formatDateOnly = (dateStr) => {
    if (!dateStr) return '';
    const parsed = dayjs(dateStr);
    return parsed.isValid() ? parsed.format('YYYY-MM-DD') : dateStr;
};

/**
 * Clinic shift date helper (Shift ends at 5 AM)
 */
export const formatDateToYMD = (dateObj) => {
    const now = new Date();

    // 🚨 القفل الذكي: لو الساعة حالياً أقل من 5 الفجر، يبقى إحنا لسه تبع شفت "إمبارح"
    if (now.getHours() < 5) {
        now.setDate(now.getDate() - 1); // ارجع باليوم خطوة لورا
    }

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`; // هترجع "2026-07-19" بالرغم من إننا يوم 20 الفجر!
};