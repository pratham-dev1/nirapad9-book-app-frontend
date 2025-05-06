import { io } from 'socket.io-client';
import { SERVER_URL } from '../services/axios';
export const socket = io(SERVER_URL, {
    autoConnect: false,
    withCredentials: true,
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 5000,
});