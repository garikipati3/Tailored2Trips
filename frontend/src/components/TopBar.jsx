import AuthButtons from "./authButtons";
import ThemeToggle from "./toggleTheme";
import NotificationBell from "./NotificationBell";
import { useNavigate, useLocation } from "react-router-dom";
import useAuth from "../utils/useAuth";

export default function TopBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loggedIn } = useAuth();
  
  return (
    <div className="flex items-center justify-between p-4 w-full border-b border-gray-200 bg-white shadow-md">
      <div
        className="text-lg font-bold text-gray-800 cursor-pointer"
        onClick={() => {
          navigate("/");
        }}>
        <h2 className="text-2xl font-bold">
          <span className="text-blue-700">Tailored2</span>Trips
        </h2>
      </div>
      
      {/* Navigation Menu */}
      {loggedIn && (
        <div className="flex items-center space-x-6">
          <nav className="flex space-x-6">
            <button
              onClick={() => navigate('/trips')}
              className={`text-sm font-medium transition-colors duration-200 ${
                location.pathname.startsWith('/trips')
                  ? 'text-blue-600 border-b-2 border-blue-600 pb-1'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              My Trips
            </button>
            <button
              onClick={() => navigate('/places')}
              className={`text-sm font-medium transition-colors duration-200 ${
                location.pathname.startsWith('/places')
                  ? 'text-blue-600 border-b-2 border-blue-600 pb-1'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Discover Places
            </button>
            <button
              onClick={() => navigate('/profile')}
              className={`text-sm font-medium transition-colors duration-200 ${
                location.pathname === '/profile'
                  ? 'text-blue-600 border-b-2 border-blue-600 pb-1'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Profile
            </button>
          </nav>
        </div>
      )}
      
      <div className="flex items-center space-x-4">
        {loggedIn && <NotificationBell />}
        {/* <ThemeToggle /> */}
        <AuthButtons />
      </div>
    </div>
  );
}
