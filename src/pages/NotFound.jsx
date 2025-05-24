import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center justify-center text-center min-h-[80vh] space-y-6"
    >
      <h1 className="text-6xl font-extrabold text-orange-400">404</h1>
      <p className="text-lg text-gray-400 max-w-md">
        Oops! The page you’re looking for doesn’t exist. Maybe it’s on a coffee break.
      </p>

      <Link
        to="/dashboard"
        className="mt-4 inline-block bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-3 rounded transition"
      >
        Go Back Home
      </Link>
    </motion.div>
  );
}
