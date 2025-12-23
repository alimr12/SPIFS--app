// spifs-app/src/components/PredictionResults.js

import React from 'react';

// --- STYLES (Keep them consistent) ---
const buttonStyle = {
    width: '100%',
    padding: '15px',
    marginTop: '20px',
    background: 'linear-gradient(90deg, #3B82F6, #1D4ED8)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1.1rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'background 0.3s',
};
// ------------------------------------

const PredictionResults = ({ result, onNewPrediction, onBack }) => (
    <div style={{ maxWidth: '800px', margin: '80px auto', padding: '30px', background: 'rgba(30, 41, 59, 0.9)', borderRadius: '15px', border: '1px solid #22C55E' }}>
        <h2 style={{ color: '#22C55E', textAlign: 'center' }}>Prediction Complete! 🏆</h2>
        <p style={{ textAlign: 'center', marginBottom: '30px', opacity: 0.8 }}>
            Forecast for **{result.location} ({result.propertyType}, {result.plotSize})** over **{result.holdingTime} months**:
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'space-around', margin: '20px 0', flexWrap: 'wrap' }}>
            <div style={{ padding: '15px', background: '#1E293B', borderRadius: '8px', margin: '10px', minWidth: '200px' }}>
                <p style={{ margin: 0, color: '#94A3B8' }}>Current Price:</p>
                <h3 style={{ color: '#FBBF24', margin: '5px 0' }}>PKR {Number(result.currentPrice).toLocaleString()}</h3>
            </div>
            <div style={{ padding: '15px', background: '#1E293B', borderRadius: '8px', margin: '10px', minWidth: '200px' }}>
                <p style={{ margin: 0, color: '#94A3B8' }}>Predicted Future Price:</p>
                <h3 style={{ color: '#3B82F6', margin: '5px 0' }}>PKR {Number(result.predictedPrice).toLocaleString()}</h3>
            </div>
        </div>

        <div style={{ padding: '15px', background: result.profitLoss > 0 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(251, 191, 36, 0.2)', borderRadius: '8px', textAlign: 'center', marginTop: '20px' }}>
            <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold', color: result.profitLoss > 0 ? '#22C55E' : '#FBBF24' }}>
                Potential Profit/Loss: {result.profitLoss > 0 ? '📈 Profit' : '📉 Loss'} of PKR {Number(result.profitLoss).toLocaleString()}
            </p>
            <p style={{ marginTop: '10px', fontSize: '1rem' }}>
                **AI Advice:** {result.advice}
            </p>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '30px' }}>
            <button onClick={onNewPrediction} style={{ ...buttonStyle, width: '200px' }}>
                Run New Prediction
            </button>
            <button onClick={onBack} style={{ ...buttonStyle, width: '200px', background: '#475569' }}>
                Back to Dashboard
            </button>
        </div>
    </div>
);

export default PredictionResults;