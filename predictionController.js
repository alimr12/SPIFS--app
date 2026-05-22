const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const jwt = require('jsonwebtoken');
const PredictionHistory = require('../models/PredictionHistory');

function getAuthUserFromHeader(req) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return { userId: null, email: null };

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    return {
      userId: decoded.userId || null,
      email: decoded.email ? String(decoded.email).toLowerCase() : null
    };
  } catch (error) {
    // Invalid/missing token should not block prediction generation.
    return { userId: null, email: null };
  }
}

/**
 * Handle POST request from frontend and return prediction
 */
async function getPricePrediction(req, res) {
  try {
    // Validate request body
    const {
      city,
      location_type,
      society,
      block_sector,
      size,
      investment_period,
      current_price
    } = req.body;

    // Validate required fields
    if (!city || !location_type || !society || !block_sector || !size || !investment_period || current_price === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: city, location_type, society, block_sector, size, investment_period, current_price'
      });
    }

    // Call Python prediction service
    const prediction = await callPythonPredictionService({
      city,
      location_type,
      society,
      block_sector,
      size,
      investment_period,
      current_price
    });

    const predictionValue =
      prediction.prediction ??
      prediction.predicted_price ??
      prediction.future_price;

    const currentPredictedPrice =
      prediction.current_predicted_price ??
      prediction.current_price ??
      null;

    const appreciationRate = prediction.appreciation_rate ?? null;
    const holdingPeriodMonths = prediction.holding_period_months ?? null;

    // Return both top-level and nested keys to support older/newer frontend clients.
    const responsePayload = {
      success: true,
      prediction: predictionValue,
      predicted_price: predictionValue,
      current_predicted_price: currentPredictedPrice,
      appreciation_rate: appreciationRate,
      holding_period_months: holdingPeriodMonths,
      data: prediction
    };

    // Save prediction history for analytics and user history views.
    const authUser = getAuthUserFromHeader(req);
    const requestEmail = req.body?.email ? String(req.body.email).toLowerCase() : null;
    const userEmail = authUser.email || requestEmail;
    await PredictionHistory.create({
      userId: authUser.userId,
      userEmail,
      requestData: {
        city,
        location_type,
        society,
        block_sector,
        size,
        investment_period,
        current_price: Number(current_price)
      },
      responseData: {
        prediction: predictionValue ?? null,
        predicted_price: predictionValue ?? null,
        current_predicted_price: currentPredictedPrice ?? null,
        appreciation_rate: appreciationRate ?? null,
        holding_period_months: holdingPeriodMonths ?? null,
        raw: prediction
      }
    });

    return res.json(responsePayload);
  } catch (error) {
    console.error('Prediction error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Prediction failed'
    });
  }
}

async function getPredictionHistory(req, res) {
  try {
    const authUser = getAuthUserFromHeader(req);
    const queryEmail = req.query.email ? String(req.query.email).toLowerCase() : null;
    const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);

    const query = {};
    if (authUser.userId) query.userId = authUser.userId;
    if (authUser.email || queryEmail) query.userEmail = authUser.email || queryEmail;

    const history = await PredictionHistory.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return res.json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    console.error('Prediction history fetch error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch prediction history'
    });
  }
}

/**
 * Call Python prediction.py script via child_process.spawn
 * Sends request as JSON through stdin, receives JSON output through stdout
 */
function callPythonPredictionService(requestData) {
  return new Promise((resolve, reject) => {
    try {
      // Determine Python executable based on OS
      const pythonCmd = os.platform() === 'win32' ? 'python' : 'python3';
      
      // Path to prediction.py script
      const scriptPath = path.join(__dirname, '../mlservice/prediction.py');

      // Spawn Python process
      const python = spawn(pythonCmd, [scriptPath]);

      let stdout = '';
      let stderr = '';

      // Collect stdout data
      python.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      // Collect stderr data
      python.stderr.on('data', (data) => {
        stderr += data.toString();
        console.error('Python stderr:', data.toString());
      });

      // Handle process exit
      python.on('close', (code) => {
        if (code !== 0) {
          console.error(`Python process exited with code ${code}`);
          console.error('stderr:', stderr);
          return reject(new Error(`Python script failed: ${stderr || 'Unknown error'}`));
        }

        try {
          // Parse JSON output from Python script
          const result = JSON.parse(stdout.trim());
          
          if (result.error) {
            return reject(new Error(result.error));
          }

          resolve(result);
        } catch (parseError) {
          console.error('Failed to parse Python output:', stdout);
          reject(new Error('Invalid JSON from Python script: ' + parseError.message));
        }
      });

      // Handle process error
      python.on('error', (err) => {
        reject(new Error(`Failed to spawn Python process: ${err.message}`));
      });

      // Send request data as JSON through stdin
      python.stdin.write(JSON.stringify(requestData));
      python.stdin.end();

    } catch (error) {
      reject(error);
    }
  });
}

module.exports = {
  getPricePrediction,
  getPredictionHistory
};
