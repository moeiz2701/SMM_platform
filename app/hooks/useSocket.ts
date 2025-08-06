import { useEffect, useRef, useState, useCallback } from 'react';
import io from 'socket.io-client';

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export function useSocket(token) {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    // Initialize socket connection
    socketRef.current = io(SOCKET_SERVER_URL, {
      auth: { token }
    });

    // Connection event handlers
    socketRef.current.on('connect', () => {
      setConnected(true);
      setError(null);
    });

    socketRef.current.on('connect_error', (err) => {
      setConnected(false);
      setError(err.message);
    });

    socketRef.current.on('disconnect', () => {
      setConnected(false);
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [token]);

  const sendMessage = useCallback((recipientId, content) => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current?.connected) {
        reject(new Error('Not connected'));
        return;
      }

      socketRef.current.emit('private_message', { recipientId, content });

      const handleMessageSent = (message) => {
        socketRef.current.off('message_sent', handleMessageSent);
        socketRef.current.off('message_error', handleError);
        resolve(message);
      };

      const handleError = (error) => {
        socketRef.current.off('message_sent', handleMessageSent);
        socketRef.current.off('message_error', handleError);
        reject(new Error(error));
      };

      socketRef.current.on('message_sent', handleMessageSent);
      socketRef.current.on('message_error', handleError);
    });
  }, []);

  const onNewMessage = useCallback((callback) => {
    if (socketRef.current) {
      socketRef.current.on('new_message', callback);
    }
  }, []);

  const markAsRead = useCallback((messageId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('mark_read', messageId);
    }
  }, []);

  const emitTyping = useCallback((recipientId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('typing', recipientId);
    }
  }, []);

  const emitStopTyping = useCallback((recipientId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('stop_typing', recipientId);
    }
  }, []);

  const onTyping = useCallback((callback) => {
    if (socketRef.current) {
      socketRef.current.on('user_typing', callback);
    }
  }, []);

  const onStopTyping = useCallback((callback) => {
    if (socketRef.current) {
      socketRef.current.on('user_stop_typing', callback);
    }
  }, []);

  return {
    connected,
    error,
    sendMessage,
    onNewMessage,
    markAsRead,
    emitTyping,
    emitStopTyping,
    onTyping,
    onStopTyping
  };
}
