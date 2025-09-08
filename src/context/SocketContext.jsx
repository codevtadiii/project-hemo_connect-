import { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      const newSocket = io('http://localhost:5000', {
        auth: {
          token: localStorage.getItem('token'),
          userId: user.id,
        },
      });

      newSocket.on('connect', () => {
        console.log('Connected to socket server');
      });

      newSocket.on('notification', (notification) => {
        setNotifications(prev => [notification, ...prev]);
      });

      newSocket.on('bloodRequest', (request) => {
        if (user.role === 'donor') {
          setNotifications(prev => [{
            id: Date.now(),
            type: 'blood_request',
            title: 'New Blood Request',
            message: `${request.bloodGroup} blood needed at ${request.hospital}`,
            data: request,
            timestamp: new Date(),
          }, ...prev]);
        }
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isAuthenticated, user]);

  const value = {
    socket,
    notifications,
    setNotifications,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};