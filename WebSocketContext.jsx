import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

// Creez contextul pentru WebSocket
const WebSocketContext = createContext(null);

// URL-ul serverului WebSocket
const SOCKET_URL = 'http://localhost:5000';

export function WebSocketProvider({ children }) {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState(null);
    const [sensorData, setSensorData] = useState({});

    // Inițializare socket la încărcarea componentei
    useEffect(() => {
        // Creare conexiune socket
        const socketInstance = io(SOCKET_URL);

        // Configurare evenimente socket
        socketInstance.on('connect', () => {
            console.log('WebSocket conectat!');
            setIsConnected(true);
        });

        socketInstance.on('disconnect', () => {
            console.log('WebSocket deconectat!');
            setIsConnected(false);
        });

        socketInstance.on('initialData', (data) => {
            console.log('Date inițiale primite:', data);
            setLastMessage(data);
        });

        socketInstance.on('sensorData', (data) => {
            console.log('Date de la senzori primite:', data);
            setLastMessage(data);

            // Actualizare date senzori
            if (data.topic && data.message) {
                // Extrage numele modulului din topic (format: esp/module/data)
                const topicParts = data.topic.split('/');
                if (topicParts.length >= 2) {
                    const module = topicParts[1];
                    setSensorData(prevData => ({
                        ...prevData,
                        [module]: {
                            ...prevData[module],
                            ...data.message,
                            lastUpdate: new Date().toISOString()
                        }
                    }));
                }
            }
        });

        // Salvare instanță socket
        setSocket(socketInstance);

        // Curățare la demontarea componentei
        return () => {
            socketInstance.disconnect();
        };
    }, []);

    // Funcție pentru trimiterea comenzilor către server
    const sendCommand = (module, command, value) => {
        if (socket && isConnected) {
            socket.emit('command', { module, command, value });
            return true;
        }
        return false;
    };

    // Valoarea contextului care va fi disponibilă în componente
    const contextValue = {
        socket,
        isConnected,
        lastMessage,
        sensorData,
        sendCommand
    };

    return (
        <WebSocketContext.Provider value={contextValue}>
            {children}
        </WebSocketContext.Provider>
    );
}

// Hook personalizat pentru utilizarea contextului
export function useWebSocket() {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket trebuie utilizat în interiorul WebSocketProvider');
    }
    return context;
}

export default WebSocketContext; 