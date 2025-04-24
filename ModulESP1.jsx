import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ModulESP1 = () => {
    const [sensorData, setSensorData] = useState({
        temperature: 0,
        humidity: 0,
        co2: 0
    });

    // URL-ul către API-ul ESP-ului (va trebui actualizat cu IP-ul real al ESP-ului)
    const ESP_API_URL = 'http://ESP_IP_ADDRESS';

    const fetchSensorData = async () => {
        try {
            const response = await axios.get(`${ESP_API_URL}/sensors`);
            setSensorData(response.data);
        } catch (error) {
            console.error('Eroare la citirea datelor de la senzori:', error);
        }
    };

    useEffect(() => {
        // Citește datele inițial
        fetchSensorData();

        // Setează un interval pentru a citi datele la fiecare 5 secunde
        const interval = setInterval(fetchSensorData, 5000);

        // Cleanup la dezmontarea componentei
        return () => clearInterval(interval);
    }, []);
    
    return
};

export default ModulESP1; 