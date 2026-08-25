import React from 'react';
import { Link } from 'react-router-dom';
import { Train } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-905 bg-gray-900 border-t border-gray-800 text-gray-400 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-2 text-teal-450 text-teal-400 font-extrabold text-lg">
            <Train className="h-5 w-5" />
            <span>MetroGo</span>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link to="/" className="hover:text-white transition-colors duration-200">Home</Link>
            <Link to="/book-ticket" className="hover:text-white transition-colors duration-200">Book Ticket</Link>
            <Link to="/help" className="hover:text-white transition-colors duration-200">Help & Support</Link>
            <Link to="/admin" className="hover:text-white transition-colors duration-200">Admin Portal</Link>
          </div>

          <div className="text-sm">
            &copy; {new Date().getFullYear()} MetroGo Transit Systems. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
