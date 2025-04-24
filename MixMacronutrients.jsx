import { useState, useEffect } from 'react';
import '../App.css';

function MixMacronutrients() {
    // Starea pentru valorile curente ale macronutrienților
    const [nutrients, setNutrients] = useState({
        nitrogen: {
            current: 120,
            min: 100,
            max: 150,
            unit: 'ppm',
            name: 'Azot (N)',
            description: 'Excesul de azot poate duce la creștere excesivă în detrimentul fructificării.',
            pumpActive: false,
            pumpSpeed: 50 // 0-100%
        },
        phosphorus: {
            current: 45,
            min: 40,
            max: 60,
            unit: 'ppm',
            name: 'Fosfor (P)',
            description: 'Susține dezvoltarea rădăcinilor și înflorirea. Surse: Superfosfat, fosfat monoamoniu, făină de oase.',
            info: 'Fosforul trebuie menținut la un nivel echilibrat, deoarece excesul poate bloca absorbția altor micronutrienți.',
            pumpActive: false,
            pumpSpeed: 50
        },
        potassium: {
            current: 180,
            min: 150,
            max: 250,
            unit: 'ppm',
            name: 'Potasiu (K)',
            description: 'Esențial pentru calitatea fructelor, culoare, fermitate și rezistență la boli. Surse: Sulfat de potasiu, azotat de potasiu, cenușă de lemn.',
            info: 'Deficiența de potasiu duce la margini îngălbenite și fructe de calitate slabă.',
            pumpActive: false,
            pumpSpeed: 50
        },
        ph: {
            current: 6.2,
            min: 5.5,
            max: 6.8,
            optimal: { min: 6.0, max: 6.5 },
            unit: 'pH',
            name: 'pH-ul solului',
            description: 'Influențează absorbția nutrienților.',
            info: 'Corectare: Dacă pH-ul este prea acid (< 6.0): adaugă var agricol sau dolomită. Dacă pH-ul este prea alcalin (> 6.8): adaugă sulf elemental sau turbă.',
            pumpActive: false,
            pumpSpeed: 50
        }
    });

    // Funcție pentru actualizarea valorilor pompelor
    const updatePumpSettings = (nutrient, active, speed = null) => {
        setNutrients(prev => ({
            ...prev,
            [nutrient]: {
                ...prev[nutrient],
                pumpActive: active,
                pumpSpeed: speed !== null ? speed : prev[nutrient].pumpSpeed
            }
        }));
    };

    // Funcție pentru simularea schimbării valorilor în timp real
    useEffect(() => {
        const interval = setInterval(() => {
            // Simulăm schimbări mici în valorile nutrienților
            setNutrients(prev => {
                const newValues = { ...prev };
                
                // Actualizăm valorile în funcție de starea pompelor
                Object.keys(newValues).forEach(key => {
                    const nutrient = newValues[key];
                    if (nutrient.pumpActive) {
                        // Dacă pompa este activă, ajustăm valoarea în funcție de viteza pompei
                        const change = (nutrient.pumpSpeed / 1000) * (key === 'ph' ? 0.1 : 2);
                        let newValue = nutrient.current + change;
                        
                        // Ne asigurăm că valoarea rămâne în limite rezonabile
                        if (key === 'ph') {
                            newValue = Math.min(Math.max(newValue, 4.5), 8.0);
                        } else {
                            newValue = Math.min(Math.max(newValue, nutrient.min * 0.5), nutrient.max * 1.5);
                        }
                        
                        nutrient.current = parseFloat(newValue.toFixed(key === 'ph' ? 1 : 0));
                    } else {
                        // Simulăm o mică fluctuație naturală
                        const randomChange = (Math.random() - 0.5) * (key === 'ph' ? 0.05 : 1);
                        let newValue = nutrient.current + randomChange;
                        
                        // Ne asigurăm că valoarea rămâne în limite rezonabile
                        if (key === 'ph') {
                            newValue = Math.min(Math.max(newValue, 4.5), 8.0);
                        } else {
                            newValue = Math.min(Math.max(newValue, nutrient.min * 0.5), nutrient.max * 1.5);
                        }
                        
                        nutrient.current = parseFloat(newValue.toFixed(key === 'ph' ? 1 : 0));
                    }
                });
                
                return newValues;
            });
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    // Funcție pentru determinarea clasei CSS în funcție de valoarea curentă
    const getStatusClass = (current, min, max) => {
        if (current < min) return 'status-low';
        if (current > max) return 'status-high';
        return 'status-optimal';
    };

    // Funcție pentru determinarea procentului pentru bara de progres
    const getPercentage = (current, min, max) => {
        // Calculăm procentul, dar îl limităm între 0 și 100
        const percentage = ((current - min) / (max - min)) * 100;
        return Math.min(Math.max(percentage, 0), 100);
    };

    return (
        <div className="page-container">
            <h1>Mix Macronutrienți</h1>
            <p className="page-description">
                Monitorizare și control al nivelurilor de macronutrienți și pH pentru optimizarea creșterii plantelor. 
                Aici puteti seta valorile pentru macronutrienții doriti si monitoriza nivelurile lor in timp real.
                De asemenea puteti porni si opri pompele pentru fiecare macronutrient in parte.
                Dar apa trebuie pornita in momentul in care se adauga macronutrienți.
            </p>

            <div className="nutrients-grid">
                {Object.entries(nutrients).map(([key, nutrient]) => (
                    <div key={key} className={`nutrient-card ${getStatusClass(nutrient.current, nutrient.min, nutrient.max)}`}>
                        <div className="nutrient-header">
                            <h2>{nutrient.name}</h2>
                            <div className="nutrient-value">
                                <span className="current-value">{nutrient.current}</span>
                                <span className="unit">{nutrient.unit}</span>
                            </div>
                        </div>

                        <div className="progress-container">
                            <div className="progress-bar">
                                <div 
                                    className="progress-fill" 
                                    style={{ width: `${getPercentage(nutrient.current, nutrient.min, nutrient.max)}%` }}
                                ></div>
                                {key === 'ph' && (
                                    <div 
                                        className="optimal-range" 
                                        style={{ 
                                            left: `${getPercentage(nutrient.optimal.min, nutrient.min, nutrient.max)}%`,
                                            width: `${getPercentage(nutrient.optimal.max, nutrient.min, nutrient.max) - getPercentage(nutrient.optimal.min, nutrient.min, nutrient.max)}%`
                                        }}
                                    ></div>
                                )}
                            </div>
                            <div className="range-labels">
                                <span>{nutrient.min}</span>
                                {key === 'ph' && <span className="optimal-label">Optim: {nutrient.optimal.min}-{nutrient.optimal.max}</span>}
                                <span>{nutrient.max}</span>
                            </div>
                        </div>

                        <p className="nutrient-description">{nutrient.description}</p>
                        {nutrient.info && <p className="nutrient-info">{nutrient.info}</p>}

                        <div className="pump-controls">
                            <h3>Control Pompă {key === 'ph' ? 'Ca' : nutrient.name.split(' ')[0]}</h3>
                            <div className="pump-status">
                                <span>Status: </span>
                                <span className={nutrient.pumpActive ? 'status-active' : 'status-inactive'}>
                                    {nutrient.pumpActive ? 'Activă' : 'Inactivă'}
                                </span>
                            </div>
                            <div className="pump-buttons">
                                <button 
                                    className={`pump-button ${nutrient.pumpActive ? 'active' : ''}`}
                                    onClick={() => updatePumpSettings(key, !nutrient.pumpActive)}
                                >
                                    {nutrient.pumpActive ? 'Oprește' : 'Pornește'}
                                </button>
                            </div>
                            <div className="pump-speed">
                                <label htmlFor={`${key}-speed`}>Viteză pompă: {nutrient.pumpSpeed}%</label>
                                <input 
                                    type="range" 
                                    id={`${key}-speed`}
                                    min="0" 
                                    max="100" 
                                    value={nutrient.pumpSpeed}
                                    onChange={(e) => updatePumpSettings(key, nutrient.pumpActive, parseInt(e.target.value))}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="recommendations-section">
                <h2>Recomandări pentru Echilibrarea Nutrienților</h2>
                <ul>
                    {nutrients.nitrogen.current < nutrients.nitrogen.min && (
                        <li>Nivelul de Azot este scăzut. Considerați adăugarea de îngrășământ cu azot.</li>
                    )}
                    {nutrients.nitrogen.current > nutrients.nitrogen.max && (
                        <li>Nivelul de Azot este ridicat. Reduceți aplicarea îngrășămintelor cu azot.</li>
                    )}
                    {nutrients.phosphorus.current < nutrients.phosphorus.min && (
                        <li>Nivelul de Fosfor este scăzut. Considerați adăugarea de superfosfat sau fosfat monoamoniu.</li>
                    )}
                    {nutrients.phosphorus.current > nutrients.phosphorus.max && (
                        <li>Nivelul de Fosfor este ridicat. Acest lucru poate bloca absorbția altor micronutrienți.</li>
                    )}
                    {nutrients.potassium.current < nutrients.potassium.min && (
                        <li>Nivelul de Potasiu este scăzut. Considerați adăugarea de sulfat de potasiu sau azotat de potasiu.</li>
                    )}
                    {nutrients.potassium.current > nutrients.potassium.max && (
                        <li>Nivelul de Potasiu este ridicat. Reduceți aplicarea îngrășămintelor cu potasiu.</li>
                    )}
                    {nutrients.ph.current < nutrients.ph.optimal.min && (
                        <li>pH-ul este prea acid. Considerați adăugarea de var agricol sau dolomită pentru a crește pH-ul.</li>
                    )}
                    {nutrients.ph.current > nutrients.ph.optimal.max && (
                        <li>pH-ul este prea alcalin. Considerați adăugarea de sulf elemental sau turbă pentru a reduce pH-ul.</li>
                    )}
                </ul>
            </div>
        </div>
    );
}

export default MixMacronutrients;
