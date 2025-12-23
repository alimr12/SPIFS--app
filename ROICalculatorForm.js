import React, { useState } from 'react';

// --- STYLES (Matching PredictionForm.js Theme) ---
const formStyle = {
    maxWidth: '600px',
    // Center form content horizontally
    margin: '40px auto', 
    padding: '40px 30px',
    background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95))',
    borderRadius: '15px',
    boxShadow: '0 20px 45px rgba(0, 0, 0, 0.8)',
    border: '1px solid rgba(96, 165, 250, 0.2)',
};

const inputStyle = {
    width: '100%',
    padding: '16px 20px',
    margin: '12px 0',
    border: '1px solid #1E293B',
    borderRadius: '8px',
    backgroundColor: 'rgba(15, 23, 42, 1)', 
    color: '#E2E8F0',
    fontSize: '1rem',
    boxSizing: 'border-box',
    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.8)',
    transition: 'border-color 0.3s, box-shadow 0.3s',
};
const inputFocusStyle = {
    borderColor: '#60A5FA', 
    boxShadow: '0 0 8px rgba(96, 165, 250, 0.5)',
};

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

// Removed backButtonStyle as the button is deprecated per request.
const containerStyle = {
    padding: '40px 20px 40px',
    minHeight: '100vh', 
    overflowY: 'auto',
    boxSizing: 'border-box',
    textAlign: 'center', // Ensures form centers properly without float
};
// ------------------------------------

