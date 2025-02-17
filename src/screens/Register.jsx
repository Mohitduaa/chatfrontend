import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../Config/axios.js";
import { UserContext } from "../contex/user.contex";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // State for error messages
  const { setUser } = useContext(UserContext);

  const navigate = useNavigate();

  function submithandler(e) {
    e.preventDefault();

    // Clear previous error messages
    setErrorMessage("");

    axios
      .post("/users/register", { email, password })
      .then((res) => {
        console.log("Response:", res.data);
        localStorage.setItem("token", res.data.token);
        setUser(res.data.user);

        navigate("/");
      })
      .catch((err) => {
        if (err.response) {
          setErrorMessage(err.response.data.message || "Registration failed."); // Display backend error message if available
        } else if (err.request) {
          setErrorMessage("No response from server. Please try again later.");
        } else {
          setErrorMessage("An unexpected error occurred. Please try again.");
        }
      });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="bg-gray-700 p-8 rounded-xl shadow-lg w-full max-w-sm">
        <h2 className="text-2xl font-bold text-white mb-4 text-center">
          Create Your Account
        </h2>
        <p className="text-sm text-gray-400 text-center mb-6">
          Join us and start your journey!
        </p>
        <form onSubmit={submithandler}>
          <div className="mb-4">
            <label
              className="block text-sm font-medium text-gray-300 mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <input
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              id="email"
              className="w-full mt-2 p-3 bg-gray-800 text-gray-100 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
            />
          </div>
          <div className="mb-6">
            <label
              className="block text-sm font-medium text-gray-300 mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              id="password"
              className="w-full mt-2 p-3 bg-gray-800 text-gray-100 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
            />
          </div>
          {errorMessage && ( // Conditionally render the error message
            <p className="text-red-500 text-sm mb-4">{errorMessage}</p>
          )}
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition ease-in-out duration-200"
          >
            Register
          </button>
        </form>
        <p className="text-center text-sm text-gray-400 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
