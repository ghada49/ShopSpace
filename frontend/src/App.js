import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import BrowseListings from './pages/BrowseListings';
import ListingDetails from './pages/ListingDetails';
import BookingRequest from './pages/BookingRequest';
import HostDashboard from './pages/HostDashboard';
import BrandDashboard from './pages/BrandDashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/browse" element={<BrowseListings />} />
          <Route path="/listings/:id" element={<ListingDetails />} />
          <Route path="/listings/:id/book" element={<BookingRequest />} />
          <Route path="/host-dashboard" element={<HostDashboard />} />
          <Route path="/brand-dashboard" element={<BrandDashboard />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
