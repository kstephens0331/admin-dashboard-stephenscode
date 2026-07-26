import { useEffect, useState } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Navigate } from "react-router-dom";

const AUTHORIZED_EMAIL = "info@stephenscode.dev";

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email !== AUTHORIZED_EMAIL) {
        // Defense in depth: a Firebase session exists for this project but
        // is not the authorized admin account (e.g. left over because a
        // login attempt never reached the sign-out call). Never grant
        // access via direct navigation, and clear the stray session so it
        // cannot be reused.
        signOut(auth);
        setAuthenticated(false);
        setLoading(false);
        return;
      }
      setAuthenticated(!!user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="text-white p-10">Loading...</div>;
  }

  return authenticated ? children : <Navigate to="/login" />;
}
