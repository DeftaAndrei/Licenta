import { useState, useEffect } from 'react';
import '../App.css';

function AlertSettings() {
    const [thresholds, setThresholds] = useState({
        temperature: {
            day: {
                optimal: { min: 22, max: 28 },
                critical: { min: 10, max: 35 }
            },
            night: {
                optimal: { min: 16, max: 18 },
                critical: { min: 10, max: 22 }
            }
        },
        humidity: {
            optimal: { min: 60, max: 70 },
            critical: { min: 55, max: 80 }
        },
        soilMoisture: {
            optimal: { min: 70, max: 80 },
            critical: { min: 50, max: 90 }
        },
        co2: {
            optimal: { min: 700, max: 1000 },
            critical: { min: 400, max: 1200 }
        },
        pumps: {
            waterPump: {
                flowRate: {
                    min: 1.5,
                    max: 4.0
                },
                pressure: {
                    min: 1.0,
                    max: 3.0
                },
                runtime: {
                    continuous: 3600,
                    daily: 43200
                }
            },
            mixPump: {
                flowRate: {
                    min: 0.5,
                    max: 2.0
                },
                runtime: {
                    continuous: 1800,
                    daily: 7200
                }
            }
        }
    });

    const [activeTab, setActiveTab] = useState('climate');
    const [hasChanges, setHasChanges] = useState(false);

    const handleThresholdChange = (category, subcategory, type, value, key) => {
        setThresholds(prev => {
            const newThresholds = { ...prev };
            if (subcategory) {
                newThresholds[category][subcategory][type][key] = parseFloat(value);
            } else {
                newThresholds[category][type][key] = parseFloat(value);
            }
            return newThresholds;
        });
        setHasChanges(true);
    };

    const saveChanges = () => {
        // Aici vom salva pragurile în localStorage sau le vom trimite către backend
        localStorage.setItem('alertThresholds', JSON.stringify(thresholds));
        setHasChanges(false);
        // Afișăm o notificare de succes
        alert('Pragurile au fost salvate cu succes!');
    };

    const resetToDefaults = () => {
        if (window.confirm('Sigur doriți să resetați toate pragurile la valorile implicite?')) {
            // Aici vom reseta la valorile implicite
            setThresholds({
                // ... valorile implicite ...
            });
            setHasChanges(true);
        }
    };

    useEffect(() => {
        // Încărcăm pragurile salvate din localStorage la inițializare
        const savedThresholds = localStorage.getItem('alertThresholds');
        if (savedThresholds) {
            setThresholds(JSON.parse(savedThresholds));
        }
    }, []);

    return (
        <div className="alert-settings-page">
            <div className="settings-header">
                <h2>Configurare Praguri și Alerte</h2>
                <div className="header-actions">
                    {hasChanges && (
                        <button className="save-btn" onClick={saveChanges}>
                            Salvează Modificările
                        </button>
                    )}
                    <button className="reset-btn" onClick={resetToDefaults}>
                        Resetează la Implicit
                    </button>
                </div>
            </div>

            <div className="settings-tabs">
                <button 
                    className={`tab-btn ${activeTab === 'climate' ? 'active' : ''}`}
                    onClick={() => setActiveTab('climate')}
                >
                    🌡️ Parametri Climatici
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'pumps' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pumps')}
                >
                    💧 Pompe
                </button>
            </div>

            <div className="settings-content">
                {activeTab === 'climate' && (
                    <div className="climate-settings">
                        <div className="settings-section">
                            <h3>Temperatură</h3>
                            <div className="subsection">
                                <h4>Ziua (6:00 - 22:00)</h4>
                                <div className="threshold-group">
                                    <div className="input-group">
                                        <label>Minim Optim (°C)</label>
                                        <input 
                                            type="number"
                                            value={thresholds.temperature.day.optimal.min}
                                            onChange={(e) => handleThresholdChange('temperature', 'day', 'optimal', e.target.value, 'min')}
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label>Maxim Optim (°C)</label>
                                        <input 
                                            type="number"
                                            value={thresholds.temperature.day.optimal.max}
                                            onChange={(e) => handleThresholdChange('temperature', 'day', 'optimal', e.target.value, 'max')}
                                        />
                                    </div>
                                </div>
                                <div className="threshold-group">
                                    <div className="input-group">
                                        <label>Minim Critic (°C)</label>
                                        <input 
                                            type="number"
                                            value={thresholds.temperature.day.critical.min}
                                            onChange={(e) => handleThresholdChange('temperature', 'day', 'critical', e.target.value, 'min')}
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label>Maxim Critic (°C)</label>
                                        <input 
                                            type="number"
                                            value={thresholds.temperature.day.critical.max}
                                            onChange={(e) => handleThresholdChange('temperature', 'day', 'critical', e.target.value, 'max')}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="settings-section">
                            <h3>Umiditate Aer</h3>
                            <div className="threshold-group">
                                <div className="input-group">
                                    <label>Minim Optim (%)</label>
                                    <input 
                                        type="number"
                                        value={thresholds.humidity.optimal.min}
                                        onChange={(e) => handleThresholdChange('humidity', null, 'optimal', e.target.value, 'min')}
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Maxim Optim (%)</label>
                                    <input 
                                        type="number"
                                        value={thresholds.humidity.optimal.max}
                                        onChange={(e) => handleThresholdChange('humidity', null, 'optimal', e.target.value, 'max')}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'pumps' && (
                    <div className="pump-settings">
                        <div className="settings-section">
                            <h3>Pompă Apă</h3>
                            <div className="threshold-group">
                                <div className="input-group">
                                    <label>Debit Minim (L/min)</label>
                                    <input 
                                        type="number"
                                        value={thresholds.pumps.waterPump.flowRate.min}
                                        onChange={(e) => handleThresholdChange('pumps', 'waterPump', 'flowRate', e.target.value, 'min')}
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Debit Maxim (L/min)</label>
                                    <input 
                                        type="number"
                                        value={thresholds.pumps.waterPump.flowRate.max}
                                        onChange={(e) => handleThresholdChange('pumps', 'waterPump', 'flowRate', e.target.value, 'max')}
                                    />
                                </div>
                            </div>
                            <div className="threshold-group">
                                <div className="input-group">
                                    <label>Presiune Minimă (bar)</label>
                                    <input 
                                        type="number"
                                        value={thresholds.pumps.waterPump.pressure.min}
                                        onChange={(e) => handleThresholdChange('pumps', 'waterPump', 'pressure', e.target.value, 'min')}
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Presiune Maximă (bar)</label>
                                    <input 
                                        type="number"
                                        value={thresholds.pumps.waterPump.pressure.max}
                                        onChange={(e) => handleThresholdChange('pumps', 'waterPump', 'pressure', e.target.value, 'max')}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="settings-section">
                            <h3>Pompă Mix</h3>
                            <div className="threshold-group">
                                <div className="input-group">
                                    <label>Debit Minim (L/min)</label>
                                    <input 
                                        type="number"
                                        value={thresholds.pumps.mixPump.flowRate.min}
                                        onChange={(e) => handleThresholdChange('pumps', 'mixPump', 'flowRate', e.target.value, 'min')}
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Debit Maxim (L/min)</label>
                                    <input 
                                        type="number"
                                        value={thresholds.pumps.mixPump.flowRate.max}
                                        onChange={(e) => handleThresholdChange('pumps', 'mixPump', 'flowRate', e.target.value, 'max')}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                .alert-settings-page {
                    padding: 1.5rem;
                    max-width: 1200px;
                    margin: 0 auto;
                    background: #f8fafc;
                }

                .settings-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }

                .header-actions {
                    display: flex;
                    gap: 1rem;
                }

                .save-btn {
                    padding: 0.5rem 1rem;
                    background: #2563eb;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                }

                .reset-btn {
                    padding: 0.5rem 1rem;
                    background: #f1f5f9;
                    color: #64748b;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                }

                .settings-tabs {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 2rem;
                }

                .tab-btn {
                    padding: 0.75rem 1.5rem;
                    background: #f1f5f9;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    color: #64748b;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .tab-btn.active {
                    background: #2563eb;
                    color: white;
                }

                .settings-section {
                    background: white;
                    border-radius: 12px;
                    padding: 1.5rem;
                    margin-bottom: 1.5rem;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }

                .settings-section h3 {
                    margin: 0 0 1rem;
                    color: #1e293b;
                    font-size: 1.25rem;
                }

                .threshold-group {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1rem;
                    margin-bottom: 1rem;
                }

                .input-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .input-group label {
                    font-size: 0.875rem;
                    color: #64748b;
                }

                .input-group input {
                    padding: 0.5rem;
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                    font-size: 1rem;
                }

                .subsection {
                    margin-bottom: 1.5rem;
                }

                .subsection h4 {
                    color: #64748b;
                    margin: 0 0 1rem;
                    font-size: 1rem;
                }

                @media (max-width: 768px) {
                    .settings-header {
                        flex-direction: column;
                        gap: 1rem;
                        align-items: stretch;
                    }

                    .header-actions {
                        flex-direction: column;
                    }

                    .settings-tabs {
                        flex-direction: column;
                    }

                    .threshold-group {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
}

export default AlertSettings; 