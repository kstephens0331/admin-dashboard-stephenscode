import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../auth/firebase";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      if (email !== "info@stephenscode.dev") {
        setError("You are not authorized to access the admin system.");
        return;
      }
      navigate("/dashboard");
    } catch (err) {
      setError("Login failed. Check your credentials.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-gray-900 text-white">
      <form
        onSubmit={handleLogin}
        className="bg-[#1a1a1a] p-8 rounded-lg shadow-lg w-full max-w-md border border-gray-800"
      >
        <h2 className="text-2xl font-bold mb-4 text-orange-400">Admin Login</h2>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-3 p-3 rounded bg-gray-900 text-white border border-gray-700"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-5 p-3 rounded bg-gray-900 text-white border border-gray-700"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded"
        >
          Login
        </button>
      </form>
    </div>
  );
}
