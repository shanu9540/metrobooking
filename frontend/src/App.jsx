import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Providers
import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';

// Route Guards
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import BookTicket from './pages/BookTicket';
import PassengerDetails from './pages/PassengerDetails';
import PaymentPage from './pages/PaymentPage';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';
import MyTickets from './pages/MyTickets';
import BookingHistory from './pages/BookingHistory';
import TicketDetails from './pages/TicketDetails';
import Profile from './pages/Profile';
import Help from './pages/Help';
import AdminDashboard from './pages/AdminDashboard';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <BookingProvider>
          <div className="flex flex-col min-h-screen bg-gray-50">
            <Navbar />
            <main className="flex-grow flex flex-col">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/help" element={<Help />} />

                {/* User Protected Routes */}
                <Route
                  path="/book-ticket"
                  element={
                    <BookTicket />
                  }
                />
                <Route
                  path="/passenger-details"
                  element={
                    <PassengerDetails />
                  }
                />
                <Route
                  path="/payment"
                  element={
                    <ProtectedRoute>
                      <PaymentPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/payment-success"
                  element={
                    <ProtectedRoute>
                      <PaymentSuccess />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/payment-failed"
                  element={
                    <ProtectedRoute>
                      <PaymentFailed />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-tickets"
                  element={
                    <ProtectedRoute>
                      <MyTickets />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/booking-history"
                  element={
                    <ProtectedRoute>
                      <BookingHistory />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ticket/:id"
                  element={
                    <ProtectedRoute>
                      <TicketDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Protected Routes */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />

                {/* Fallback to Home */}
                <Route path="*" element={<Home />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BookingProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
