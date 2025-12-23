import React from 'react';

// --- STYLES (Matching Theme) ---
const buttonStyle = {
    width: '100%',
    padding: '18px 25px',
    background: 'linear-gradient(90deg, #3B82F6 10%, #1D4ED8 90%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1.2rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 8px 20px rgba(59, 130, 246, 0.4)',
    marginTop: '30px',
};
const backButtonStyle = {
    ...buttonStyle,
    background: '#475569', 
    boxShadow: 'none',
    width: '250px',
    padding: '10px 25px',
    fontSize: '1rem',
    marginTop: '10px',
};
const resultContainerStyle = { 
    maxWidth: '800px', 
    margin: '80px auto', 
    padding: '30px', 
    background: 'rgba(30, 41, 59, 0.9)', 
    borderRadius: '15px', 
    border: '1px solid #22C55E' 
};

// Helper function to format PKR numbers
const formatPKR = (num) => `PKR ${Number(num).toLocaleString()}`;
const formatPercent = (num) => `${num}%`;

// Sub-component for displaying individual financial metrics
const ResultCard = ({ label, value, color, isPrimary = false }) => (
    <div style={{ 
        padding: isPrimary ? '20px' : '15px', 
        background: isPrimary ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(2, 6, 23, 0.5))' : '#1E293B', 
        borderRadius: '10px', 
        border: `1px solid ${color}30`,
        textAlign: 'center',
    }}>
        <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.9rem' }}>{label}</p>
        <h3 style={{ color: color, margin: '5px 0 0', fontSize: isPrimary ? '1.8rem' : '1.3rem' }}>{value}</h3>
    </div>
);

const ROIResults = ({ result, onNewCalculation, onBack }) => {
    // Determine the color based on ROI
    const cashOnCash = parseFloat(result.cashOnCashROI);
    const coCColor = cashOnCash > 10 ? '#22C55E' : cashOnCash > 0 ? '#FBBF24' : '#EF4444';
    
    // CRITICAL SCROLL FIX: Force vertical scrolling on this specific full-page view
    const scrollFixStyle = {
        overflowY: 'auto',
        minHeight: '100vh',
    };

    return (
        <div style={{ ...resultContainerStyle, ...scrollFixStyle }}>
            <h2 style={{ color: coCColor, textAlign: 'center' }}>Profitability Analysis Complete! 📈</h2>
            <p style={{ textAlign: 'center', marginBottom: '30px', opacity: 0.8 }}>
                Detailed financial projections based on your input:
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                
                {/* Highlighted Results */}
                <ResultCard label="Cash-on-Cash ROI (Annual)" value={formatPercent(result.cashOnCashROI)} color={coCColor} isPrimary={true} />
                <ResultCard label="Capitalization Rate (Cap Rate)" value={formatPercent(result.capRate)} color="#60A5FA" isPrimary={true} />

                {/* Secondary Metrics */}
                <ResultCard label="Net Operating Income (NOI - Annual)" value={formatPKR(result.noi)} color="#94A3B8" />
                <ResultCard label="Total Cash Invested" value={formatPKR(result.totalCashInvested)} color="#94A3B8" />
                <ResultCard label="Annual Cash Flow" value={formatPKR(result.annualCashFlow)} color={result.annualCashFlow > 0 ? '#22C55E' : '#EF4444'} />
                
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '30px', flexWrap: 'wrap' }}>
                <button onClick={onNewCalculation} style={{ ...buttonStyle, width: '250px' }}>
                    Run New Calculation
                </button>
                <button onClick={onBack} style={backButtonStyle}>
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
};

export default ROIResults;
