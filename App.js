import React, { useState } from "react";
import SplashScreen from "./components/SplashScreen";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";

function App() {
  const [screen, setScreen] = useState("splash");

  return (
    <>
      {/* 1️⃣ Splash → Direct to Dashboard */}
      {screen === "splash" && (
        <SplashScreen onComplete={() => setScreen("dashboard")} />
      )}

      {/* 2️⃣ Dashboard (Shows Login Button in Navbar) */}
      {screen === "dashboard" && (
        <Dashboard
          onLoginClick={() => setScreen("login")}
          onLogout={() => setScreen("dashboard")}
        />
      )}

      {/* 3️⃣ Login Screen */}
      {screen === "login" && (
        <Login
          onLoginSuccess={() => setScreen("dashboard")}
          onSignup={() => setScreen("signup")}
        />
      )}

      {/* 4️⃣ Signup Screen */}
      {screen === "signup" && (
        <Signup onSignupSuccess={() => setScreen("login")} />
      )}
    </>
  );
}

export default App;
