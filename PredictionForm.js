import React, { useState, useEffect } from 'react';

// --- STYLES (Ultra-Responsive & Polished) ---
const containerStyle = {
    padding: '80px 20px', // More space for top/bottom
    minHeight: '100vh',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start', // Start from top so it can scroll down
    background: 'transparent',
    overflowY: 'visible', // Ensure container doesn't clip
};

const formStyle = {
    width: '100%',
    maxWidth: '550px',
    padding: '40px',
    background: 'rgba(30, 41, 59, 0.85)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    margin: 'auto', // Center horizontally
};

const inputGroupStyle = {
    marginBottom: '20px',
    position: 'relative',
};

const labelStyle = {
    display: 'block',
    color: '#94A3B8',
    fontSize: '0.8rem',
    fontWeight: '600',
    marginBottom: '8px',
    marginLeft: '4px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
};

const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    background: 'rgba(15, 23, 42, 0.7)',
    border: '1px solid rgba(96, 165, 250, 0.2)',
    borderRadius: '12px',
    color: '#F8FAFC',
    fontSize: '1rem',
    outline: 'none',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box',
};

const errorTextStyle = {
    color: '#F87171',
    fontSize: '0.75rem',
    marginTop: '5px',
    marginLeft: '4px',
    display: 'block',
};

const buttonStyle = {
    width: '100%',
    padding: '16px',
    marginTop: '10px',
    background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1.1rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)',
};

// --- DATA DEFINITIONS ---
const CITIES = ['Islamabad', 'Rawalpindi'];
const PLOT_SIZES = ['5 Marla', '10 Marla', '1 Kanal', '2 Kanal'];
const LOCATION_TYPES = ['Residential', 'Commercial', 'Semi-Commercial'];
const SOCIETIES = [
    'Capital Smart City', 
    'Discovery Garden', 
    'Faisal Hills', 
    'Grace Valley', 
    'Gulberg Greens'
]; 

const PredictionForm = ({ onPredict }) => {
    const [formData, setFormData] = useState({
        city: CITIES[0],
        society: SOCIETIES[0],
        block: '',
        plotSize: PLOT_SIZES[0],
        locationType: LOCATION_TYPES[0], 
        currentPrice: '',
        holdingTime: '', 
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // This ensures that when the form opens, the browser is forced to allow scrolling
    useEffect(() => {
        document.body.style.overflow = 'auto';
        document.documentElement.style.overflow = 'auto';
        return () => {
            // Optional: reset when leaving the form
        };
    }, []);

    const validate = () => {
        let newErrors = {};
        if (!formData.block.trim()) newErrors.block = "Block/Sector is required";
        if (!formData.currentPrice || formData.currentPrice <= 0) newErrors.currentPrice = "Enter a valid price";
        if (!formData.holdingTime || formData.holdingTime <= 0) newErrors.holdingTime = "Enter a valid period (months)";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) setErrors({ ...errors, [name]: null });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 2000)); 
        
        const price = Number(formData.currentPrice);
        const months = Number(formData.holdingTime);
        let annualGrowthRate = 0.10; 
        if (formData.locationType === 'Commercial') annualGrowthRate = 0.15;
        if (formData.locationType === 'Semi-Commercial') annualGrowthRate = 0.12;

        const predictedPrice = price * Math.pow((1 + annualGrowthRate), (months / 12));
        const profitLoss = predictedPrice - price;
        
        setLoading(false);
        onPredict({
            ...formData,
            predictedPrice: predictedPrice.toFixed(0),
            profitLoss: profitLoss.toFixed(0),
            advice: profitLoss > (price * 0.2) ? 'Strong Buy' : 'Good Investment'
        });
    };

    return (
        <>
            <style>{`
                /* THE ULTIMATE SCROLL FIX */
                html, body {
                    height: auto !important;
                    min-height: 100% !important;
                    overflow-y: auto !important;
                    overflow-x: hidden !important;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .form-animate { animation: fadeIn 0.6s ease-out forwards; }
                
                input:focus, select:focus {
                    border-color: #60A5FA !important;
                    box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.15) !important;
                }

                select {
                    appearance: none;
                    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="%2360A5FA" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>');
                    background-repeat: no-repeat;
                    background-position: right 15px center;
                }
            `}</style>
            
            <div style={containerStyle}>
                <form onSubmit={handleSubmit} style={formStyle} className="form-animate">
                    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                        <h2 style={{ color: '#60A5FA', fontSize: '1.8rem', margin: '0 0 10px 0' }}>AI Market Analysis</h2>
                        <p style={{ color: '#94A3B8', fontSize: '0.95rem' }}>Enter property details for precise price forecasting</p>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>City</label>
                            <select style={inputStyle} name="city" value={formData.city} onChange={handleChange}>
                                {CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                            </select>
                        </div>

                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Location Type</label>
                            <select style={inputStyle} name="locationType" value={formData.locationType} onChange={handleChange}>
                                {LOCATION_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                        </div>
                    </div>

                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>Society / Project</label>
                        <select style={inputStyle} name="society" value={formData.society} onChange={handleChange}>
                            {SOCIETIES.map(soc => <option key={soc} value={soc}>{soc}</option>)}
                        </select>
                    </div>
                    
                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>Block / Sector</label>
                        <input 
                            style={{...inputStyle, borderColor: errors.block ? '#F87171' : 'rgba(96, 165, 250, 0.2)'}} 
                            type="text" name="block" placeholder="Overseas Block, Block A..." 
                            value={formData.block} onChange={handleChange} 
                        />
                        {errors.block && <span style={errorTextStyle}>{errors.block}</span>}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Size</label>
                            <select style={inputStyle} name="plotSize" value={formData.plotSize} onChange={handleChange}>
                                {PLOT_SIZES.map(size => <option key={size} value={size}>{size}</option>)}
                            </select>
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Investment Period</label>
                            <input 
                                style={{...inputStyle, borderColor: errors.holdingTime ? '#F87171' : 'rgba(96, 165, 250, 0.2)'}} 
                                type="number" name="holdingTime" placeholder="Months" 
                                value={formData.holdingTime} onChange={handleChange} 
                            />
                            {errors.holdingTime && <span style={errorTextStyle}>{errors.holdingTime}</span>}
                        </div>
                    </div>
                    
                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>Current Market Price (PKR)</label>
                        <input 
                            style={{...inputStyle, borderColor: errors.currentPrice ? '#F87171' : 'rgba(96, 165, 250, 0.2)'}} 
                            type="number" name="currentPrice" placeholder="e.g. 5500000" 
                            value={formData.currentPrice} onChange={handleChange} 
                        />
                        {errors.currentPrice && <span style={errorTextStyle}>{errors.currentPrice}</span>}
                    </div>

                    <button type="submit" style={buttonStyle} disabled={loading}>
                        {loading ? 'Processing...' : 'Generate Prediction'}
                    </button>
                </form>
            </div>
        </>
    );
};

export default PredictionForm;