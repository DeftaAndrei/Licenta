import { useState, useEffect } from 'react';
import '../App.css';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
    const [mode, setMode] = useState('manual');
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Adăugăm state pentru ventilatoare și leduri
    const [fans, setFans] = useState({
        fan1: { active: false, power: 50, label: 'Ventilator 1' },
        fan2: { active: false, power: 50, label: 'Ventilator 2' }
    });
    
    const [leds, setLeds] = useState({
        led1: { active: false, intensity: 50, label: 'Lumina artificiala zona 1' },
        led2: { active: false, intensity: 50, label: 'Lumina artificiala zona 2' }
    });

    // Adăugăm state pentru pompe
    const [pumps, setPumps] = useState({
        waterPump: { active: false, power: 50, label: 'Pompă Apă' },
        mixPump: { active: false, power: 50, label: 'Pompă Mix' },
        heatPump1: { active: false, power: 50, label: 'Pompă Căldură 1', type: 'heat' },
        heatPump2: { active: false, power: 50, label: 'Pompă Căldură 2', type: 'heat' },
        coolingSystem: { active: false, power: 50, label: 'Sistem Răcire', type: 'cooling' }
    });

    const [parameters, setParameters] = useState({
        temperature: { 
            value: 25, 
            unit: '°C', 
            trend: 'stable',
            status: 'normal',
            icon: '🌡️',
            label: 'Temperatură',
            category: 'climate'
        },
        humidity: { 
            value: 65, 
            unit: '%', 
            trend: 'up',
            status: 'normal',
            icon: '💧',
            label: 'Umiditate Aer',
            category: 'climate',
            min: 60,
            max: 80
        },
        soilMoisture: { 
            value: 70, 
            unit: '%', 
            trend: 'down',
            status: 'normal',
            icon: '🌱',
            label: 'Umiditate Sol',
            category: 'irrigation'
        },
        waterFlow: { 
            value: 2.5, 
            unit: 'L/min', 
            trend: 'stable',
            status: 'normal',
            icon: '🚰',
            label: 'Debit Apă',
            category: 'irrigation'
        },
        co2: { 
            value: 450, 
            unit: 'ppm', 
            trend: 'stable',
            status: 'normal',
            icon: '☁️',
            label: 'Nivel CO₂',
            category: 'climate'
        },
        light: { 
            value: 800, 
            unit: 'lux', 
            trend: 'up',
            status: 'warning',
            icon: '☀️',
            label: 'Intensitate Lumină',
            category: 'climate'
        }
    });

    // Adăugăm stare pentru temperatura țintă
    const [targetTemperature, setTargetTemperature] = useState(25);

    // Constante pentru pragurile de control automat specializate pentru roșii
    const AUTO_CONTROL_THRESHOLDS = {
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
            },
            duration: { min: 14, max: 16 } // ore pe zi
        }
    };

    // Funcție pentru a determina dacă este zi sau noapte (simulare)
    const isDaytime = () => {
        const hour = new Date().getHours();
        return hour >= 6 && hour < 22; // Considerăm ziua între 6:00 și 22:00
    };

    // Funcție pentru controlul automat al dispozitivelor
    const handleAutoControl = () => {
        if (mode === 'auto') {
            const currentGh = greenhouses[currentGreenhouse];
            const isDay = isDaytime();
            const tempThresholds = isDay ? 
                AUTO_CONTROL_THRESHOLDS.temperature.day : 
                AUTO_CONTROL_THRESHOLDS.temperature.night;

            // Control ventilator bazat pe temperatură, umiditate și CO2
            const shouldActivateFans = 
                currentGh.parameters.temperature.value > tempThresholds.optimal.max ||
                currentGh.parameters.humidity.value > AUTO_CONTROL_THRESHOLDS.humidity.optimal.max ||
                currentGh.parameters.co2.value > AUTO_CONTROL_THRESHOLDS.co2.optimal.max;

            const shouldDeactivateFans =
                currentGh.parameters.temperature.value < tempThresholds.optimal.min &&
                currentGh.parameters.humidity.value < AUTO_CONTROL_THRESHOLDS.humidity.optimal.min &&
                currentGh.parameters.co2.value < AUTO_CONTROL_THRESHOLDS.co2.optimal.max;

            // Calculăm puterea ventilatoarelor în funcție de severitatea depășirii pragurilor
            const calculateFanPower = () => {
                const tempFactor = Math.max(0, 
                    (currentGh.parameters.temperature.value - tempThresholds.optimal.min) /
                    (tempThresholds.optimal.max - tempThresholds.optimal.min)
                );
                const humidityFactor = Math.max(0,
                    (currentGh.parameters.humidity.value - AUTO_CONTROL_THRESHOLDS.humidity.optimal.min) /
                    (AUTO_CONTROL_THRESHOLDS.humidity.optimal.max - AUTO_CONTROL_THRESHOLDS.humidity.optimal.min)
                );
                const co2Factor = Math.max(0,
                    (currentGh.parameters.co2.value - AUTO_CONTROL_THRESHOLDS.co2.optimal.min) /
                    (AUTO_CONTROL_THRESHOLDS.co2.optimal.max - AUTO_CONTROL_THRESHOLDS.co2.optimal.min)
                );

                return Math.min(100, Math.max(50, Math.round((tempFactor + humidityFactor + co2Factor) * 50)));
            };

            // Control pompe în funcție de umiditatea solului
            const shouldActivateWaterPump = 
                currentGh.parameters.soilMoisture.value < AUTO_CONTROL_THRESHOLDS.soilMoisture.optimal.min;
            const shouldDeactivateWaterPump = 
                currentGh.parameters.soilMoisture.value > AUTO_CONTROL_THRESHOLDS.soilMoisture.optimal.max;

            // Control LED-uri bazat pe intensitatea luminii și perioada zilei
            const shouldActivateLeds = 
                isDay && currentGh.parameters.light.value < AUTO_CONTROL_THRESHOLDS.light.intensity.minimal.min;
            
            const calculateLedIntensity = () => {
                if (!isDay) return 0;
                const targetIntensity = AUTO_CONTROL_THRESHOLDS.light.intensity.optimal.min;
                const currentDeficit = Math.max(0, targetIntensity - currentGh.parameters.light.value);
                return Math.min(100, Math.round((currentDeficit / targetIntensity) * 100));
            };

            setGreenhouses(prev => {
                const updatedGh = { ...prev[currentGreenhouse] };

                // Actualizăm ventilatoarele
                if (shouldActivateFans) {
                    const fanPower = calculateFanPower();
                    updatedGh.fans = {
                        fan1: { ...updatedGh.fans.fan1, active: true, power: fanPower },
                        fan2: { ...updatedGh.fans.fan2, active: true, power: fanPower }
                    };
                } else if (shouldDeactivateFans) {
                    updatedGh.fans = {
                        fan1: { ...updatedGh.fans.fan1, active: false, power: 50 },
                        fan2: { ...updatedGh.fans.fan2, active: false, power: 50 }
                    };
                }

                // Actualizăm pompa de apă
                if (shouldActivateWaterPump) {
                    updatedGh.pumps = {
                        ...updatedGh.pumps,
                        waterPump: { ...updatedGh.pumps.waterPump, active: true, power: 75 }
                    };
                } else if (shouldDeactivateWaterPump) {
                    updatedGh.pumps = {
                        ...updatedGh.pumps,
                        waterPump: { ...updatedGh.pumps.waterPump, active: false, power: 50 }
                    };
                }

                // Actualizăm LED-urile
                const ledIntensity = calculateLedIntensity();
                updatedGh.leds = {
                    led1: { ...updatedGh.leds.led1, active: shouldActivateLeds, intensity: ledIntensity },
                    led2: { ...updatedGh.leds.led2, active: shouldActivateLeds, intensity: ledIntensity }
                };

                // Actualizăm statusul parametrilor
                const updateParameterStatus = (value, thresholds) => {
                    if (value < thresholds.critical.min || value > thresholds.critical.max) return 'critical';
                    if (value < thresholds.optimal.min || value > thresholds.optimal.max) return 'warning';
                    return 'normal';
                };

                updatedGh.parameters = {
                    ...updatedGh.parameters,
                    temperature: {
                        ...updatedGh.parameters.temperature,
                        status: updateParameterStatus(updatedGh.parameters.temperature.value, tempThresholds)
                    },
                    humidity: {
                        ...updatedGh.parameters.humidity,
                        status: updateParameterStatus(updatedGh.parameters.humidity.value, AUTO_CONTROL_THRESHOLDS.humidity)
                    },
                    soilMoisture: {
                        ...updatedGh.parameters.soilMoisture,
                        status: updateParameterStatus(updatedGh.parameters.soilMoisture.value, AUTO_CONTROL_THRESHOLDS.soilMoisture)
                    },
                    co2: {
                        ...updatedGh.parameters.co2,
                        status: updateParameterStatus(updatedGh.parameters.co2.value, AUTO_CONTROL_THRESHOLDS.co2)
                    }
                };

                return {
                    ...prev,
                    [currentGreenhouse]: updatedGh
                };
            });
        }
    };

    const navigate = useNavigate();
    const [hasNewAlerts, setHasNewAlerts] = useState(false);

    // Funcție pentru a naviga către pagina de alerte
    const goToAlerts = () => {
        navigate('/alerts');
        setHasNewAlerts(false);
    };

    // Modificăm useEffect-ul pentru a include verificarea alertelor
    useEffect(() => {
        let interval;
        if (mode === 'auto' && isProcessing) {
            interval = setInterval(() => {
                // Actualizăm parametrii
                setParameters(prev => {
                    const newParams = {
                        ...prev,
                        temperature: {
                            ...prev.temperature,
                            value: Math.max(20, Math.min(30, prev.temperature.value + (Math.random() - 0.5) * 2))
                        },
                        humidity: {
                            ...prev.humidity,
                            value: Math.max(50, Math.min(80, prev.humidity.value + (Math.random() - 0.5) * 5))
                        },
                        soilMoisture: {
                            ...prev.soilMoisture,
                            value: Math.max(60, Math.min(90, prev.soilMoisture.value + (Math.random() - 0.5) * 3))
                        },
                        co2: {
                            ...prev.co2,
                            value: Math.max(350, Math.min(1000, prev.co2.value + (Math.random() - 0.5) * 50))
                        },
                        light: {
                            ...prev.light,
                            value: Math.max(500, Math.min(2000, prev.light.value + (Math.random() - 0.5) * 100))
                        },
                        waterFlow: {
                            ...prev.waterFlow,
                            value: Math.max(1, Math.min(5, prev.waterFlow.value + (Math.random() - 0.5) * 0.5))
                        }
                    };

                    // Verificăm dacă există parametri în afara intervalelor optime
                    const isDay = isDaytime();
                    const tempThresholds = isDay ? 
                        AUTO_CONTROL_THRESHOLDS.temperature.day : 
                        AUTO_CONTROL_THRESHOLDS.temperature.night;

                    const hasWarning = 
                        newParams.temperature.value < tempThresholds.optimal.min ||
                        newParams.temperature.value > tempThresholds.optimal.max ||
                        newParams.humidity.value < AUTO_CONTROL_THRESHOLDS.humidity.optimal.min ||
                        newParams.humidity.value > AUTO_CONTROL_THRESHOLDS.humidity.optimal.max ||
                        newParams.soilMoisture.value < AUTO_CONTROL_THRESHOLDS.soilMoisture.optimal.min ||
                        newParams.soilMoisture.value > AUTO_CONTROL_THRESHOLDS.soilMoisture.optimal.max ||
                        newParams.co2.value < AUTO_CONTROL_THRESHOLDS.co2.optimal.min ||
                        newParams.co2.value > AUTO_CONTROL_THRESHOLDS.co2.optimal.max;

                    if (hasWarning) {
                        setHasNewAlerts(true);
                    }

                    return newParams;
                });

                // Aplicăm controlul automat după actualizarea parametrilor
                handleAutoControl();
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [mode, isProcessing]);

    const handleModeChange = (newMode) => {
        setMode(newMode);
        setIsProcessing(newMode === 'auto');
    };

    const handleParameterChange = (key, change) => {
        if (mode === 'manual') {
            setParameters(prev => ({
                ...prev,
                [key]: {
                    ...prev[key],
                    value: Math.round((prev[key].value + change) * 10) / 10
                }
            }));
        }
    };

    const getTrendIcon = (trend) => {
        switch (trend) {
            case 'up': return '↗️';
            case 'down': return '↘️';
            default: return '→';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'warning': return '#f6ad55';
            case 'critical': return '#f56565';
            default: return '#48bb78';
        }
    };

    const renderParameterCard = (key, data) => (
        <div key={key} className="card">
            <div className="parameter-box" style={{ '--status-color': getStatusColor(data.status) }}>
                <div className="parameter-header">
                    <span className="parameter-icon">{data.icon}</span>
                    <span className="parameter-label">{data.label}</span>
                </div>
                <div className="parameter-value">
                    {Math.round(data.value * 10) / 10}{data.unit}
                </div>
                <div className="parameter-trend">
                    {getTrendIcon(data.trend)}
                </div>
                {mode === 'manual' && (
                    <div className="parameter-controls">
                        <button 
                            className="control-btn decrease"
                            onClick={() => handleParameterChange(key, -1)}
                        >
                            -
                        </button>
                        <button 
                            className="control-btn increase"
                            onClick={() => handleParameterChange(key, 1)}
                        >
                            +
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    // Funcții pentru controlul ventilatoarelor
    const toggleFan = (fanId) => {
        setGreenhouses(prev => ({
            ...prev,
            [currentGreenhouse]: {
                ...prev[currentGreenhouse],
                fans: {
                    ...prev[currentGreenhouse].fans,
                    [fanId]: {
                        ...prev[currentGreenhouse].fans[fanId],
                        active: !prev[currentGreenhouse].fans[fanId].active
                    }
                }
            }
        }));
    };

    const adjustFanPower = (fanId, value) => {
        setGreenhouses(prev => ({
            ...prev,
            [currentGreenhouse]: {
                ...prev[currentGreenhouse],
                fans: {
                    ...prev[currentGreenhouse].fans,
                    [fanId]: {
                        ...prev[currentGreenhouse].fans[fanId],
                        power: Math.max(0, Math.min(100, value))
                    }
                }
            }
        }));
    };

    // Funcții pentru controlul ledurilor
    const toggleLed = (ledId) => {
        setGreenhouses(prev => ({
            ...prev,
            [currentGreenhouse]: {
                ...prev[currentGreenhouse],
                leds: {
                    ...prev[currentGreenhouse].leds,
                    [ledId]: {
                        ...prev[currentGreenhouse].leds[ledId],
                        active: !prev[currentGreenhouse].leds[ledId].active
                    }
                }
            }
        }));
    };

    const adjustLedIntensity = (ledId, value) => {
        setGreenhouses(prev => ({
            ...prev,
            [currentGreenhouse]: {
                ...prev[currentGreenhouse],
                leds: {
                    ...prev[currentGreenhouse].leds,
                    [ledId]: {
                        ...prev[currentGreenhouse].leds[ledId],
                        intensity: Math.max(0, Math.min(100, value))
                    }
                }
            }
        }));
    };

    // Funcții pentru controlul pompelor
    const togglePump = (pumpId) => {
        setGreenhouses(prev => ({
            ...prev,
            [currentGreenhouse]: {
                ...prev[currentGreenhouse],
                pumps: {
                    ...prev[currentGreenhouse].pumps,
                    [pumpId]: {
                        ...prev[currentGreenhouse].pumps[pumpId],
                        active: !prev[currentGreenhouse].pumps[pumpId].active
                    }
                }
            }
        }));
    };

    const adjustPumpPower = (pumpId, value) => {
        setGreenhouses(prev => ({
            ...prev,
            [currentGreenhouse]: {
                ...prev[currentGreenhouse],
                pumps: {
                    ...prev[currentGreenhouse].pumps,
                    [pumpId]: {
                        ...prev[currentGreenhouse].pumps[pumpId],
                        power: Math.max(0, Math.min(100, value))
                    }
                }
            }
        }));
    };

    // Funcție pentru controlul automat al sistemului
    const handleAutoControlSystem = () => {
        if (mode === 'auto') {
            handleAutoControl();
        }
    };

    // Calculează puterea pompei în funcție de diferența de umiditate
    const calculatePumpPower = (currentHumidity, targetHumidity) => {
        const difference = targetHumidity - currentHumidity;
        // Puterea crește proporțional cu diferența de umiditate
        // Minim 60%, maxim 100%
        const power = Math.min(100, Math.max(60, 60 + difference * 10));
        return Math.round(power);
    };

    // Funcție pentru calcularea efectului pompelor de căldură
    const calculateHeatPumpEffect = () => {
        const activeHeatPumps = Object.entries(pumps)
            .filter(([_, pump]) => pump.type === 'heat' && pump.active)
            .map(([_, pump]) => pump.power);

        if (activeHeatPumps.length === 0) return 0;

        // Calculăm efectul total al pompelor active
        // 4 grade pe oră = 0.0011111 grade pe secundă (4/3600)
        const baseHeatingRate = 0.0011111;
        const totalEffect = activeHeatPumps.reduce((sum, power) => sum + (power / 100), 0);
        
        return baseHeatingRate * totalEffect;
    };

    // Funcție pentru calcularea efectului sistemului de răcire
    const calculateCoolingEffect = () => {
        const coolingSystem = pumps.coolingSystem;
        if (!coolingSystem.active) return 0;

        // 5 grade pe oră = 0.001389 grade pe secundă (5/3600)
        const baseCoolingRate = 0.001389;
        return baseCoolingRate * (coolingSystem.power / 100);
    };

    // Modificăm funcția de actualizare a parametrilor pentru a include efectul răcirii
    const updateParameters = () => {
        setParameters(prev => {
            const newParams = { ...prev };
            
            // Calculăm efectele încălzirii și răcirii
            const heatPumpEffect = calculateHeatPumpEffect();
            const coolingEffect = calculateCoolingEffect();
            
            // Actualizăm temperatura în funcție de efectele combinate
            const netEffect = heatPumpEffect - coolingEffect;
            
            if (netEffect > 0 && prev.temperature.value < targetTemperature) {
                newParams.temperature.value = Math.min(
                    targetTemperature,
                    prev.temperature.value + netEffect
                );
            } else if (netEffect < 0 && prev.temperature.value > targetTemperature) {
                newParams.temperature.value = Math.max(
                    targetTemperature,
                    prev.temperature.value + netEffect
                );
            } else {
                // Scădere/creștere naturală a temperaturii când sistemele sunt oprite
                if (prev.temperature.value > targetTemperature) {
                    newParams.temperature.value = Math.max(
                        targetTemperature,
                        prev.temperature.value - 0.00028
                    );
                } else if (prev.temperature.value < targetTemperature) {
                    newParams.temperature.value = Math.min(
                        targetTemperature,
                        prev.temperature.value + 0.00028
                    );
                }
            }

            // Actualizăm trendul temperaturii
            newParams.temperature.trend = 
                newParams.temperature.value > prev.temperature.value ? 'up' :
                newParams.temperature.value < prev.temperature.value ? 'down' : 'stable';

            return newParams;
        });
    };

    // Adăugăm controlul temperaturii țintă în interfață
    const adjustTargetTemperature = (change) => {
        setGreenhouses(prev => ({
            ...prev,
            [currentGreenhouse]: {
                ...prev[currentGreenhouse],
                targetTemperature: Math.max(15, Math.min(35, prev[currentGreenhouse].targetTemperature + change))
            }
        }));
    };

    useEffect(() => {
        // Interval pentru actualizarea parametrilor și controlul automat
        const interval = setInterval(() => {
            updateParameters();
            handleAutoControlSystem();
        }, 3000); // Actualizare la fiecare 3 secunde

        return () => clearInterval(interval);
    }, [mode, parameters, pumps]);

    // Adăugăm state pentru managementul serelor
    const [greenhouses, setGreenhouses] = useState({
        sera1: {
            id: 'sera1',
            name: 'Sera Principală',
            type: 'Roșii',
            status: 'active',
            lastUpdate: new Date().toISOString(),
            fans: {
                fan1: { active: false, power: 50, label: 'Ventilator 1' },
                fan2: { active: false, power: 50, label: 'Ventilator 2' }
            },
            leds: {
                led1: { active: false, intensity: 50, label: 'LED Principal' },
                led2: { active: false, intensity: 50, label: 'LED Secundar' }
            },
            pumps: {
                waterPump: { active: false, power: 50, label: 'Pompă Apă' },
                mixPump: { active: false, power: 50, label: 'Pompă Mix' },
                heatPump1: { active: false, power: 50, label: 'Pompă Căldură 1', type: 'heat' },
                heatPump2: { active: false, power: 50, label: 'Pompă Căldură 2', type: 'heat' }
            },
            parameters: {
                temperature: { 
                    value: 25, 
                    unit: '°C', 
                    trend: 'stable',
                    status: 'normal',
                    icon: '🌡️',
                    label: 'Temperatură',
                    category: 'climate'
                },
                humidity: { 
                    value: 65, 
                    unit: '%', 
                    trend: 'up',
                    status: 'normal',
                    icon: '💧',
                    label: 'Umiditate Aer',
                    category: 'climate',
                    min: 60,
                    max: 80
                },
                soilMoisture: { 
                    value: 70, 
                    unit: '%', 
                    trend: 'down',
                    status: 'normal',
                    icon: '🌱',
                    label: 'Umiditate Sol',
                    category: 'irrigation'
                },
                waterFlow: { 
                    value: 2.5, 
                    unit: 'L/min', 
                    trend: 'stable',
                    status: 'normal',
                    icon: '🚰',
                    label: 'Debit Apă',
                    category: 'irrigation'
                },
                co2: { 
                    value: 450, 
                    unit: 'ppm', 
                    trend: 'stable',
                    status: 'normal',
                    icon: '☁️',
                    label: 'Nivel CO₂',
                    category: 'climate'
                },
                light: { 
                    value: 800, 
                    unit: 'lux', 
                    trend: 'up',
                    status: 'warning',
                    icon: '☀️',
                    label: 'Intensitate Lumină',
                    category: 'climate'
                }
            },
            targetTemperature: 25,
            mode: 'manual',
            isProcessing: false
        }
    });

    const [currentGreenhouse, setCurrentGreenhouse] = useState('sera1');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newGreenhouseData, setNewGreenhouseData] = useState({
        name: '',
        type: 'Roșii',
        location: ''
    });

    // Funcție pentru adăugarea unei sere noi
    const addGreenhouse = () => {
        const newId = `sera${Object.keys(greenhouses).length + 1}`;
        setGreenhouses(prev => ({
            ...prev,
            [newId]: {
                id: newId,
                name: newGreenhouseData.name,
                type: newGreenhouseData.type,
                location: newGreenhouseData.location,
                status: 'active',
                lastUpdate: new Date().toISOString(),
                fans: {
                    fan1: { active: false, power: 50, label: 'Ventilator 1' },
                    fan2: { active: false, power: 50, label: 'Ventilator 2' }
                },
                leds: {
                    led1: { active: false, intensity: 50, label: 'LED Principal' },
                    led2: { active: false, intensity: 50, label: 'LED Secundar' }
                },
                pumps: {
                    waterPump: { active: false, power: 50, label: 'Pompă Apă' },
                    mixPump: { active: false, power: 50, label: 'Pompă Mix' },
                    heatPump1: { active: false, power: 50, label: 'Pompă Căldură 1', type: 'heat' },
                    heatPump2: { active: false, power: 50, label: 'Pompă Căldură 2', type: 'heat' }
                },
                parameters: { ...greenhouses.sera1.parameters },
                targetTemperature: 25,
                mode: 'manual',
                isProcessing: false
            }
        }));
        setShowAddModal(false);
        setNewGreenhouseData({ name: '', type: 'Roșii', location: '' });
    };

    // Funcție pentru actualizarea unei sere
    const updateGreenhouse = (id, data) => {
        setGreenhouses(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                ...data,
                lastUpdate: new Date().toISOString()
            }
        }));
    };

    return (
        <div className="dashboard">
            <div className="greenhouse-selector">
                <div className="selector-header">
                    <h2>Selectare Seră</h2>
                    <button 
                        className="add-greenhouse-btn"
                        onClick={() => setShowAddModal(true)}
                    >
                        + Adaugă Seră Nouă
                    </button>
                </div>
                <div className="greenhouses-list">
                    {Object.values(greenhouses).map(greenhouse => (
                        <div 
                            key={greenhouse.id}
                            className={`greenhouse-card ${currentGreenhouse === greenhouse.id ? 'active' : ''}`}
                            onClick={() => setCurrentGreenhouse(greenhouse.id)}
                        >
                            <div className="greenhouse-info">
                                <h3>{greenhouse.name}</h3>
                                <span className="greenhouse-type">{greenhouse.type}</span>
                                {greenhouse.location && (
                                    <span className="greenhouse-location">{greenhouse.location}</span>
                                )}
                            </div>
                            <div className="greenhouse-status">
                                <span className={`status-indicator ${greenhouse.status}`} />
                                <span className="last-update">
                                    Ultima actualizare: {new Date(greenhouse.lastUpdate).toLocaleTimeString()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal pentru adăugare seră nouă */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Adaugă Seră Nouă</h2>
                        <div className="form-group">
                            <label>Nume Seră</label>
                            <input
                                type="text"
                                value={newGreenhouseData.name}
                                onChange={(e) => setNewGreenhouseData(prev => ({
                                    ...prev,
                                    name: e.target.value
                                }))}
                                placeholder="Introdu numele serei"
                            />
                        </div>
                        <div className="form-group">
                            <label>Tip Cultură</label>
                            <select
                                value={newGreenhouseData.type}
                                onChange={(e) => setNewGreenhouseData(prev => ({
                                    ...prev,
                                    type: e.target.value
                                }))}
                            >
                                <option value="Roșii">Roșii</option>
                                <option value="Castraveți">Castraveți</option>
                                <option value="Ardei">Ardei</option>
                                <option value="Salată">Salată</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Locație</label>
                            <input
                                type="text"
                                value={newGreenhouseData.location}
                                onChange={(e) => setNewGreenhouseData(prev => ({
                                    ...prev,
                                    location: e.target.value
                                }))}
                                placeholder="Introdu locația serei"
                            />
                        </div>
                        <div className="modal-actions">
                            <button 
                                className="cancel-btn"
                                onClick={() => setShowAddModal(false)}
                            >
                                Anulează
                            </button>
                            <button 
                                className="add-btn"
                                onClick={addGreenhouse}
                                disabled={!newGreenhouseData.name}
                            >
                                Adaugă Seră
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="dashboard-content">
                <div className="dashboard-header">
                    <h2 className="dashboard-title">Panou de Control</h2>
                    <button 
                        className={`alerts-button ${hasNewAlerts ? 'has-alerts' : ''}`}
                        onClick={goToAlerts}
                    >
                        <span className="alerts-icon">🔔</span>
                        {hasNewAlerts && <span className="alerts-badge" />}
                    </button>
                </div>
                
                <div className="mode-selector">
                    <button 
                        className={`mode-button ${mode === 'auto' ? 'active' : ''}`}
                        onClick={() => handleModeChange('auto')}
                    >
                        <span className="mode-icon">🤖</span>
                        Mod Automat
                        {mode === 'auto' && isProcessing && (
                            <span className="processing-indicator">
                                <span className="dot">•</span>
                                <span className="dot">•</span>
                                <span className="dot">•</span>
                            </span>
                        )}
                    </button>
                    <button 
                        className={`mode-button ${mode === 'manual' ? 'active' : ''}`}
                        onClick={() => handleModeChange('manual')}
                    >
                        <span className="mode-icon">🔧</span>
                        Ajustare Manuală
                    </button>
                </div>

                <div className="controls-section">
                    <h3 className="section-title">Ventilatoare și LED-uri</h3>
                    <div className="controls-grid">
                        {/* Controlul Ventilatoarelor */}
                        {Object.entries(greenhouses[currentGreenhouse].fans).map(([fanId, fan]) => (
                            <div key={fanId} className="control-card">
                                <div className="control-header">
                                    <span className="control-icon">💨</span>
                                    <span className="control-label">{fan.label}</span>
                                </div>
                                <div className="control-status">
                                    <button 
                                        className={`toggle-btn ${fan.active ? 'active' : ''}`}
                                        onClick={() => toggleFan(fanId)}
                                    >
                                        {fan.active ? 'PORNIT' : 'OPRIT'}
                                    </button>
                                </div>
                                <div className="control-slider">
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={fan.power}
                                        onChange={(e) => adjustFanPower(fanId, parseInt(e.target.value))}
                                        disabled={!fan.active}
                                    />
                                    <span className="slider-value">{fan.power}%</span>
                                </div>
                            </div>
                        ))}

                        {/* Controlul LED-urilor */}
                        {Object.entries(greenhouses[currentGreenhouse].leds).map(([ledId, led]) => (
                            <div key={ledId} className="control-card">
                                <div className="control-header">
                                    <span className="control-icon">💡</span>
                                    <span className="control-label">{led.label}</span>
                                </div>
                                <div className="control-status">
                                    <button 
                                        className={`toggle-btn ${led.active ? 'active' : ''}`}
                                        onClick={() => toggleLed(ledId)}
                                    >
                                        {led.active ? 'PORNIT' : 'OPRIT'}
                                    </button>
                                </div>
                                <div className="control-slider">
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={led.intensity}
                                        onChange={(e) => adjustLedIntensity(ledId, parseInt(e.target.value))}
                                        disabled={!led.active}
                                    />
                                    <span className="slider-value">{led.intensity}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="controls-section">
                    <h3 className="section-title">Pompe de Apă</h3>
                    <div className="controls-grid">
                        {Object.entries(greenhouses[currentGreenhouse].pumps)
                            .filter(([_, pump]) => !pump.type || pump.type !== 'heat')
                            .map(([pumpId, pump]) => (
                                <div key={pumpId} className="control-card pump-card">
                                    <div className="control-header">
                                        <span className="control-icon">💧</span>
                                        <span className="control-label">{pump.label}</span>
                                    </div>
                                    <div className="control-status">
                                        <button 
                                            className={`toggle-btn ${pump.active ? 'active' : ''}`}
                                            onClick={() => togglePump(pumpId)}
                                        >
                                            {pump.active ? 'PORNIT' : 'OPRIT'}
                                        </button>
                                    </div>
                                    <div className="control-slider">
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={pump.power}
                                            onChange={(e) => adjustPumpPower(pumpId, parseInt(e.target.value))}
                                            disabled={!pump.active}
                                        />
                                        <span className="slider-value">{pump.power}%</span>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>

                <div className="controls-section">
                    <h3 className="section-title">Pompe de Căldură</h3>
                    <div className="temperature-control">
                        <div className="target-temperature">
                            <span className="temperature-label">Temperatura Țintă:</span>
                            <div className="temperature-adjust">
                                <button 
                                    className="temp-btn" 
                                    onClick={() => adjustTargetTemperature(-0.5)}
                                >
                                    -
                                </button>
                                <span className="temp-value">{greenhouses[currentGreenhouse].targetTemperature}°C</span>
                                <button 
                                    className="temp-btn" 
                                    onClick={() => adjustTargetTemperature(0.5)}
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="controls-grid">
                        {Object.entries(greenhouses[currentGreenhouse].pumps)
                            .filter(([_, pump]) => pump.type === 'heat')
                            .map(([pumpId, pump]) => (
                                <div key={pumpId} className="control-card heat-pump-card">
                                    <div className="control-header">
                                        <span className="control-icon">🌡️</span>
                                        <span className="control-label">{pump.label}</span>
                                    </div>
                                    <div className="control-status">
                                        <button 
                                            className={`toggle-btn ${pump.active ? 'active' : ''}`}
                                            onClick={() => togglePump(pumpId)}
                                        >
                                            {pump.active ? 'PORNIT' : 'OPRIT'}
                                        </button>
                                    </div>
                                    <div className="control-slider">
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={pump.power}
                                            onChange={(e) => adjustPumpPower(pumpId, parseInt(e.target.value))}
                                            disabled={!pump.active}
                                        />
                                        <span className="slider-value">{pump.power}%</span>
                                    </div>
                                    {pump.active && (
                                        <div className="heating-rate">
                                            Rata de încălzire: {((pump.power / 100) * 4).toFixed(1)}°C/oră
                                        </div>
                                    )}
                                </div>
                            ))}
                    </div>
                </div>

                <div className="controls-section">
                    <h3 className="section-title">Sistem de Răcire</h3>
                    <div className="controls-grid">
                        <div className="control-card cooling-system-card">
                            <div className="control-header">
                                <span className="control-icon">❄️</span>
                                <span className="control-label">Sistem Răcire cu Apă</span>
                            </div>
                            <div className="control-status">
                                <button 
                                    className={`toggle-btn ${pumps.coolingSystem.active ? 'active' : ''}`}
                                    onClick={() => togglePump('coolingSystem')}
                                >
                                    {pumps.coolingSystem.active ? 'PORNIT' : 'OPRIT'}
                                </button>
                            </div>
                            <div className="control-slider">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={pumps.coolingSystem.power}
                                    onChange={(e) => adjustPumpPower('coolingSystem', parseInt(e.target.value))}
                                    disabled={!pumps.coolingSystem.active}
                                />
                                <span className="slider-value">{pumps.coolingSystem.power}%</span>
                            </div>
                            {pumps.coolingSystem.active && (
                                <div className="cooling-rate">
                                    Rata de răcire: {((pumps.coolingSystem.power / 100) * 5).toFixed(1)}°C/oră
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="dashboard-grid">
                    {Object.entries(greenhouses[currentGreenhouse].parameters).map(([key, data]) => renderParameterCard(key, data))}
                </div>
            </div>

            <style jsx>{`
                .dashboard {
                    padding: 1rem;
                    max-width: 100%;
                    margin: 0 auto;
                    background: #f8fafc;
                    min-height: 100vh;
                    overflow-x: hidden;
                }

                .dashboard-title {
                    font-size: 1.75rem;
                    text-align: center;
                    color: #1e293b;
                    margin: 1rem 0 1.5rem;
                }

                .mode-selector {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                    margin-bottom: 1.5rem;
                    padding: 0 0.5rem;
                }

                .mode-button {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    padding: 1.25rem;
                    border: none;
                    border-radius: 12px;
                    font-size: 1.1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    background: #f1f5f9;
                    color: #64748b;
                    width: 100%;
                    -webkit-tap-highlight-color: transparent;
                    touch-action: manipulation;
                }

                .mode-button:active {
                    transform: scale(0.98);
                }

                .mode-button.active {
                    background: #2563eb;
                    color: white;
                    box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
                }

                .controls-section {
                    margin: 1rem 0;
                    background: white;
                    border-radius: 16px;
                    padding: 1.25rem;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }

                .section-title {
                    font-size: 1.2rem;
                    font-weight: 600;
                    color: #1e293b;
                    margin-bottom: 1.25rem;
                    padding-left: 0.5rem;
                    border-left: 4px solid #2563eb;
                }

                .controls-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 1rem;
                }

                .control-card {
                    background: #f8fafc;
                    border-radius: 12px;
                    padding: 1.25rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    touch-action: manipulation;
                }

                .control-header {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .control-icon {
                    font-size: 1.5rem;
                }

                .control-label {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: #1e293b;
                }

                .toggle-btn {
                    padding: 1rem;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    background: #e2e8f0;
                    color: #64748b;
                    width: 100%;
                    font-size: 1rem;
                    -webkit-tap-highlight-color: transparent;
                    touch-action: manipulation;
                }

                .toggle-btn:active {
                    transform: scale(0.95);
                    background: #e2e8f0;
                }

                .control-slider {
                    padding: 0.5rem 0;
                }

                .control-slider input[type="range"] {
                    width: 100%;
                    height: 8px;
                    -webkit-appearance: none;
                    background: #e2e8f0;
                    border-radius: 4px;
                    outline: none;
                    margin: 1rem 0;
                }

                .control-slider input[type="range"]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 28px;
                    height: 28px;
                    background: #2563eb;
                    border-radius: 50%;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: 2px solid white;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                }

                .control-slider input[type="range"]:disabled {
                    opacity: 0.5;
                }

                .slider-value {
                    font-size: 1rem;
                    font-weight: 600;
                    color: #64748b;
                    margin-top: 0.5rem;
                }

                .dashboard-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 1rem;
                    padding: 0.5rem;
                }

                .card {
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    transition: transform 0.3s ease;
                    border-left: 4px solid var(--status-color);
                }

                .parameter-box {
                    padding: 1.25rem;
                    text-align: center;
                }

                .parameter-value {
                    font-size: 2rem;
                    font-weight: 700;
                    color: #2563eb;
                    margin: 0.75rem 0;
                }

                .parameter-controls {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 1rem;
                    margin-top: 1rem;
                }

                .control-btn {
                    width: 100%;
                    height: 44px;
                    border: none;
                    border-radius: 8px;
                    background: #f1f5f9;
                    color: #64748b;
                    font-size: 1.25rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    -webkit-tap-highlight-color: transparent;
                    touch-action: manipulation;
                }

                .control-btn:active {
                    transform: scale(0.95);
                    background: #e2e8f0;
                }

                /* Optimizări pentru tablete */
                @media (min-width: 768px) {
                    .dashboard {
                        padding: 1.5rem;
                    }

                    .controls-grid {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 1.5rem;
                    }

                    .dashboard-grid {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 1.5rem;
                    }

                    .mode-selector {
                        flex-direction: row;
                        justify-content: center;
                    }

                    .mode-button {
                        width: auto;
                        min-width: 200px;
                    }
                }

                /* Optimizări pentru desktop */  In asa fel se vede bine si dupa pc
                @media (min-width: 1024px) {
                    .dashboard {
                        padding: 2rem;
                    }

                    .controls-grid {
                        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    }

                    .dashboard-grid {
                        grid-template-columns: repeat(3, 1fr);
                    }
                }

                /* Optimizări pentru touch */
                @media (hover: none) {
                    .mode-button:hover,
                    .control-btn:hover,
                    .toggle-btn:hover {
                        transform: none;
                    }
                }

                /* Optimizări pentru landscape pe mobil */ In  acest fel facem optimizarea pentru telefon
                @media (max-height: 500px) and (orientation: landscape) {
                    .dashboard {
                        padding: 0.75rem;
                    }

                    .controls-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }

                    .control-card {
                        padding: 1rem;
                    }

                    .parameter-box {
                        padding: 1rem;
                    }
                }

                /* Dezactivare highlight la atingere pe iOS */
                * {
                    -webkit-tap-highlight-color: transparent;
                }

                .dashboard-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }

                .alerts-button {
                    position: relative;
                    padding: 0.75rem;
                    border: none;
                    border-radius: 50%;
                    background: #f1f5f9;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .alerts-button:hover {
                    background: #e2e8f0;
                }

                .alerts-button.has-alerts {
                    animation: pulse 2s infinite;
                }

                .alerts-icon {
                    font-size: 1.5rem;
                }

                .alerts-badge {
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 12px;
                    height: 12px;
                    background: #ef4444;
                    border-radius: 50%;
                    border: 2px solid white;
                }

                @keyframes pulse {
                    0% {
                        transform: scale(1);
                    }
                    50% {
                        transform: scale(1.1);
                    }
                    100% {
                        transform: scale(1);
                    }
                }

                .heat-pump-card {
                    background: #fff5f5;
                    border-left: 4px solid #f56565;
                }

                .heat-pump-card .toggle-btn.active {
                    background: #f56565;
                    color: white;
                }

                .heat-pump-card .control-slider input[type="range"] {
                    background: #fed7d7;
                }

                .heat-pump-card .control-slider input[type="range"]::-webkit-slider-thumb {
                    background: #f56565;
                }

                .temperature-control {
                    background: white;
                    border-radius: 12px;
                    padding: 1rem;
                    margin-bottom: 1rem;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }

                .target-temperature {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 1rem;
                }

                .temperature-label {
                    font-size: 1.1rem;
                    color: #1e293b;
                    font-weight: 600;
                }

                .temperature-adjust {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .temp-btn {
                    width: 40px;
                    height: 40px;
                    border: none;
                    border-radius: 8px;
                    background: #f56565;
                    color: white;
                    font-size: 1.25rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .temp-btn:hover {
                    background: #e53e3e;
                }

                .temp-value {
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: #2d3748;
                    min-width: 80px;
                    text-align: center;
                }

                .heating-rate {
                    margin-top: 0.5rem;
                    padding: 0.5rem;
                    background: #fed7d7;
                    border-radius: 6px;
                    font-size: 0.875rem;
                    color: #c53030;
                    text-align: center;
                }

                @media (max-width: 768px) {
                    .target-temperature {
                        flex-direction: column;
                        align-items: stretch;
                        text-align: center;
                    }

                    .temperature-adjust {
                        justify-content: center;
                    }
                }

                .greenhouse-selector {
                    background: white;
                    border-radius: 12px;
                    padding: 1.5rem;
                    margin-bottom: 2rem;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }

                .selector-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }

                .add-greenhouse-btn {
                    padding: 0.75rem 1.5rem;
                    background: #2563eb;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .greenhouses-list {
                    display: grid;
                    gap: 1rem;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                }

                .greenhouse-card {
                    background: #f8fafc;
                    border: 2px solid transparent;
                    border-radius: 10px;
                    padding: 1rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .greenhouse-card.active {
                    border-color: #2563eb;
                    background: #eff6ff;
                }

                .greenhouse-info h3 {
                    margin: 0;
                    color: #1e293b;
                }

                .greenhouse-type {
                    display: inline-block;
                    padding: 0.25rem 0.75rem;
                    background: #e0f2fe;
                    color: #0369a1;
                    border-radius: 999px;
                    font-size: 0.875rem;
                    margin-top: 0.5rem;
                }

                .greenhouse-location {
                    display: block;
                    color: #64748b;
                    font-size: 0.875rem;
                    margin-top: 0.5rem;
                }

                .greenhouse-status {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-top: 1rem;
                }

                .status-indicator {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #22c55e;
                }

                .status-indicator.inactive {
                    background: #94a3b8;
                }

                .last-update {
                    font-size: 0.875rem;
                    color: #64748b;
                }

                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                }

                .modal-content {
                    background: white;
                    border-radius: 12px;
                    padding: 2rem;
                    width: 90%;
                    max-width: 500px;
                }

                .form-group {
                    margin-bottom: 1.5rem;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 0.5rem;
                    color: #1e293b;
                    font-weight: 500;
                }

                .form-group input,
                .form-group select {
                    width: 100%;
                    padding: 0.75rem;
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                    font-size: 1rem;
                }

                .modal-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                    margin-top: 2rem;
                }

                .cancel-btn {
                    padding: 0.75rem 1.5rem;
                    background: #f1f5f9;
                    color: #64748b;
                    border: none;
                    border-radius: 6px;
                    font-weight: 600;
                    cursor: pointer;
                }

                .add-btn {
                    padding: 0.75rem 1.5rem;
                    background: #2563eb;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    font-weight: 600;
                    cursor: pointer;
                }

                .add-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                @media (max-width: 768px) {
                    .greenhouse-selector {
                        padding: 1rem;
                    }

                    .selector-header {
                        flex-direction: column;
                        gap: 1rem;
                    }

                    .add-greenhouse-btn {
                        width: 100%;
                    }

                    .greenhouses-list {
                        grid-template-columns: 1fr;
                    }
                }

                .cooling-system-card {
                    background: #f0f9ff;
                    border-left: 4px solid #0ea5e9;
                }

                .cooling-system-card .toggle-btn.active {
                    background: #0ea5e9;
                    color: white;
                }

                .cooling-system-card .control-slider input[type="range"] {
                    background: #e0f2fe;
                }

                .cooling-system-card .control-slider input[type="range"]::-webkit-slider-thumb {
                    background: #0ea5e9;
                }

                .cooling-rate {
                    margin-top: 0.5rem;
                    padding: 0.5rem;
                    background: #e0f2fe;
                    border-radius: 6px;
                    font-size: 0.875rem;
                    color: #0369a1;
                    text-align: center;
                }
            `}</style>
        </div>
    );
}

export default Dashboard; 