import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContexts'; // Update this path as needed

const Sidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const sidebarItems = ['Home', 'Menu', 'Orders', 'Customers'];

  const handleLogout = () => {
    logout();
    // The redirection should be handled in your routes based on auth state
  };

  return (
    <div className="bg-gray-800 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition duration-200 ease-in-out">
      {sidebarItems.map((item) => (
        <Link
          key={item}
          to={`/dashboard/${item.toLowerCase()}`}
          className={`block py-2.5 px-4 rounded transition duration-200 ${
            location.pathname === `/dashboard/${item.toLowerCase()}` 
              ? 'bg-blue-500 hover:bg-blue-600' 
              : 'hover:bg-gray-700'
          }`}
        >
          {item}
        </Link>
      ))}
      <button
        onClick={handleLogout}
        className="block w-full text-left py-2.5 px-4 rounded transition duration-200 hover:bg-red-600 mt-auto"
      >
        Logout
      </button>
    </div>
  );
};

export default Sidebar;