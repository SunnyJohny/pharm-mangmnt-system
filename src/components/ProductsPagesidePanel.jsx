import React from 'react';
import { FaProductHunt, FaBoxes, FaChartBar, FaReceipt, FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';
import UserInformation from './User';
import { useMyContext } from '../Context/MyContext';
import { Link, useNavigate } from 'react-router-dom';

const ProductsPageSidePanel = () => {
  const { state, logout, toggleSidePanel } = useMyContext(); // Added toggleSidePanel from context
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Call logoutUser method from context
    navigate('/'); // Navigate to home page
    toggleSidePanel(); // Close the panel
  };

  const handleLinkClick = () => {
    toggleSidePanel(); // Close the panel when a link is clicked
  };

  return (
    <div className="flex flex-col bg-gray-800 text-white p-4 h-screen overflow-y-auto"> {/* Fixed overflow-y-auto */}
      <UserInformation user={state.user} />
      <hr className="my-4 border-t-2 border-white" />
      {/* Tabs */}
      <div className="flex flex-col space-y-2">
        <Link
          to="/posscreen"
          className="flex items-center p-2 cursor-pointer hover:bg-gray-700"
          onClick={handleLinkClick}
        >
          <FaProductHunt className="text-xl" />
          <p className="ml-2">Product Page</p>
        </Link>
        <Link
          to="/inventory-page"
          className="flex items-center p-2 cursor-pointer hover:bg-gray-700"
          onClick={handleLinkClick}
        >
          <FaBoxes className="text-xl" />
          <p className="ml-2">Inventory</p>
        </Link>
        <Link
          to="/sales"
          className="flex items-center p-2 cursor-pointer hover:bg-gray-700"
          onClick={handleLinkClick}
        >
          <FaChartBar className="text-xl" />
          <p className="ml-2">Sales Report</p>
        </Link>
        <Link
          to=""
          className="flex items-center p-2 cursor-pointer hover:bg-gray-700"
          onClick={handleLinkClick}
        >
          <FaReceipt className="text-xl" />
          <p className="ml-2">Invoice/Receipt</p>
        </Link>
        <Link
          to=""
          className="flex items-center p-2 cursor-pointer hover:bg-gray-700"
          onClick={handleLinkClick}
        >
          <FaUser className="text-xl" />
          <p className="ml-2">User Profile</p>
        </Link>
        <Link
          to=""
          className="flex items-center p-2 cursor-pointer hover:bg-gray-700"
          onClick={handleLinkClick}
        >
          <FaCog className="text-xl" />
          <p className="ml-2">Settings</p>
        </Link>
        <Link
          to="/"
          onClick={handleLogout}
          className="flex items-center p-2 cursor-pointer hover:bg-gray-700"
        >
          <FaSignOutAlt className="text-xl" />
          <p className="ml-2">Logout</p>
        </Link>
      </div>
    </div>
  );
};

export default ProductsPageSidePanel;
