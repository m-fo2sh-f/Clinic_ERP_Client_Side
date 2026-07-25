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