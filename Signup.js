import React, { useState } from "react";
import { signupUser } from "../components/services/auth";


const Signup = ({ onSignupSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

 const handleSignup = async () => {
  if (!name.trim() || !email.trim() || !password.trim() || !confirm.trim()) {
    alert("Please fill all fields.");
    return;
  }

  if (password !== confirm) {
    alert("Password and Confirm Password do not match.");
    return;
  }

  // ✅ Send Data to Backend
  const response = await signupUser({ name, email, password });

  if (response.success) {
    alert("✅ Signup Successful! Now login.");
    onSignupSuccess(); // Switch to Login Page Automatically
  } else {
    alert("❌ " + response.message);
  }
};


  return (
    <div style={styles.page}>
      <div style={styles.overlay}></div>

      <div style={styles.container}>
        <div style={styles.logoContainer}>
          <div style={styles.logoMini}>
            <svg
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
            >
              <rect x="15" y="35" width="25" height="35" fill="white" opacity="0.9" rx="2" />
              <rect x="50" y="25" width="25" height="45" fill="white" opacity="0.9" rx="2" />
              <path
                d="M10 80 L30 60 L50 65 L70 45 L80 50"
                stroke="white"
                strokeWidth="3"
                fill="none"
              />
              <circle cx="30" cy="60" r="2" fill="white" />
              <circle cx="50" cy="65" r="2" fill="white" />
              <circle cx="70" cy="45" r="2" fill="white" />
            </svg>
          </div>
          <h1 style={styles.title}>SPIFS</h1>
        </div>

        <p style={styles.subtitle}>Create your SPIFS account</p>

        <div style={styles.form}>
          <label style={styles.label}>Full Name</label>
          <input
            type="text"
            placeholder="Enter your name"
            style={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label style={styles.label}>Email Address</label>
          <input
            type="email"
            placeholder="Enter your email"
            style={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label style={styles.label}>Password</label>
          <div style={styles.passwordWrapper}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              style={{ ...styles.input, marginBottom: 0 }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              style={styles.eyeIcon}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          <label style={{ ...styles.label, marginTop: "1rem" }}>
            Confirm Password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Confirm your password"
            style={styles.input}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />

          <button style={styles.loginButton} onClick={handleSignup}>
            Sign Up
          </button>

          <p style={styles.or}>or continue with</p>

          <div style={styles.socialContainer}>
            <button style={{ ...styles.socialBtn, background: "white", color: "#333" }}>
              <svg
                style={styles.socialSvg}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                width="20px"
                height="20px"
              >
                <path
                  fill="#FFC107"
                  d="M43.611,20.083h-1.611v-0.083H24v8h11.303c-1.65,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 s5.373-12,12-12c3.059,0,5.84,1.154,7.961,3.039l5.657-5.657C33.047,6.188,28.715,4,24,4C12.954,4,4,12.954,4,24 s8.954,20,20,20s20-8.954,20-20C44,22.641,43.851,21.344,43.611,20.083z"
                />
                <path
                  fill="#FF3D00"
                  d="M6.306,14.691l6.571,4.818C14.491,16.108,18.839,13,24,13c3.059,0,5.84,1.154,7.961,3.039 l5.657-5.657C33.047,6.188,28.715,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                />
                <path
                  fill="#4CAF50"
                  d="M24,44c4.715,0,9.047-2.188,12.304-5.961l-5.657-5.657C28.44,34.846,25.662,36,24,36 c-5.202,0-9.633-3.343-11.292-8H6.294v5.018C9.634,39.663,16.296,44,24,44z"
                />
                <path
                  fill="#1976D2"
                  d="M43.611,20.083h-1.611v-0.083H24v8h11.303c-0.793,2.238-2.267,4.189-4.303,5.657l5.657,5.657 C39.662,36.621,44,30.799,44,24C44,22.641,43.851,21.344,43.611,20.083z"
                />
              </svg>{" "}
              Google
            </button>

            <button style={{ ...styles.socialBtn, background: "#1877F2" }}>
              <svg
                style={styles.socialSvg}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="white"
                width="20px"
                height="20px"
              >
                <path d="M22,12C22,6.48,17.52,2,12,2S2,6.48,2,12c0,5,3.66,9.13,8.44,9.88v-6.99H8.9V12h1.54V9.8 c0-1.52,0.91-2.36,2.3-2.36c0.67,0,1.37,0.12,1.37,0.12v1.5h-0.77c-0.76,0-1,0.47-1,0.95V12h1.7l-0.27,2.89h-1.43v6.99 C18.34,21.13,22,17,22,12z" />
              </svg>{" "}
              Facebook
            </button>
          </div>

          <p style={styles.switchText}>
            Already have an account?{" "}
            <span
              onClick={onSignupSuccess}
              style={{ color: neonBlue, cursor: "pointer", fontWeight: "bold" }}
            >
              Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

const neonBlue = "#3B82F6";

const styles = {
  page: {
    fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
    minHeight: "100vh",
    maxHeight: "100vh", // ✅ Added for scroll fix
    overflowY: "scroll", // ✅ Enables scrolling properly
    background:
      "linear-gradient(135deg, #0F172A 0%, #1E293B 30%, #312E81 60%, #1E40AF 100%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    color: "white",
    position: "relative",
    padding: "2rem 0",
  },
  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    background:
      "radial-gradient(circle at center, rgba(59,130,246,0.15) 0%, transparent 70%)",
  },
  container: {
    position: "relative",
    zIndex: 2,
    background: "rgba(255,255,255,0.05)",
    padding: "3rem",
    borderRadius: "20px",
    width: "400px",
    boxShadow: `0 0 25px ${neonBlue}`,
    backdropFilter: "blur(10px)",
  },
  logoContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.7rem",
    marginBottom: "0.8rem",
  },
  logoMini: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: `linear-gradient(135deg, ${neonBlue}, #1D4ED8)`,
    boxShadow: "0 0 15px rgba(59,130,246,0.6)",
  },
  title: {
    fontSize: "2rem",
    fontWeight: "bold",
    color: "#60A5FA",
  },
  subtitle: {
    textAlign: "center",
    color: "rgba(255,255,255,0.7)",
    marginBottom: "2rem",
  },
  label: {
    fontSize: "0.9rem",
    display: "block",
    marginBottom: "0.5rem",
    color: "#E2E8F0",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    marginBottom: "1.5rem",
    borderRadius: "10px",
    border: "none",
    outline: "none",
    background: "rgba(255,255,255,0.1)",
    color: "white",
  },
  passwordWrapper: {
    position: "relative",
  },
  eyeIcon: {
    position: "absolute",
    right: "12px",
    top: "12px",
    cursor: "pointer",
  },
  loginButton: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    background: `linear-gradient(90deg, ${neonBlue}, #8B5CF6, #06B6D4)`,
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
    marginBottom: "1.5rem",
  },
  or: {
    textAlign: "center",
    color: "rgba(255,255,255,0.6)",
    marginBottom: "1rem",
  },
  socialContainer: {
    display: "flex",
    justifyContent: "space-between",
    gap: "0.5rem",
  },
  socialBtn: {
    flex: 1,
    padding: "10px",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  socialSvg: {
    marginRight: "8px",
  },
  switchText: {
    textAlign: "center",
    color: "#E2E8F0",
    marginTop: "1.5rem",
  },
};

export default Signup;
