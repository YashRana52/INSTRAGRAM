import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export const ProtectedRoute = ({ children }) => {
  const { user, authChecked } = useSelector((state) => state.auth);

  if (!authChecked) return null;

  return user ? children : <Navigate to="/login" replace />;
};
