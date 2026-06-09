'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';

export const useSocket = (roomName?: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    // Initialise Socket connection
    const socketInstance = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:51000',
      {
        withCredentials: true,
        transports: ['polling', 'websocket'], // polling first for shared hosting
      }
    );

    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('📡 Real-time channel established via WebSocket:', socketInstance.id);
      if (roomName) {
        socketInstance.emit('join-room', roomName);
      }
    });

    return () => {
      socketInstance.disconnect();
      console.log('🔌 Real-time WebSocket channel safely disconnected.');
    };
  }, [roomName, token]);

  return socket;
};