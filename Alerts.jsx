import { useState, useEffect } from 'react';
import '../App.css';

function Alerts() {
    const [alerts, setAlerts] = useState([]);
    const [notificationPermission, setNotificationPermission] = useState('default');
    const [alertCategories, setAlertCategories] = useState({
        pump: { count: 0, active: true },
        climate: { count: 0, active: true },
        system: { count: 0, active: true }
    });

    // Praguri pentru alerte (preluate din Dashboard)
    const ALERT_THRESHOLDS = {
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
        light: {
            intensity: {
                optimal: { min: 25000, max: 30000 },
                minimal: { min: 5000, max: 6000 }
            }
        },
        pumps: {
            waterPump: {
                flowRate: {
                    min: 1.5, // L/min
                    max: 4.0  // L/min
                },
                pressure: {
                    min: 1.0, // bar
                    max: 3.0  // bar
                },
                runtime: {
                    continuous: 3600, // secunde (1 oră)
                    daily: 43200     // secunde (12 ore)
                }
            },
            mixPump: {
                flowRate: {
                    min: 0.5, // L/min
                    max: 2.0  // L/min
                },
                runtime: {
                    continuous: 1800, // secunde (30 minute)
                    daily: 7200      // secunde (2 ore)
                }
            }
        }
    };

    // Funcție pentru a cere permisiunea pentru notificări
    const requestNotificationPermission = async () => {
        try {
            const permission = await Notification.requestPermission();
            setNotificationPermission(permission);
        } catch (error) {
            console.error('Eroare la solicitarea permisiunii pentru notificări:', error);
        }
    };

    // Funcție pentru a crea o notificare
    const createNotification = (title, message, severity, category) => {
        if (notificationPermission === 'granted') {
            const notification = new Notification(title, {
                body: message,
                icon: getAlertIcon(severity, category)
            });
        }

        // Adăugăm alerta în lista de alerte
        const newAlert = {
            id: Date.now(),
            title,
            message,
            severity,
            category,
            timestamp: new Date().toLocaleString()
        };

        setAlerts(prev => [newAlert, ...prev]);
        updateAlertCounts(category);
    };

    // Funcție pentru a actualiza contorul de alerte pe categorii
    const updateAlertCounts = (category) => {
        setAlertCategories(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                count: prev[category].count + 1
            }
        }));
    };

    // Funcție pentru a verifica parametrii și a genera alerte
    const checkParameters = (parameters) => {
        const isDay = new Date().getHours() >= 6 && new Date().getHours() < 22;
        const tempThresholds = isDay ? ALERT_THRESHOLDS.temperature.day : ALERT_THRESHOLDS.temperature.night;

        // Verificare temperatură
        if (parameters.temperature.value < tempThresholds.critical.min) {
            createNotification(
                'Alertă Critică - Temperatură',
                `Temperatura este prea scăzută: ${parameters.temperature.value}°C`,
                'critical',
                'climate'
            );
        } else if (parameters.temperature.value > tempThresholds.critical.max) {
            createNotification(
                'Alertă Critică - Temperatură',
                `Temperatura este prea ridicată: ${parameters.temperature.value}°C`,
                'critical',
                'climate'
            );
        } else if (parameters.temperature.value < tempThresholds.optimal.min || 
                   parameters.temperature.value > tempThresholds.optimal.max) {
            createNotification(
                'Avertisment - Temperatură',
                `Temperatura este în afara intervalului optim: ${parameters.temperature.value}°C`,
                'warning',
                'climate'
            );
        }

        // Verificare umiditate aer
        if (parameters.humidity.value < ALERT_THRESHOLDS.humidity.critical.min) {
            createNotification(
                'Alertă Critică - Umiditate Aer',
                `Umiditatea aerului este prea scăzută: ${parameters.humidity.value}%`,
                'critical',
                'climate'
            );
        } else if (parameters.humidity.value > ALERT_THRESHOLDS.humidity.critical.max) {
            createNotification(
                'Alertă Critică - Umiditate Aer',
                `Umiditatea aerului este prea ridicată: ${parameters.humidity.value}%`,
                'critical',
                'climate'
            );
        }

        // Verificare umiditate sol
        if (parameters.soilMoisture.value < ALERT_THRESHOLDS.soilMoisture.critical.min) {
            createNotification(
                'Alertă Critică - Umiditate Sol',
                `Umiditatea solului este prea scăzută: ${parameters.soilMoisture.value}%`,
                'critical',
                'climate'
            );
        } else if (parameters.soilMoisture.value > ALERT_THRESHOLDS.soilMoisture.critical.max) {
            createNotification(
                'Alertă Critică - Umiditate Sol',
                `Umiditatea solului este prea ridicată: ${parameters.soilMoisture.value}%`,
                'critical',
                'climate'
            );
        }

        // Verificare CO2
        if (parameters.co2.value < ALERT_THRESHOLDS.co2.critical.min) {
            createNotification(
                'Alertă - Nivel CO₂',
                `Nivelul de CO₂ este prea scăzut: ${parameters.co2.value} ppm`,
                'warning',
                'climate'
            );
        } else if (parameters.co2.value > ALERT_THRESHOLDS.co2.critical.max) {
            createNotification(
                'Alertă Critică - Nivel CO₂',
                `Nivelul de CO₂ este prea ridicat: ${parameters.co2.value} ppm`,
                'critical',
                'climate'
            );
        }

        // Verificare lumină (doar în timpul zilei)
        if (isDay && parameters.light.value < ALERT_THRESHOLDS.light.intensity.minimal.min) {
            createNotification(
                'Alertă - Intensitate Lumină',
                `Intensitatea luminii este prea scăzută: ${parameters.light.value} lux`,
                'warning',
                'climate'
            );
        }
    };

    // Funcție pentru a verifica starea pompelor
    const checkPumpStatus = (pumpData) => {
        // Verificare pompă apă
        if (pumpData.waterPump.active) {
            // Verificare debit
            if (pumpData.waterFlow < ALERT_THRESHOLDS.pumps.waterPump.flowRate.min) {
                createNotification(
                    'Alertă Critică - Pompă Apă',
                    `Debit prea mic: ${pumpData.waterFlow} L/min`,
                    'critical',
                    'pump'
                );
            } else if (pumpData.waterFlow > ALERT_THRESHOLDS.pumps.waterPump.flowRate.max) {
                createNotification(
                    'Alertă Critică - Pompă Apă',
                    `Debit prea mare: ${pumpData.waterFlow} L/min`,
                    'critical',
                    'pump'
                );
            }

            // Verificare timp de funcționare continuu
            if (pumpData.waterPump.runtime > ALERT_THRESHOLDS.pumps.waterPump.runtime.continuous) {
                createNotification(
                    'Avertisment - Pompă Apă',
                    'Pompă funcționează continuu de prea mult timp',
                    'warning',
                    'pump'
                );
            }
        }

        // Verificare pompă mix
        if (pumpData.mixPump.active) {
            if (pumpData.mixPump.runtime > ALERT_THRESHOLDS.pumps.mixPump.runtime.continuous) {
                createNotification(
                    'Avertisment - Pompă Mix',
                    'Pompă mix funcționează continuu de prea mult timp',
                    'warning',
                    'pump'
                );
            }
        }

        // Verificare erori de sistem pentru pompe
        if (pumpData.waterPump.error) {
            createNotification(
                'Eroare Sistem - Pompă Apă',
                `Eroare detectată: ${pumpData.waterPump.errorMessage}`,
                'critical',
                'system'
            );
        }

        if (pumpData.mixPump.error) {
            createNotification(
                'Eroare Sistem - Pompă Mix',
                `Eroare detectată: ${pumpData.mixPump.errorMessage}`,
                'critical',
                'system'
            );
        }
    };

    // Funcție pentru a obține iconița potrivită pentru alertă
    const getAlertIcon = (severity, category) => {
        const icons = {
            pump: {
                critical: '🚱',
                warning: '💧'
            },
            climate: {
                critical: '🌡️',
                warning: '⚠️'
            },
            system: {
                critical: '⚡',
                warning: '⚙️'
            }
        };
        return icons[category]?.[severity] || '⚠️';
    };

    // Funcție pentru a șterge o alertă
    const deleteAlert = (alertId) => {
        setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    };

    // Funcție pentru a șterge toate alertele
    const clearAllAlerts = () => {
        setAlerts([]);
        setAlertCategories(prev => ({
            pump: { ...prev.pump, count: 0 },
            climate: { ...prev.climate, count: 0 },
            system: { ...prev.system, count: 0 }
        }));
    };

    // Funcție pentru a filtra alertele după categorie
    const toggleCategoryFilter = (category) => {
        setAlertCategories(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                active: !prev[category].active
            }
        }));
    };

    useEffect(() => {
        // Cerem permisiunea pentru notificări la încărcarea componentei
        requestNotificationPermission();
    }, []);

    return (
        <div className="alerts-page">
            <h2 className="page-title">Alerte & Notificări</h2>
            
            <div className="alerts-header">
                <div className="alerts-status">
                    <span className="status-icon">🔔</span>
                    <span className="status-text">
                        Sistem de alertare: {notificationPermission === 'granted' ? 'Activ' : 'Inactiv'}
                    </span>
                </div>
                
                <div className="category-filters">
                    <button 
                        className={`category-btn pump ${alertCategories.pump.active ? 'active' : ''}`}
                        onClick={() => toggleCategoryFilter('pump')}
                    >
                        💧 Pompe ({alertCategories.pump.count})
                    </button>
                    <button 
                        className={`category-btn climate ${alertCategories.climate.active ? 'active' : ''}`}
                        onClick={() => toggleCategoryFilter('climate')}
                    >
                        🌡️ Climat ({alertCategories.climate.count})
                    </button>
                    <button 
                        className={`category-btn system ${alertCategories.system.active ? 'active' : ''}`}
                        onClick={() => toggleCategoryFilter('system')}
                    >
                        ⚙️ Sistem ({alertCategories.system.count})
                    </button>
                </div>

                {alerts.length > 0 && (
                    <button className="clear-all-btn" onClick={clearAllAlerts}>
                        Șterge toate alertele
                    </button>
                )}
            </div>

            <div className="alerts-container">
                {alerts.length === 0 ? (
                    <div className="no-alerts">
                        <span className="no-alerts-icon">✅</span>
                        <p>Nu există alerte active</p>
                    </div>
                ) : (
                    alerts
                        .filter(alert => alertCategories[alert.category].active)
                        .map(alert => (
                            <div key={alert.id} className={`alert-card ${alert.severity} ${alert.category}`}>
                                <div className="alert-header">
                                    <span className="alert-icon">
                                        {getAlertIcon(alert.severity, alert.category)}
                                    </span>
                                    <h3 className="alert-title">{alert.title}</h3>
                                    <button 
                                        className="delete-alert-btn"
                                        onClick={() => deleteAlert(alert.id)}
                                    >
                                        ×
                                    </button>
                                </div>
                                <p className="alert-message">{alert.message}</p>
                                <div className="alert-timestamp">{alert.timestamp}</div>
                            </div>
                        ))
                )}
            </div>

            <style jsx>{`
                .alerts-page {
                    padding: 1rem;
                    max-width: 100%;
                    margin: 0 auto;
                    background: #f8fafc;
                    min-height: 100vh;
                }

                .page-title {
                    font-size: 1.75rem;
                    text-align: center;
                    color: #1e293b;
                    margin: 1rem 0 1.5rem;
                }

                .alerts-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                    padding: 0.5rem;
                }

                .alerts-status {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 1.1rem;
                    color: #64748b;
                }

                .status-icon {
                    font-size: 1.5rem;
                }

                .clear-all-btn {
                    padding: 0.5rem 1rem;
                    border: none;
                    border-radius: 8px;
                    background: #ef4444;
                    color: white;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .clear-all-btn:hover {
                    background: #dc2626;
                }

                .alerts-container {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .no-alerts {
                    text-align: center;
                    padding: 2rem;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }

                .no-alerts-icon {
                    font-size: 3rem;
                    display: block;
                    margin-bottom: 1rem;
                }

                .alert-card {
                    background: white;
                    border-radius: 12px;
                    padding: 1rem;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    border-left: 4px solid;
                }

                .alert-card.critical {
                    border-color: #ef4444;
                }

                .alert-card.warning {
                    border-color: #f59e0b;
                }

                .alert-header {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 0.75rem;
                }

                .alert-icon {
                    font-size: 1.5rem;
                }

                .alert-title {
                    flex: 1;
                    margin: 0;
                    font-size: 1.1rem;
                    color: #1e293b;
                }

                .delete-alert-btn {
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    color: #94a3b8;
                    cursor: pointer;
                    padding: 0.25rem;
                    line-height: 1;
                }

                .alert-message {
                    margin: 0 0 0.75rem;
                    color: #64748b;
                }

                .alert-timestamp {
                    font-size: 0.875rem;
                    color: #94a3b8;
                }

                .category-filters {
                    display: flex;
                    gap: 0.5rem;
                    margin: 1rem 0;
                    flex-wrap: wrap;
                }

                .category-btn {
                    padding: 0.5rem 1rem;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    opacity: 0.7;
                }

                .category-btn.active {
                    opacity: 1;
                }

                .category-btn.pump {
                    background: #e0f2fe;
                    color: #0369a1;
                }

                .category-btn.climate {
                    background: #fef3c7;
                    color: #92400e;
                }

                .category-btn.system {
                    background: #f1f5f9;
                    color: #475569;
                }

                .alert-card.pump {
                    border-left-color: #0ea5e9;
                }

                .alert-card.climate {
                    border-left-color: #f59e0b;
                }

                .alert-card.system {
                    border-left-color: #64748b;
                }

                @media (min-width: 768px) {
                    .alerts-page {
                        padding: 1.5rem;
                    }

                    .alerts-container {
                        max-width: 800px;
                        margin: 0 auto;
                    }
                }
            `}</style>
        </div>
    );
}

export default Alerts; 