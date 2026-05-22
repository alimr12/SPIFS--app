import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import FacebookLogin from 'react-facebook-login';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const AuthComponent = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleLocalAuth = async (e) => {
    e.preventDefault();
    try {
      // Match Express backend routes defined in backend/server.js
      const endpoint = isRegistering ? '/api/auth/signup' : '/api/auth/login';
      const data = isRegistering 
        ? { email, password, full_name: fullName }
        : { email, password };
      
      const response = await axios.post(`${API_BASE_URL}${endpoint}`, data);
      localStorage.setItem('token', response.data.token || response.data.access_token);
      alert('Authentication successful!');
    } catch (error) {
      const message = error?.response?.data?.message || error?.response?.data?.detail || error.message;
      alert('Authentication failed: ' + message);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/google`, {
        token: credentialResponse.credential
      });
      localStorage.setItem('token', response.data.token || response.data.access_token);
      alert('Google login successful!');
    } catch (error) {
      const message = error?.response?.data?.message || error?.response?.data?.detail || error.message;
      alert('Google login failed: ' + message);
    }
  };

  const handleFacebookResponse = async (response) => {
    if (response.accessToken) {
      try {
        const res = await axios.post(`${API_BASE_URL}/auth/facebook`, {
          access_token: response.accessToken
        });
        localStorage.setItem('token', res.data.token || res.data.access_token);
        alert('Facebook login successful!');
      } catch (error) {
        const message = error?.response?.data?.message || error?.response?.data?.detail || error.message;
        alert('Facebook login failed: ' + message);
      }
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: 'auto', padding: '20px' }}>
      <h2>Unified Authentication</h2>
      
      {/* Local Auth Form */}
      <form onSubmit={handleLocalAuth}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
        />
        {isRegistering && (
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
          />
        )}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
        />
        <button type="submit" style={{ width: '100%', padding: '10px', marginBottom: '10px' }}>
          {isRegistering ? 'Register' : 'Login'}
        </button>
      </form>
      
      <button onClick={() => setIsRegistering(!isRegistering)} style={{ width: '100%', padding: '10px', marginBottom: '20px' }}>
        {isRegistering ? 'Switch to Login' : 'Switch to Register'}
      </button>
      
      {/* Google OAuth */}
      <div style={{ marginBottom: '10px' }}>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => alert('Google login failed')}
        />
      </div>
      
      {/* Facebook OAuth */}
      <FacebookLogin
        appId="YOUR_FACEBOOK_APP_ID"
        autoLoad={false}
        fields="name,email,picture"
        callback={handleFacebookResponse}
        textButton="Login with Facebook"
        cssClass="facebook-login-btn"
      />
    </div>
  );
};

export default AuthComponent;