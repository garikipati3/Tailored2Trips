import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedAdminRoute from "./utils/protect";

import Landing from "./pages/Landing";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import CreateBlog from "./pages/admin/createBlog";
import Dashboard from "./pages/admin/dashboard";
import EditBlog from "./pages/admin/editBlog";
import BlogView from "./pages/BlogView";
import Profile from "./pages/Profile";
import Trips from "./pages/Trips";
import TripDetail from "./pages/TripDetail";
import Itinerary from "./pages/Itinerary";
import Budget from "./pages/Budget";
import Places from "./pages/Places";
import MapView from "./pages/MapView";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<Landing />} /> */}
        <Route path="/" element={<Signin />} />

        <Route path="/auth/signin" element={<Signin />} />
        <Route path="/auth/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/trips" element={<Trips />} />
        <Route path="/trips/:tripId" element={<TripDetail />} />
        <Route path="/trips/:tripId/itinerary" element={<Itinerary />} />
        <Route path="/trips/:tripId/budget" element={<Budget />} />
        <Route path="/trips/:tripId/map" element={<MapView />} />
        <Route path="/places" element={<Places />} />
        <Route path="/trips/:tripId/places" element={<Places />} />
        <Route path="/blog/:id" element={<BlogView />} />
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <Dashboard />
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
