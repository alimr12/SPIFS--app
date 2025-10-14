// spifs-app/src/services/auth.js

export const signupUser = async (userData) => {
  try {
    const response = await fetch("http://localhost:5000/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Signup Error:", error);
    return { success: false, message: "Server Error" };
  }
};

export const loginUser = async (userData) => {
  try {
    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Login Error:", error);
    return { success: false, message: "Server Error" };
  }
};
