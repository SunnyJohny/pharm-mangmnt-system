import React from 'react';
import { FaPlus, FaListAlt, FaUserCircle, FaBug, FaSignOutAlt } from 'react-icons/fa';
import UserInformation from './User';
import { useMyContext } from '../Context/MyContext';
import { Link, useNavigate } from 'react-router-dom';

const InventorySidePanel = () => {
  const { state, logout, toggleSidePanel } = useMyContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/'); // Navigate to home page
    // toggleSidePanel(); // Close the panel
  };

  const handleLinkClick = () => {
    if (state.user && window.matchMedia("(max-width: 768px)").matches) { // Check if user exists and screen is small
      toggleSidePanel(); // Close the panel
    }
  };

  return (
    <div className="flex flex-col bg-gray-800 text-white p-4 h-screen">
      <UserInformation user={state.user} />
      <hr className="my-4 border-t-2 border-white" />
      {/* Links */}
      <div className="flex flex-col flex-grow ">
        <Link
          to="/add-asset"
          className="flex items-center p-2 cursor-pointer hover:bg-gray-700"
          onClick={handleLinkClick}
        >
          <FaPlus className="text-xl" />
          <p className="ml-2">Fixed Asset</p>
        </Link>
        <Link
          to="/add-liability"
          className="flex items-center p-2 cursor-pointer hover:bg-gray-700"
          onClick={handleLinkClick}
        >
          <FaPlus className="text-xl" />
          <p className="ml-2">Liability</p>
        </Link>
        <Link
          to="/add-shares"
          className="flex items-center p-2 cursor-pointer hover:bg-gray-700"
          onClick={handleLinkClick}
        >
          <FaPlus className="text-xl" />
          <p className="ml-2">Manage Shares</p>
        </Link>
        <Link
          to="/sales"
          className="flex items-center p-2 cursor-pointer hover:bg-gray-700"
          onClick={handleLinkClick}
        >
          <FaListAlt className="text-xl" />
          <p className="ml-2">Sales</p>
        </Link>
        <Link
          to="/account"
          className="flex items-center p-2 cursor-pointer hover:bg-gray-700"
          onClick={handleLinkClick}
        >
          <FaUserCircle className="text-xl" />
          <p className="ml-2">Account</p>
        </Link>
        <Link
          to="/sign-up"
          className="flex items-center p-2 cursor-pointer hover:bg-gray-700"
          onClick={handleLinkClick}
        >
          <FaUserCircle className="text-xl" />
          <p className="ml-2">Staff Profile</p>
        </Link>
        <Link
          to="/report-bug"
          className="flex items-center p-2 cursor-pointer hover:bg-gray-700"
          onClick={handleLinkClick}
        >
          <FaBug className="text-xl" />
          <p className="ml-2">Report Bug</p>
        </Link>
        <Link
          to="/"
          onClick={handleLogout}
          className="flex items-center p-2 mb-2 cursor-pointer hover:bg-gray-700"
        >
          <FaSignOutAlt className="text-xl" />
          <p className="ml-2">Logout</p>
        </Link>
      </div>
    </div>
  );
};

export default InventorySidePanel;