const ROICalculatorForm = ({ onBack, onCalculate }) => {
    const [formData, setFormData] = useState({
        purchasePrice: '',
        initialCosts: '', 
        futureSalePrice: '', 
        holdingTime: 12, 
        loanAmount: '', 
        interestRate: '', 
        // NEW STATE: To control visibility of financing section if loan amount is entered
        showFinancing: false,
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        let newShowFinancing = formData.showFinancing;
        
        if (name === 'loanAmount') {
            // Automatically show/hide financing fields based on loan amount entry
            newShowFinancing = Number(value) > 0;
        }

        setFormData(prev => ({ 
            ...prev, 
            [name]: value,
            showFinancing: newShowFinancing,
        }));
    };

    const handleInputFocus = (e) => {
        e.target.style.borderColor = inputFocusStyle.borderColor;
        e.target.style.boxShadow = inputFocusStyle.boxShadow;
    };

    const handleInputBlur = (e) => {
        e.target.style.borderColor = inputStyle.border;
        e.target.style.boxShadow = inputStyle.boxShadow;
    };
    
    // Removed handleBackHover function
    
    const calculate = (data) => {
        const purchasePrice = Number(data.purchasePrice) || 0;
        const initialCosts = Number(data.initialCosts) || 0;
        const futureSalePrice = Number(data.futureSalePrice) || 0;
        const holdingTimeMonths = Number(data.holdingTime) || 0;
        const holdingTimeYears = holdingTimeMonths / 12;
        
        // Ensure loan/interest is zero if not shown or filled
        const loanAmount = data.showFinancing && data.loanAmount ? Number(data.loanAmount) : 0;
        const interestRate = data.showFinancing && data.interestRate ? (Number(data.interestRate) || 0) / 100 : 0;

        // 1. Total Cash Invested (Equity + Closing Costs)
        const totalCashInvested = (purchasePrice - loanAmount) + initialCosts;

        // 2. Cost of Debt (Total Interest Paid over holding period)
        const totalInterestPaid = (loanAmount > 0 && holdingTimeYears > 0) 
            ? loanAmount * interestRate * holdingTimeYears 
            : 0;

        // 3. Total Expense (Initial Costs + Interest Paid)
        const totalExpense = initialCosts + totalInterestPaid;

        // 4. Total Profit from Sale
        // Profit = Sale Price - Purchase Price - Total Expense
        const totalProfit = futureSalePrice - purchasePrice - totalExpense;

        // 5. Simple ROI (Total Return on Investment)
        const simpleROI = totalCashInvested > 0 ? (totalProfit / totalCashInvested) * 100 : 0;
        
        // 6. Annualized Return (CAGR approximation)
        const annualizedROI = (holdingTimeYears > 0 && totalCashInvested > 0) 
            ? ((Math.pow((futureSalePrice / totalCashInvested), (1 / holdingTimeYears)) - 1) * 100)
            : 0;
        
        return {
            totalProfit: totalProfit.toFixed(0),
            simpleROI: simpleROI.toFixed(2),
            annualizedROI: annualizedROI.toFixed(2),
            totalCashInvested: totalCashInvested.toFixed(0),
            totalInterestPaid: totalInterestPaid.toFixed(0),
            // Cap Rate is effectively zero/not applicable for non-income-generating plots
            noi: 0,
            capRate: 0, 
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        await new Promise(resolve => setTimeout(resolve, 1500)); 
        
        const results = calculate(formData);
        
        setLoading(false);

        onCalculate(results);
    };

    return (
        <>
             {/* CRITICAL SCROLL FIX: Force vertical scrolling on the document body */}
             <style>{`
                body {
                    overflow-y: auto !important; 
                }
            `}</style>
            
            <div style={containerStyle}>
                {/* REMOVED DEDICATED BACK BUTTON - Relying on browser back arrow (Chrome icon) */}
                <form onSubmit={handleSubmit} style={formStyle}>
                    <h2 style={{ color: '#60A5FA', textAlign: 'center', marginBottom: '10px' }}>💰 Plot Investment Analysis</h2>
                    <p style={{ textAlign: 'center', opacity: 0.7, marginBottom: '30px', fontSize: '0.95rem' }}> Calculate the potential return on your plot investment.</p>
                    
                    {/* Purchase Price */}
                    <input 
                        style={inputStyle}
                        type="number" 
                        name="purchasePrice" 
                        placeholder="Initial Purchase Price (PKR)" 
                        value={formData.purchasePrice} 
                        onChange={handleChange} 
                        required 
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                    />

                    {/* Future Sale Price (User Estimate / AI Prediction) */}
                    <input 
                        style={inputStyle}
                        type="number" 
                        name="futureSalePrice" 
                        placeholder="Expected Future Sale Price (PKR)" 
                        value={formData.futureSalePrice} 
                        onChange={handleChange} 
                        required 
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                    />

                    {/* Initial Costs */}
                    <input 
                        style={inputStyle}
                        type="number" 
                        name="initialCosts" 
                        placeholder="Total Initial Costs (Fees, Duties, etc. PKR)" 
                        value={formData.initialCosts} 
                        onChange={handleChange} 
                        required 
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                    />
                    
                    {/* Holding Time (Months) */}
                    <input 
                        style={inputStyle}
                        type="number" 
                        name="holdingTime" 
                        placeholder="Planned Holding Time (Months)" 
                        value={formData.holdingTime} 
                        onChange={handleChange} 
                        required 
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                    />

                    <h3 style={{ color: '#93C5FD', marginTop: '30px', marginBottom: '10px', fontSize: '1.2rem', opacity: 0.9 }}>Financing Details (Optional)</h3>

                    {/* Loan Amount - Controls visibility of interest rate */}
                    <input 
                        style={inputStyle}
                        type="number" 
                        name="loanAmount" 
                        placeholder="Loan Amount (PKR) - Enter 0 if fully cash" 
                        value={formData.loanAmount} 
                        onChange={handleChange} 
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                    />

                    {/* Interest Rate - Only visible if loan amount is entered */}
                    {formData.showFinancing && (
                        <input 
                            style={inputStyle}
                            type="number" 
                            name="interestRate" 
                            placeholder="Annual Interest Rate (%)" 
                            value={formData.interestRate} 
                            onChange={handleChange} 
                            required={formData.showFinancing}
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                        />
                    )}

                    <button type="submit" style={buttonStyle} disabled={loading}>
                        {loading ? '🧮 Calculating ROI...' : 'Calculate Profitability'}
                    </button>

                </form>
            </div>
        </>
    );
};

export default ROICalculatorForm;
