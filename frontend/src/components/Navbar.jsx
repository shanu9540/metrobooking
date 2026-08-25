import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Train, Menu, X, LogOut, User as UserIcon, Shield } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'text-teal-400 bg-teal-950/40 font-semibold' : 'text-gray-300 hover:text-white hover:bg-gray-800';
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Book Ticket', path: '/book-ticket' },
    { label: 'My Tickets', path: '/my-tickets', protected: true },
    { label: 'Booking History', path: '/booking-history', protected: true },
    { label: 'Help', path: '/help' }
  ];

  return (
    <nav className="bg-gray-900 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 text-teal-400 font-extrabold text-xl tracking-wide">
              <Train className="h-6 w-6 stroke-[2.5]" />
              <span>MetroGo</span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map((link) => {
              if (link.protected && !isAuthenticated) return null;
              return (
                <Link
                  key={link.label}
                  to={link.path}
                  className={`px-3 py-2 rounded-md text-sm transition-colors duration-200 ${isActive(link.path)}`}
                >
                  {link.label}
                </Link>
              );
            })}

            {isAuthenticated && isAdmin && (
              <Link
                to="/admin"
                className={`px-3 py-2 rounded-md text-sm transition-colors duration-200 flex items-center gap-1 ${isActive('/admin')}`}
              >
                <Shield className="h-4 w-4" />
                Admin
              </Link>
            )}
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link to="/profile" className="flex items-center space-x-1.5 text-gray-300 hover:text-white group">
                  <UserIcon className="h-4.5 w-4.5 group-hover:text-teal-400" />
                  <span className="text-sm font-medium">{user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-red-600/80 hover:bg-red-600 text-sm font-medium rounded-md transition-colors duration-200"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-md text-sm font-semibold shadow-sm transition-colors duration-200"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-850 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Links */}
      {isOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-800 px-2 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            if (link.protected && !isAuthenticated) return null;
            return (
              <Link
                key={link.label}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-md text-base ${isActive(link.path)}`}
              >
                {link.label}
              </Link>
            );
          })}

          {isAuthenticated && isAdmin && (
            <Link
              to="/admin"
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2 rounded-md text-base flex items-center gap-1 ${isActive('/admin')}`}
            >
              <Shield className="h-5 w-5" />
              Admin Panel
            </Link>
          )}

          {/* Mobile Auth Button */}
          <div className="border-t border-gray-800 mt-3 pt-3 px-3">
            {isAuthenticated ? (
              <div className="flex flex-col space-y-3">
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-2 text-gray-300 hover:text-white"
                >
                  <UserIcon className="h-5 w-5 text-teal-400" />
                  <span>{user.name} (Profile)</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-650 hover:bg-red-650 text-white rounded-md text-base font-semibold"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-2">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-2 text-gray-300 hover:text-white font-medium border border-gray-700 rounded-md"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-md font-semibold"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
