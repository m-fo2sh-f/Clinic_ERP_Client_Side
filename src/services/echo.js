import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import api from './api';

window.Pusher = Pusher;

const host = import.meta.env.VITE_REVERB_HOST || window.location.hostname;
const port = Number(import.meta.env.VITE_REVERB_PORT) || 8085;
const hostname = window.location.hostname;

// dynamic authEndpoint pointing explicitly to Laravel backend (port 8000)
const authEndpoint = hostname && hostname !== 'localhost' && hostname !== '127.0.0.1'
    ? `http://${hostname}:8000/broadcasting/auth`
    : `http://localhost:8000/broadcasting/auth`;

const echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: host,
    wsPort: port,
    wssPort: port,
    forceTLS: false,
    enabledTransports: ['ws'],
    disableStats: true,
    authEndpoint: authEndpoint,
    authorizer: (channel, options) => {
        return {
            authorize: (socketId, callback) => {
                const payload = {
                    socket_id: socketId,
                    channel_name: channel.name
                };

                // Try /api/v1/broadcasting/auth first (CSRF-exempt and API scoped), fallback to /broadcasting/auth
                api.post('/broadcasting/auth', payload)
                    .then(response => {
                        callback(false, response.data);
                    })
                    .catch(error => {
                        if (error.response?.status === 404) {
                            return api.post(authEndpoint, payload)
                                .then(response => callback(false, response.data))
                                .catch(fallbackErr => {
                                    console.error('WebSocket broadcasting auth error (fallback):', fallbackErr);
                                    callback(true, fallbackErr);
                                });
                        }
                        console.error('WebSocket broadcasting auth error:', error);
                        callback(true, error);
                    });
            }
        };
    }
});

export default echo;