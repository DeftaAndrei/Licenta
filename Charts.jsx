import { useState } from 'react';
import '../App.css';

function Charts() {
    const [selectedChart, setSelectedChart] = useState('temperature');
    const [timeRange, setTimeRange] = useState('24h');
    const [compareMode, setCompareMode] = useState(false);

    const chartColors = {
        temperature: { gradient: ['#60A5FA', '#2563EB'], border: '#1E40AF' },
        humidity: { gradient: ['#34D399', '#059669'], border: '#047857' },
        soilMoisture: { gradient: ['#818CF8', '#4F46E5'], border: '#3730A3' },
        co2: { gradient: ['#F472B6', '#DB2777'], border: '#BE185D' },
        light: { gradient: ['#FBBF24', '#D97706'], border: '#B45309' }
    };

    const chartData = {
        temperature: generateDummyData(20, 30),
        humidity: generateDummyData(60, 80),
        soilMoisture: generateDummyData(65, 85),
        co2: generateDummyData(400, 1000),
        light: generateDummyData(500, 1000)
    };

    return (
        <div className="charts-container">
            <div className="charts-header">
                <h2>Grafice & Analiză</h2>
                <div className="charts-controls">
                    <div className="control-group">
                        <label>Parametru:</label>
                        <select 
                            value={selectedChart}
                            onChange={(e) => setSelectedChart(e.target.value)}
                            className="select-control"
                        >
                            <option value="temperature">Temperatură</option>
                            <option value="humidity">Umiditate Aer</option>
                            <option value="soilMoisture">Umiditate Sol</option>
                            <option value="co2">Nivel CO₂</option>
                            <option value="light">Intensitate Lumină</option>
                        </select>
                    </div>

                    <div className="control-group">
                        <label>Interval:</label>
                        <select 
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="select-control"
                        >
                            <option value="1h">Ultima oră</option>
                            <option value="24h">Ultimele 24 ore</option>
                            <option value="7d">Ultima săptămână</option>
                            <option value="30d">Ultima lună</option>
                        </select>
                    </div>

                    <div className="control-group">
                        <label className="toggle-label">
                            <input
                                type="checkbox"
                                checked={compareMode}
                                onChange={(e) => setCompareMode(e.target.checked)}
                                className="toggle-input"
                            />
                            <span className="toggle-slider"></span>
                            Comparație
                        </label>
                    </div>
                </div>
            </div>

            <div className="chart-main-container">
                <div className="chart-header">
                    <div className="chart-title">
                        <h3>{getParameterName(selectedChart)}</h3>
                        <span className="chart-subtitle">
                            Valoare curentă: <strong>{chartData[selectedChart][chartData[selectedChart].length - 1]}{getParameterUnit(selectedChart)}</strong>
                        </span>
                    </div>
                    <div className="chart-actions">
                        <button className="action-button">
                            <span className="icon">📊</span>
                            Export Date
                        </button>
                        <button className="action-button">
                            <span className="icon">⚙️</span>
                            Setări Grafic
                        </button>
                    </div>
                </div>

                <div className="chart-area">
                    <div className="chart-grid">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="grid-line">
                                <span className="grid-label">
                                    {Math.round(getMaxValue(selectedChart) - (i * (getMaxValue(selectedChart) / 4)))}{getParameterUnit(selectedChart)}
                                </span>
                            </div>
                        ))}
                    </div>
                    
                    <div className="chart-data">
                        {chartData[selectedChart].map((value, index) => (
                            <div 
                                key={index} 
                                className="data-bar"
                                style={{
                                    height: `${(value / getMaxValue(selectedChart)) * 100}%`,
                                    background: `linear-gradient(to top, ${chartColors[selectedChart].gradient[0]}, ${chartColors[selectedChart].gradient[1]})`,
                                    borderTop: `3px solid ${chartColors[selectedChart].border}`
                                }}
                            >
                                <span className="data-tooltip">
                                    {value}{getParameterUnit(selectedChart)}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="time-labels">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="time-label">
                                {new Date(Date.now() - (5 - i) * 3600000).getHours()}:00
                            </div>
                        ))}
                    </div>
                </div>

                <div className="stats-container">
                    <StatCard
                        icon="📊"
                        label="Medie"
                        value={calculateAverage(chartData[selectedChart])}
                        unit={getParameterUnit(selectedChart)}
                        color={chartColors[selectedChart].gradient[1]}
                    />
                    <StatCard
                        icon="⬆️"
                        label="Maxim"
                        value={Math.max(...chartData[selectedChart])}
                        unit={getParameterUnit(selectedChart)}
                        color={chartColors[selectedChart].gradient[1]}
                    />
                    <StatCard
                        icon="⬇️"
                        label="Minim"
                        value={Math.min(...chartData[selectedChart])}
                        unit={getParameterUnit(selectedChart)}
                        color={chartColors[selectedChart].gradient[1]}
                    />
                </div>
            </div>

            <style jsx>{`
                .charts-container {
                    padding: 2rem;
                    background: #f8fafc;
                    min-height: 100vh;
                }

                .charts-header {
                    margin-bottom: 2rem;
                }

                .charts-header h2 {
                    font-size: 2.5rem;
                    font-weight: 700;
                    color: #1e293b;
                    margin-bottom: 1.5rem;
                }

                .charts-controls {
                    display: flex;
                    gap: 2rem;
                    padding: 1.5rem;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                }

                .control-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .control-group label {
                    font-weight: 600;
                    color: #475569;
                }

                .select-control {
                    padding: 0.75rem;
                    border-radius: 8px;
                    border: 2px solid #e2e8f0;
                    min-width: 200px;
                    font-size: 1rem;
                    color: #1e293b;
                    background: white;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .select-control:hover {
                    border-color: #60a5fa;
                }

                .toggle-label {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    cursor: pointer;
                    padding-top: 1.5rem;
                }

                .toggle-input {
                    display: none;
                }

                .toggle-slider {
                    position: relative;
                    width: 48px;
                    height: 24px;
                    background: #e2e8f0;
                    border-radius: 24px;
                    transition: all 0.2s;
                }

                .toggle-slider:before {
                    content: '';
                    position: absolute;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: white;
                    top: 2px;
                    left: 2px;
                    transition: all 0.2s;
                }

                .toggle-input:checked + .toggle-slider {
                    background: #60a5fa;
                }

                .toggle-input:checked + .toggle-slider:before {
                    transform: translateX(24px);
                }

                .chart-main-container {
                    background: white;
                    border-radius: 16px;
                    padding: 2rem;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }

                .chart-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }

                .chart-title h3 {
                    font-size: 1.8rem;
                    font-weight: 700;
                    color: #1e293b;
                    margin: 0 0 0.5rem 0;
                }

                .chart-subtitle {
                    color: #64748b;
                    font-size: 1.1rem;
                }

                .chart-subtitle strong {
                    color: #2563eb;
                    font-weight: 600;
                }

                .chart-actions {
                    display: flex;
                    gap: 1rem;
                }

                .action-button {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.75rem 1.5rem;
                    border: none;
                    border-radius: 8px;
                    background: #f1f5f9;
                    color: #475569;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .action-button:hover {
                    background: #e2e8f0;
                }

                .chart-area {
                    position: relative;
                    height: 70vh;
                    margin: 2rem 0;
                    padding: 2rem 3rem 3rem;
                    background: #f8fafc;
                    border-radius: 16px;
                    border: 1px solid #e2e8f0;
                }

                .chart-grid {
                    position: absolute;
                    top: 2rem;
                    left: 4rem;
                    right: 2rem;
                    bottom: 3rem;
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
                    color: #64748b;
                    font-weight: 500;
                }

                .chart-data {
                    position: absolute;
                    left: 4rem;
                    right: 2rem;
                    bottom: 3rem;
                    top: 2rem;
                    display: flex;
                    align-items: flex-end;
                    gap: 0.5rem;
                }

                .data-bar {
                    flex: 1;
                    border-radius: 6px 6px 0 0;
                    transition: all 0.3s ease;
                    position: relative;
                    cursor: pointer;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }

                .data-bar:hover {
                    transform: scaleY(1.02);
                }

                .data-tooltip {
                    position: absolute;
                    top: -30px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: #1e293b;
                    color: white;
                    padding: 0.5rem 0.75rem;
                    border-radius: 6px;
                    font-size: 0.9rem;
                    font-weight: 500;
                    opacity: 0;
                    transition: opacity 0.2s;
                    white-space: nowrap;
                }

                .data-tooltip:after {
                    content: '';
                    position: absolute;
                    bottom: -5px;
                    left: 50%;
                    transform: translateX(-50%);
                    border-width: 5px 5px 0;
                    border-style: solid;
                    border-color: #1e293b transparent transparent;
                }

                .data-bar:hover .data-tooltip {
                    opacity: 1;
                }

                .time-labels {
                    position: absolute;
                    left: 4rem;
                    right: 2rem;
                    bottom: 0.5rem;
                    display: flex;
                    justify-content: space-between;
                }

                .time-label {
                    font-size: 0.9rem;
                    color: #64748b;
                    transform: rotate(-45deg);
                    transform-origin: top left;
                }

                .stats-container {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 1.5rem;
                    margin-top: 2rem;
                }

                @media (max-width: 1024px) {
                    .charts-controls {
                        flex-wrap: wrap;
                    }

                    .chart-area {
                        height: 50vh;
                    }

                    .stats-container {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (max-width: 768px) {
                    .charts-container {
                        padding: 1rem;
                    }

                    .charts-header h2 {
                        font-size: 2rem;
                    }

                    .chart-area {
                        padding: 1rem 2rem 2rem;
                    }

                    .stats-container {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
}

function StatCard({ icon, label, value, unit, color }) {
    return (
        <div className="stat-card">
            <div className="stat-icon" style={{ color }}>{icon}</div>
            <div className="stat-info">
                <div className="stat-value">{value.toFixed(1)}{unit}</div>
                <div className="stat-label">{label}</div>
            </div>

            <style jsx>{`
                .stat-card {
                    background: #f8fafc;
                    padding: 1.5rem;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    transition: transform 0.2s;
                }

                .stat-card:hover {
                    transform: translateY(-2px);
                }

                .stat-icon {
                    font-size: 1.5rem;
                }

                .stat-info {
                    flex: 1;
                }

                .stat-value {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #1e293b;
                    margin-bottom: 0.25rem;
                }

                .stat-label {
                    color: #64748b;
                    font-size: 0.875rem;
                    font-weight: 500;
                }
            `}</style>
        </div>
    );
}

function getParameterName(param) {
    const names = {
        temperature: 'Temperatură',
        humidity: 'Umiditate Aer',
        soilMoisture: 'Umiditate Sol',
        co2: 'Nivel CO₂',
        light: 'Intensitate Lumină'
    };
    return names[param] || param;
}

function getParameterUnit(param) {
    const units = {
        temperature: '°C',
        humidity: '%',
        soilMoisture: '%',
        co2: 'ppm',
        light: 'lux'
    };
    return units[param] || '';
}

function getMaxValue(param) {
    const maxValues = {
        temperature: 40,
        humidity: 100,
        soilMoisture: 100,
        co2: 2000,
        light: 2000
    };
    return maxValues[param] || 100;
}

function generateDummyData(min, max) {
    return Array.from({ length: 24 }, () => 
        Math.round((Math.random() * (max - min) + min) * 10) / 10
    );
}

function calculateAverage(values) {
    return values.reduce((a, b) => a + b, 0) / values.length;
}

export default Charts; 