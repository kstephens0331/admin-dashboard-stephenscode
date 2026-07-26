import { useState } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../auth/firebase";
import { useNavigate } from "react-router-dom";

const AUTHORIZED_EMAIL = "info@stephenscode.dev";

function getAuthErrorMessage(code) {
  switch (code) {
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/missing-password":
      return "Enter your password.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect email or password.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Wait a few minutes and try again.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    default:
      return "Login failed. Check your credentials.";
  }
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      if (credential.user.email !== AUTHORIZED_EMAIL) {
        // Firebase auth succeeded, but this is not the authorized admin
        // account -- sign out immediately so no half-authenticated session
        // is left behind for direct-navigation bypass.
        await signOut(auth);
        setError("You are not authorized to access the admin system.");
        return;
      }
      navigate("/dashboard");
    } catch (err) {
      setError(getAuthErrorMessage(err.code));
    } finally {
      setSubmitting(false);
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
          disabled={submitting}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? "Signing in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
