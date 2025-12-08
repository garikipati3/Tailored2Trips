import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedAdminRoute from "./utils/protect";
import ProtectedRoute from "./utils/ProtectedRoute";

import Landing from "./pages/Landing";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import CreateBlog from "./pages/admin/createBlog";
import AdminDashboard from "./pages/admin/dashboard";
import EditBlog from "./pages/admin/editBlog";
import BlogView from "./pages/BlogView";
import Profile from "./pages/Profile";
import Trips from "./pages/Trips";
import TripDetail from "./pages/TripDetail";
import Itinerary from "./pages/Itinerary";
import Budget from "./pages/Budget";
import Places from "./pages/Places";
import MapView from "./pages/MapView";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/auth/signin" element={<Signin />} />
        <Route path="/auth/signup" element={<Signup />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trips"
          element={
            <ProtectedRoute>
              <Trips />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trips/:tripId"
          element={
            <ProtectedRoute>
              <TripDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trips/:tripId/itinerary"
          element={
            <ProtectedRoute>
              <Itinerary />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trips/:tripId/budget"
          element={
            <ProtectedRoute>
              <Budget />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trips/:tripId/map"
          element={
            <ProtectedRoute>
              <MapView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/places"
          element={
            <ProtectedRoute>
              <Places />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trips/:tripId/places"
          element={
            <ProtectedRoute>
              <Places />
            </ProtectedRoute>
          }
        />
        <Route path="/blog/:id" element={<BlogView />} />
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/createBlog"
          element={
            <ProtectedAdminRoute>
              <CreateBlog />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/editBlog/:id"
          element={
            <ProtectedAdminRoute>
              <EditBlog />
            </ProtectedAdminRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
