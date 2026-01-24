import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import socket, { authenticateSocket, disconnectSocket } from '../services/socket';

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const { token, isAuthenticated } = useAuth();
    const [onlineUsers, setOnlineUsers] = useState(new Set());

    useEffect(() => {
        if (isAuthenticated && token) {
            authenticateSocket(token);

            const handleOnlineUsers = (users) => {
                setOnlineUsers(new Set(users));
            };

            const handleUserConnected = (userId) => {
                setOnlineUsers(prev => {
                    const newSet = new Set(prev);
                    newSet.add(userId);
                    return newSet;
                });
            };

            const handleUserDisconnected = (userId) => {
                setOnlineUsers(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(userId);
                    return newSet;
                });
            };

            socket.on('online_users', handleOnlineUsers);
            socket.on('user_connected', handleUserConnected);
            socket.on('user_disconnected', handleUserDisconnected);

            return () => {
                socket.off('online_users', handleOnlineUsers);
                socket.off('user_connected', handleUserConnected);
                socket.off('user_disconnected', handleUserDisconnected);
            };
        } else {
            disconnectSocket();
        }

        return () => {
            // Optional: disconnect on unmount? 
            // Often better to keep connected if navigating mostly within app, 
            // but for clean cleanup disconnect is fine.
            // disconnectSocket(); 
        };
    }, [isAuthenticated, token]);

    return (
        <SocketContext.Provider value={{ socket, onlineUsers }}>
            {children}
        </SocketContext.Provider>
    );
};
