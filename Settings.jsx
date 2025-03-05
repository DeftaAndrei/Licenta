import { useState } from 'react';
import '../App.css';

function Settings() {
    const [activeTab, setActiveTab] = useState('general');
    const [systemMode, setSystemMode] = useState('auto');
    const [notifications, setNotifications] = useState(true);
    const [maintenanceMode, setMaintenanceMode] = useState(false);

    const [thresholds, setThresholds] = useState({
        temperature: { min: 20, max: 30, critical: 35 },
        humidity: { min: 60, max: 80, critical: 90 },
        soilMoisture: { min: 65, max: 85, critical: 90 },
        co2: { min: 400, max: 1000, critical: 1500 }
    });

    const handleThresholdChange = (parameter, type, value) => {
        setThresholds(prev => ({
            ...prev,
            [parameter]: {
                ...prev[parameter],
                [type]: Number(value)
            }
        }));
    };

    return (
        <div className="settings">
            <div className="settings-header">
                <h2>Setări & Configurare Sistem</h2>
                <div className="system-status">
                    <div className="status-indicator active">
                        <span className="status-dot"></span>
                        Sistem Activ
                    </div>
                    <button 
                        className={`mode-toggle ${maintenanceMode ? 'maintenance' : ''}`}
                        onClick={() => setMaintenanceMode(!maintenanceMode)}
                    >
                        {maintenanceMode ? '🔧 Mod Mentenanță' : '✅ Mod Normal'}
                    </button>
                </div>
            </div>

            <div className="settings-nav">
                <button 
                    className={`nav-btn ${activeTab === 'general' ? 'active' : ''}`}
                    onClick={() => setActiveTab('general')}
                >
                    <span className="nav-icon">⚙️</span>
                    Setări Generale
                </button>
                <button 
                    className={`nav-btn ${activeTab === 'thresholds' ? 'active' : ''}`}
                    onClick={() => setActiveTab('thresholds')}
                >
                    <span className="nav-icon">📊</span>
                    Praguri & Alerte
                </button>
                <button 
                    className={`nav-btn ${activeTab === 'automation' ? 'active' : ''}`}
                    onClick={() => setActiveTab('automation')}
                >
                    <span className="nav-icon">🤖</span>
                    Automatizări
                </button>
                <button 
                    className={`nav-btn ${activeTab === 'security' ? 'active' : ''}`}
                    onClick={() => setActiveTab('security')}
                >
                    <span className="nav-icon">🔒</span>
                    Securitate
                </button>
            </div>

            <div className="settings-content">
                {activeTab === 'general' && (
                    <div className="settings-section">
                        <div className="section-header">
                            <h3>Setări Generale Sistem</h3>
                            <p className="section-description">
                                Configurați parametrii generali de funcționare a sistemului
                            </p>
                        </div>
                        
                        <div className="settings-grid">
                            <div className="setting-card">
                                <div className="setting-header">
                                    <span className="setting-icon">🔄</span>
                                    <h4>Mod Operare</h4>
                                </div>
                                <div className="setting-controls">
                                    <select 
                                        value={systemMode}
                                        onChange={(e) => setSystemMode(e.target.value)}
                                        className="select-control"
                                    >
                                        <option value="auto">Automat</option>
                                        <option value="manual">Manual</option>
                                        <option value="schedule">Programat</option>
                                    </select>
                                </div>
                            </div>

                            <div className="setting-card">
                                <div className="setting-header">
                                    <span className="setting-icon">🔔</span>
                                    <h4>Notificări</h4>
                                </div>
                                <div className="setting-controls">
                                    <label className="toggle">
                                        <input
                                            type="checkbox"
                                            checked={notifications}
                                            onChange={(e) => setNotifications(e.target.checked)}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>
                            </div>

                            <div className="setting-card">
                                <div className="setting-header">
                                    <span className="setting-icon">📱</span>
                                    <h4>Conectare Mobilă</h4>
                                </div>
                                <div className="setting-controls">
                                    <button className="action-btn">
                                        Configurare
                                    </button>
                                </div>
                            </div>

                            <div className="setting-card">
                                <div className="setting-header">
                                    <span className="setting-icon">💾</span>
                                    <h4>Backup Date</h4>
                                </div>
                                <div className="setting-controls">
                                    <button className="action-btn">
                                        Backup Manual
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'thresholds' && (
                    <div className="settings-section">
                        <div className="section-header">
                            <h3>Configurare Praguri și Alerte</h3>
                            <p className="section-description">
                                Setați limitele pentru parametrii monitorizați și nivelurile de alertă
                            </p>
                        </div>

                        <div className="thresholds-grid">
                            <div className="threshold-card">
                                <div className="threshold-header">
                                    <span className="threshold-icon">🌡️</span>
                                    <h4>Temperatură</h4>
                                </div>
                                <div className="threshold-controls">
                                    <div className="threshold-input">
                                        <label>Minim (°C)</label>
                                        <input 
                                            type="number"
                                            value={thresholds.temperature.min}
                                            onChange={(e) => handleThresholdChange('temperature', 'min', e.target.value)}
                                        />
                                    </div>
                                    <div className="threshold-input">
                                        <label>Maxim (°C)</label>
                                        <input 
                                            type="number"
                                            value={thresholds.temperature.max}
                                            onChange={(e) => handleThresholdChange('temperature', 'max', e.target.value)}
                                        />
                                    </div>
                                    <div className="threshold-input">
                                        <label>Critic (°C)</label>
                                        <input 
                                            type="number"
                                            value={thresholds.temperature.critical}
                                            onChange={(e) => handleThresholdChange('temperature', 'critical', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="threshold-card">
                                <div className="threshold-header">
                                    <span className="threshold-icon">💧</span>
                                    <h4>Umiditate Aer</h4>
                                </div>
                                <div className="threshold-controls">
                                    <div className="threshold-input">
                                        <label>Minim (%)</label>
                                        <input 
                                            type="number"
                                            value={thresholds.humidity.min}
                                            onChange={(e) => handleThresholdChange('humidity', 'min', e.target.value)}
                                        />
                                    </div>
                                    <div className="threshold-input">
                                        <label>Maxim (%)</label>
                                        <input 
                                            type="number"
                                            value={thresholds.humidity.max}
                                            onChange={(e) => handleThresholdChange('humidity', 'max', e.target.value)}
                                        />
                                    </div>
                                    <div className="threshold-input">
                                        <label>Critic (%)</label>
                                        <input 
                                            type="number"
                                            value={thresholds.humidity.critical}
                                            onChange={(e) => handleThresholdChange('humidity', 'critical', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="threshold-card">
                                <div className="threshold-header">
                                    <span className="threshold-icon">🌱</span>
                                    <h4>Umiditate Sol</h4>
                                </div>
                                <div className="threshold-controls">
                                    <div className="threshold-input">
                                        <label>Minim (%)</label>
                                        <input 
                                            type="number"
                                            value={thresholds.soilMoisture.min}
                                            onChange={(e) => handleThresholdChange('soilMoisture', 'min', e.target.value)}
                                        />
                                    </div>
                                    <div className="threshold-input">
                                        <label>Maxim (%)</label>
                                        <input 
                                            type="number"
                                            value={thresholds.soilMoisture.max}
                                            onChange={(e) => handleThresholdChange('soilMoisture', 'max', e.target.value)}
                                        />
                                    </div>
                                    <div className="threshold-input">
                                        <label>Critic (%)</label>
                                        <input 
                                            type="number"
                                            value={thresholds.soilMoisture.critical}
                                            onChange={(e) => handleThresholdChange('soilMoisture', 'critical', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="threshold-card">
                                <div className="threshold-header">
                                    <span className="threshold-icon">🌬️</span>
                                    <h4>Nivel CO₂</h4>
                                </div>
                                <div className="threshold-controls">
                                    <div className="threshold-input">
                                        <label>Minim (ppm)</label>
                                        <input 
                                            type="number"
                                            value={thresholds.co2.min}
                                            onChange={(e) => handleThresholdChange('co2', 'min', e.target.value)}
                                        />
                                    </div>
                                    <div className="threshold-input">
                                        <label>Maxim (ppm)</label>
                                        <input 
                                            type="number"
                                            value={thresholds.co2.max}
                                            onChange={(e) => handleThresholdChange('co2', 'max', e.target.value)}
                                        />
                                    </div>
                                    <div className="threshold-input">
                                        <label>Critic (ppm)</label>
                                        <input 
                                            type="number"
                                            value={thresholds.co2.critical}
                                            onChange={(e) => handleThresholdChange('co2', 'critical', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'automation' && (
                    <div className="settings-section">
                        <div className="section-header">
                            <h3>Reguli de Automatizare</h3>
                            <p className="section-description">
                                Configurați regulile de automatizare pentru controlul sistemului
                            </p>
                        </div>
                        <div className="automation-content">
                            <div className="automation-card">
                                <h4>Programare Automată</h4>
                                <p>În curând...</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="settings-section">
                        <div className="section-header">
                            <h3>Setări de Securitate</h3>
                            <p className="section-description">
                                Configurați parametrii de securitate și acces la sistem
                            </p>
                        </div>
                        <div className="security-content">
                            <div className="security-card">
                                <h4>Control Acces</h4>
                                <p>În curând...</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                .settings {
                    padding: 2rem;
                    width: 100%;
                    min-height: 100vh;
                    background: #f8fafc;
                }

                .settings-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                    padding-bottom: 1rem;
                    border-bottom: 2px solid #e2e8f0;
                }

                .settings-header h2 {
                    color: #1a202c;
                    font-size: 2.5rem;
                    font-weight: 700;
                    margin: 0;
                }

                .system-status {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                }

                .status-indicator {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1rem;
                    border-radius: 9999px;
                    background: #f0fff4;
                    color: #2f855a;
                    font-weight: 600;
                }

                .status-indicator.active .status-dot {
                    background: #48bb78;
                }

                .status-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    animation: pulse 2s infinite;
                }

                @keyframes pulse {
                    0% {
                        transform: scale(0.95);
                        box-shadow: 0 0 0 0 rgba(72, 187, 120, 0.7);
                    }
                    
                    70% {
                        transform: scale(1);
                        box-shadow: 0 0 0 10px rgba(72, 187, 120, 0);
                    }
                    
                    100% {
                        transform: scale(0.95);
                        box-shadow: 0 0 0 0 rgba(72, 187, 120, 0);
                    }
                }

                .mode-toggle {
                    padding: 0.75rem 1.5rem;
                    border-radius: 8px;
                    border: none;
                    background: #ebf8ff;
                    color: #2b6cb0;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .mode-toggle.maintenance {
                    background: #fff5f5;
                    color: #c53030;
                }

                .settings-nav {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 2rem;
                    padding: 1rem;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
                }

                .nav-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 1rem 1.5rem;
                    border: none;
                    border-radius: 8px;
                    background: transparent;
                    color: #4a5568;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .nav-btn:hover {
                    background: #f7fafc;
                }

                .nav-btn.active {
                    background: #2c7a7b;
                    color: white;
                }

                .nav-icon {
                    font-size: 1.25rem;
                }

                .settings-content {
                    background: white;
                    border-radius: 12px;
                    padding: 2rem;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
                }

                .section-header {
                    margin-bottom: 2rem;
                }

                .section-header h3 {
                    color: #2d3748;
                    font-size: 1.8rem;
                    margin: 0 0 0.5rem 0;
                }

                .section-description {
                    color: #718096;
                    font-size: 1.1rem;
                }

                .settings-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 1.5rem;
                }

                .setting-card {
                    background: #f8fafc;
                    border-radius: 12px;
                    padding: 1.5rem;
                    transition: transform 0.2s;
                }

                .setting-card:hover {
                    transform: translateY(-2px);
                }

                .setting-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }

                .setting-icon {
                    font-size: 1.5rem;
                }

                .setting-header h4 {
                    margin: 0;
                    color: #2d3748;
                    font-size: 1.2rem;
                }

                .setting-controls {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .select-control {
                    width: 100%;
                    padding: 0.75rem;
                    border-radius: 8px;
                    border: 2px solid #e2e8f0;
                    background: white;
                    color: #2d3748;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .select-control:hover {
                    border-color: #2c7a7b;
                }

                .toggle {
                    position: relative;
                    display: inline-block;
                    width: 60px;
                    height: 34px;
                }

                .toggle input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }

                .toggle-slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: #cbd5e0;
                    transition: .4s;
                    border-radius: 34px;
                }

                .toggle-slider:before {
                    position: absolute;
                    content: "";
                    height: 26px;
                    width: 26px;
                    left: 4px;
                    bottom: 4px;
                    background-color: white;
                    transition: .4s;
                    border-radius: 50%;
                }

                input:checked + .toggle-slider {
                    background-color: #2c7a7b;
                }

                input:checked + .toggle-slider:before {
                    transform: translateX(26px);
                }

                .action-btn {
                    padding: 0.75rem 1.5rem;
                    border-radius: 8px;
                    border: none;
                    background: #2c7a7b;
                    color: white;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .action-btn:hover {
                    background: #285e61;
                }

                .thresholds-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 1.5rem;
                }

                .threshold-card {
                    background: #f8fafc;
                    border-radius: 12px;
                    padding: 1.5rem;
                }

                .threshold-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }

                .threshold-icon {
                    font-size: 1.5rem;
                }

                .threshold-header h4 {
                    margin: 0;
                    color: #2d3748;
                    font-size: 1.2rem;
                }

                .threshold-controls {
                    display: grid;
                    gap: 1rem;
                }

                .threshold-input {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .threshold-input label {
                    color: #718096;
                    font-size: 0.9rem;
                    font-weight: 500;
                }

                .threshold-input input {
                    padding: 0.75rem;
                    border-radius: 8px;
                    border: 2px solid #e2e8f0;
                    background: white;
                    color: #2d3748;
                    font-size: 1rem;
                    transition: all 0.2s;
                }

                .threshold-input input:hover {
                    border-color: #2c7a7b;
                }

                .threshold-input input:focus {
                    outline: none;
                    border-color: #2c7a7b;
                    box-shadow: 0 0 0 3px rgba(44, 122, 123, 0.1);
                }

                @media (max-width: 768px) {
                    .settings {
                        padding: 1rem;
                    }

                    .settings-header {
                        flex-direction: column;
                        gap: 1rem;
                    }

                    .settings-header h2 {
                        font-size: 2rem;
                    }

                    .settings-nav {
                        flex-wrap: wrap;
                    }

                    .nav-btn {
                        width: 100%;
                        justify-content: center;
                    }

                    .settings-content {
                        padding: 1rem;
                    }

                    .section-header h3 {
                        font-size: 1.5rem;
                    }
                }
            `}</style>
        </div>
    );
}

export default Settings; 