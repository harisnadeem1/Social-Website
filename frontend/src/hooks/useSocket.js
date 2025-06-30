import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const useSocket = () => {
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_BASE_URL, {
      transports: ['websocket'],
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Connected to socket server:', socket.id);
    });
    socket.on("receiveMessage", (data) => {
  console.log("📥 New real-time message:", data);
  setNewIncomingMessage(data); // store in global/local state
});

    socket.on('disconnect', () => {
      console.log('🔴 Disconnected from socket server');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return socketRef;
};

export default useSocket;
