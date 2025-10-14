import React, { useEffect } from "react";
import "./SplashScreen.css";

const SplashScreen = ({ onComplete }) => {
  useEffect(() => {
    const loadingTexts = [
      "Initializing AI Engine...",
      "Loading Market Data...",
      "Connecting to Database...",
      "Preparing Dashboard...",
      "Almost Ready..."
    ];

    let currentTextIndex = 0;
    const loadingTextElement = document.querySelector(".loading-text");

    const textInterval = setInterval(() => {
      currentTextIndex = (currentTextIndex + 1) % loadingTexts.length;
      if (loadingTextElement) loadingTextElement.textContent = loadingTexts[currentTextIndex];
    }, 800);

    const timer = setTimeout(() => {
      clearInterval(textInterval);
      const splash = document.getElementById("splashContainer");
      if (splash) splash.classList.add("fade-out");
      setTimeout(() => onComplete && onComplete(), 1000);
    }, 5000);

    const handleClick = () => {
      clearInterval(textInterval);
      const splash = document.getElementById("splashContainer");
      if (splash) splash.classList.add("fade-out");
      setTimeout(() => onComplete && onComplete(), 1000);
    };

    document.addEventListener("click", handleClick);

    return () => {
      clearInterval(textInterval);
      clearTimeout(timer);
      document.removeEventListener("click", handleClick);
    };
  }, [onComplete]);

  return (
    <div className="splash-container" id="splashContainer">
      <div className="particles">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>

      <div className="property-icons">
        <div className="property-icon">🏠</div>
        <div className="property-icon">🏢</div>
        <div className="property-icon">🏘️</div>
        <div className="property-icon">🏗️</div>
      </div>

      <div className="logo-container">
        <div className="logo">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="15" y="35" width="25" height="35" fill="white" opacity="0.9" rx="2" />
            <rect x="50" y="25" width="25" height="45" fill="white" opacity="0.9" rx="2" />
            <path d="M10 80 L30 60 L50 65 L70 45 L80 50" stroke="white" strokeWidth="3" fill="none" />
            <circle cx="30" cy="60" r="2" fill="white" />
            <circle cx="50" cy="65" r="2" fill="white" />
            <circle cx="70" cy="45" r="2" fill="white" />
          </svg>
        </div>
      </div>

      <h1 className="app-name">SPIFS</h1>
      <p className="app-tagline">Smart Property Investment Forecasting System</p>

      <div className="loading-container">
        <div className="loading-text">Initializing AI Engine...</div>
        <div className="loading-bar">
          <div className="loading-progress"></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
