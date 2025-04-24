import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ModulESP2 = () => {
    const [soilData, setSoilData] = useState({
        soilMoisture: 0,
        pump1Status: false,
        pump2Status: false,
        nutrientPumpStatus: false
    });

    // URL-ul către API-ul ESP-ului (va trebui actualizat cu IP-ul real al ESP-ului)
    const ESP_API_URL = 'http://ESP2_IP_ADDRESS';

    const fetchSoilData = async () => {
        try {
            const response = await axios.get(`${ESP_API_URL}/soil`);
            setSoilData(response.data);
        } catch (error) {
            console.error('Eroare la citirea datelor din sol:', error);
        }
    };

    const togglePump = async (pumpNumber) => {
        try {
            const response = await axios.post(`${ESP_API_URL}/pump${pumpNumber}/toggle`);
            fetchSoilData(); // Actualizează starea după comutarea pompei
        } catch (error) {
            console.error(`Eroare la comutarea pompei ${pumpNumber}:`, error);
        }
    };

    const toggleNutrientPump = async () => {
        try {
            const response = await axios.post(`${ESP_API_URL}/nutrient-pump/toggle`);
            fetchSoilData(); // Actualizează starea după comutarea pompei
        } catch (error) {
            console.error('Eroare la comutarea pompei de nutrienți:', error);
        }
    };

    useEffect(() => {
        // Citește datele inițial
        fetchSoilData();

        // Setează un interval pentru a citi datele la fiecare 5 secunde
        const interval = setInterval(fetchSoilData, 5000);

        // Cleanup la dezmontarea componentei
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="modul-esp2">
            <h2>Modul ESP2 - Control Sol și Irigație</h2>
            <div className="soil-control">
                <div className="sensor-card">
                    <h3>Umiditate Sol</h3>
                    <p>{soilData.soilMoisture}%</p>
                </div>
                <div className="pump-controls">
                    <div className="pump-card">
                        <h3>Pompă 1</h3>
                        <button 
                            onClick={() => togglePump(1)}
                            className={soilData.pump1Status ? 'active' : ''}
                        >
                            {soilData.pump1Status ? 'Oprește' : 'Pornește'}
                        </button>
                    </div>
                    <div className="pump-card">
                        <h3>Pompă 2</h3>
                        <button 
                            onClick={() => togglePump(2)}
                            className={soilData.pump2Status ? 'active' : ''}
                        >
                            {soilData.pump2Status ? 'Oprește' : 'Pornește'}
                        </button>
                    </div>
                    <div className="pump-card">
                        <h3>Pompă Nutrienți</h3>
                        <button 
                            onClick={toggleNutrientPump}
                            className={soilData.nutrientPumpStatus ? 'active' : ''}
                        >
                            {soilData.nutrientPumpStatus ? 'Oprește' : 'Pornește'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModulESP2; 