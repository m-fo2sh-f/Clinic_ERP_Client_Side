import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

// 🎯 استخراج اسم الهوست ديناميكياً لو مش مكتوب في الـ .env
const host = import.meta.env.VITE_REVERB_HOST || window.location.hostname;

const echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: host,
    wsPort: Number(import.meta.env.VITE_REVERB_PORT) || 8080,
    wssPort: Number(import.meta.env.VITE_REVERB_PORT) || 8080,
    forceTLS: false,
    enabledTransports: ['ws'],
    disableStats: true,
});

export default echo;