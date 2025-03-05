import { useState, useEffect } from 'react';
import '../App.css';

function Monitoring() {
    const [selectedParameter, setSelectedParameter] = useState('temperature');
    const [timeRange, setTimeRange] = useState('24h');
    
    // Simulăm date pentru grafice
    const [chartData] = useState({
        temperature: {
            current: 25.4,
            min: 20,
            max: 30,
            alert: false,
            history: generateHistoryData(20, 30, 24),
            unit: '°C',
            name: 'Temperatură'
        },
        humidity: {
            current: 65,
            min: 60,
            max: 80,
            alert: false,
            history: generateHistoryData(60, 80, 24),
            unit: '%',
            name: 'Umiditate Aer'
        },
        soilMoisture: {
            current: 78,
            min: 65,
            max: 85,
            alert: false,
            history: generateHistoryData(65, 85, 24),
            unit: '%',
            name: 'Umiditate Sol'
        },
        co2: {
            current: 450,
            min: 400,
            max: 1000,
            alert: false,
            history: generateHistoryData(400, 1000, 24),
            unit: 'ppm',
            name: 'Nivel CO₂'
        }
    });

    // Calculăm statistici
    const currentData = chartData[selectedParameter];
    const average = calculateAverage(currentData.history);
    const trend = calculateTrend(currentData.history);

    return (
        <div className="monitoring">
            <div className="monitoring-header">
                <h2>Monitorizare în Timp Real</h2>
                <div className="monitoring-controls">
                    <div className="control-group">
                        <label>Parametru:</label>
                        <select 
                            value={selectedParameter}
                            onChange={(e) => setSelectedParameter(e.target.value)}
                        >
                            <option value="temperature">Temperatură</option>
                            <option value="humidity">Umiditate Aer</option>
                            <option value="soilMoisture">Umiditate Sol</option>
                            <option value="co2">Nivel CO₂</option>
                        </select>
                    </div>

                    <div className="control-group">
                        <label>Interval:</label>
                        <select 
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                        >
                            <option value="1h">Ultima oră</option>
                            <option value="24h">Ultimele 24 ore</option>
                            <option value="7d">Ultima săptămână</option>
                            <option value="30d">Ultima lună</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="monitoring-content">
                <div className="chart-container card">
                    <div className="chart-header">
                        <div className="chart-title">
                            <h3>{currentData.name}</h3>
                            <span className="current-value">
                                Valoare curentă: <strong>{currentData.current}{currentData.unit}</strong>
                            </span>
                        </div>
                        <div className="chart-actions">
                            <button className="btn">Export Date</button>
                            <button className="btn">Setări Grafic</button>
                        </div>
                    </div>

                    <div className="chart-area">
                        <div className="chart-grid">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="grid-line">
                                    <span className="grid-label">
                                        {Math.round(currentData.max - (i * ((currentData.max - currentData.min) / 4)))}{currentData.unit}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="chart-data">
                            {currentData.history.map((value, index) => (
                                <div 
                                    key={index} 
                                    className="data-bar"
                                    style={{
                                        height: `${((value - currentData.min) / (currentData.max - currentData.min)) * 100}%`,
                                        backgroundColor: getBarColor(value, currentData.min, currentData.max)
                                    }}
                                >
                                    <span className="data-tooltip">{value}{currentData.unit}</span>
                                </div>
                            ))}
                        </div>
                        <div className="chart-labels">
                            {generateTimeLabels(timeRange).map((label, index) => (
                                <div key={index} className="time-label">{label}</div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-header">
                            <span className="stat-icon">📊</span>
                            <span className="stat-label">Medie</span>
                        </div>
                        <div className="stat-value">{average.toFixed(1)}{currentData.unit}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-header">
                            <span className="stat-icon">⬆️</span>
                            <span className="stat-label">Maxim</span>
                        </div>
                        <div className="stat-value">{Math.max(...currentData.history).toFixed(1)}{currentData.unit}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-header">
                            <span className="stat-icon">⬇️</span>
                            <span className="stat-label">Minim</span>
                        </div>
                        <div className="stat-value">{Math.min(...currentData.history).toFixed(1)}{currentData.unit}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-header">
                            <span className="stat-icon">{getTrendIcon(trend)}</span>
                            <span className="stat-label">Tendință</span>
                        </div>
                        <div className="stat-value">{getTrendLabel(trend)}</div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .monitoring {
                    padding: 2rem;
                    width: 100%;
                    min-height: 100vh;
                    margin: 0;
                    background: #f8fafc;
                }

                .monitoring-header {
                    margin-bottom: 2rem;
                    width: 100%;
                }

                .monitoring-header h2 {
                    color: #1e4d40;
                    font-size: 2.5rem;
                    margin-bottom: 1.5rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 2px solid #e2e8f0;
                }

                .monitoring-controls {
                    display: flex;
                    gap: 2rem;
                    flex-wrap: wrap;
                    padding: 1rem;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
                }

                .control-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    min-width: 250px;
                }

                .control-group label {
                    font-weight: 600;
                    color: #2d3748;
                    font-size: 1.1rem;
                }

                .control-group select {
                    padding: 1rem;
                    border-radius: 8px;
                    border: 2px solid #e2e8f0;
                    background: white;
                    min-width: 250px;
                    font-size: 1.1rem;
                    color: #2d3748;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .control-group select:hover {
                    border-color: #2c7a7b;
                }

                .monitoring-content {
                    display: grid;
                    gap: 2rem;
                    width: 100%;
                }

                .chart-container {
                    background: white;
                    border-radius: 12px;
                    padding: 2rem;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
                    width: 100%;
                }

                .chart-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid #e2e8f0;
                }

                .chart-title h3 {
                    margin: 0;
                    color: #2d3748;
                    font-size: 1.8rem;
                    margin-bottom: 0.5rem;
                }

                .current-value {
                    color: #718096;
                    font-size: 1.2rem;
                }

                .current-value strong {
                    color: #2c7a7b;
                    font-weight: 600;
                    font-size: 1.3rem;
                }

                .chart-actions {
                    display: flex;
                    gap: 1rem;
                }

                .chart-area {
                    position: relative;
                    height: 60vh;
                    margin: 2rem 0;
                    padding: 1rem 2rem 2rem;
                    background: #f8fafc;
                    border-radius: 8px;
                }

                .chart-grid {
                    position: absolute;
                    top: 1rem;
                    left: 3rem;
                    right: 2rem;
                    bottom: 2rem;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                }

                .grid-line {
                    width: 100%;
                    border-bottom: 1px dashed #e2e8f0;
                    position: relative;
                }

                .grid-label {
                    position: absolute;
                    left: -3.5rem;
                    top: -0.5rem;
                    font-size: 0.9rem;
                    color: #4a5568;
                    font-weight: 500;
                }

                .chart-data {
                    position: absolute;
                    left: 3rem;
                    right: 2rem;
                    bottom: 2rem;
                    top: 1rem;
                    display: flex;
                    align-items: flex-end;
                    gap: 0.5rem;
                }

                .data-bar {
                    flex: 1;
                    background: #2c7a7b;
                    border-radius: 4px 4px 0 0;
                    transition: all 0.3s ease;
                    position: relative;
                    cursor: pointer;
                }

                .data-bar:hover {
                    opacity: 0.9;
                    transform: scaleY(1.02);
                }

                .data-tooltip {
                    position: absolute;
                    top: -30px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: #2d3748;
                    color: white;
                    padding: 0.5rem 0.75rem;
                    border-radius: 6px;
                    font-size: 0.9rem;
                    font-weight: 500;
                    opacity: 0;
                    transition: opacity 0.2s;
                    white-space: nowrap;
                    z-index: 10;
                }

                .data-tooltip:after {
                    content: '';
                    position: absolute;
                    bottom: -5px;
                    left: 50%;
                    transform: translateX(-50%);
                    border-width: 5px 5px 0;
                    border-style: solid;
                    border-color: #2d3748 transparent transparent;
                }

                .data-bar:hover .data-tooltip {
                    opacity: 1;
                }

                .chart-labels {
                    position: absolute;
                    left: 3rem;
                    right: 2rem;
                    bottom: -1.5rem;
                    display: flex;
                    justify-content: space-between;
                }

                .time-label {
                    font-size: 0.9rem;
                    color: #4a5568;
                    transform: rotate(-45deg);
                    transform-origin: top left;
                    font-weight: 500;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 1.5rem;
                    margin-top: 2rem;
                }

                .stat-card {
                    background: white;
                    border-radius: 12px;
                    padding: 1.5rem;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
                    transition: transform 0.2s;
                }

                .stat-card:hover {
                    transform: translateY(-2px);
                }

                .stat-header {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 1rem;
                }

                .stat-icon {
                    font-size: 1.8rem;
                }

                .stat-label {
                    color: #4a5568;
                    font-size: 1rem;
                    font-weight: 600;
                }

                .stat-value {
                    font-size: 1.8rem;
                    font-weight: 600;
                    color: #2d3748;
                }

                .btn {
                    padding: 0.75rem 1.5rem;
                    border-radius: 8px;
                    border: 2px solid #e2e8f0;
                    background: white;
                    color: #2d3748;
                    font-weight: 600;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .btn:hover {
                    background: #f7fafc;
                    border-color: #2c7a7b;
                    color: #2c7a7b;
                }

                @media (max-width: 1280px) {
                    .stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (max-width: 768px) {
                    .monitoring {
                        padding: 1rem;
                    }

                    .monitoring-header h2 {
                        font-size: 2rem;
                    }

                    .chart-area {
                        height: 50vh;
                        padding: 1rem;
                    }

                    .chart-header {
                        flex-direction: column;
                        gap: 1rem;
                    }

                    .chart-actions {
                        width: 100%;
                        justify-content: space-between;
                    }

                    .stats-grid {
                        grid-template-columns: 1fr;
                    }

                    .control-group {
                        width: 100%;
                    }

                    .control-group select {
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    );
}

function generateHistoryData(min, max, points) {
    return Array.from({ length: points }, () => 
        Math.round((Math.random() * (max - min) + min) * 10) / 10
    );
}

function calculateAverage(values) {
    return values.reduce((a, b) => a + b, 0) / values.length;
}

function calculateTrend(values) {
    const first = values[0];
    const last = values[values.length - 1];
    const diff = last - first;
    if (Math.abs(diff) < 0.5) return 'stable';
    return diff > 0 ? 'up' : 'down';
}

function getTrendIcon(trend) {
    switch (trend) {
        case 'up': return '↗️';
        case 'down': return '↘️';
        default: return '→️';
    }
}

function getTrendLabel(trend) {
    switch (trend) {
        case 'up': return 'Crescătoare';
        case 'down': return 'Descrescătoare';
        default: return 'Stabilă';
    }
}

function getBarColor(value, min, max) {
    const range = max - min;
    const normalized = (value - min) / range;
    
    if (normalized < 0.3) return '#48bb78'; // verde pentru valori mici
    if (normalized > 0.7) return '#f56565'; // roșu pentru valori mari
    return '#2c7a7b'; // culoarea de bază pentru valori medii
}

function generateTimeLabels(timeRange) {
    const now = new Date();
    const labels = [];
    let format = {};

    switch (timeRange) {
        case '1h':
            format = { hour: '2-digit', minute: '2-digit' };
            for (let i = 0; i < 12; i++) {
                const d = new Date(now - i * 5 * 60000);
                labels.unshift(d.toLocaleTimeString('ro-RO', format));
            }
            break;
        case '24h':
            format = { hour: '2-digit' };
            for (let i = 0; i < 24; i++) {
                const d = new Date(now - i * 3600000);
                labels.unshift(d.toLocaleTimeString('ro-RO', format));
            }
            break;
        case '7d':
            format = { weekday: 'short' };
            for (let i = 0; i < 7; i++) {
                const d = new Date(now - i * 86400000);
                labels.unshift(d.toLocaleDateString('ro-RO', format));
            }
            break;
        case '30d':
            format = { day: '2-digit', month: 'short' };
            for (let i = 0; i < 30; i += 2) {
                const d = new Date(now - i * 86400000);
                labels.unshift(d.toLocaleDateString('ro-RO', format));
            }
            break;
    }

    return labels;
}

export default Monitoring;