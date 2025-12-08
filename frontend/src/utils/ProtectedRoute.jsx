import { Navigate } from "react-router-dom";
import useAuth from "./useAuth";

const ProtectedRoute = ({ children }) => {
  const { loggedIn, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!loggedIn) {
    return <Navigate to="/auth/signin" replace />;
  }

  return children;
};

export default ProtectedRoute;
