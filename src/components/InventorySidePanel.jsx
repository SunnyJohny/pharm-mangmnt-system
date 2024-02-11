import React from 'react';
import { FaPlus, FaClipboardList, FaListAlt, FaUserCircle, FaBug, FaSignOutAlt } from 'react-icons/fa';
import UserInformation from './User'; // Import UserInformation
import { useMyContext } from '../Context/MyContext'; // Import useMyContext
import { Link } from 'react-router-dom';

const InventorySidePanel = ({ onItemSelected }) => {
  const { state } = useMyContext(); // Use the useMyContext hook

  return (
    <div className="w-64 bg-gray-200">
      <div className="p-4">
        <UserInformation user={state.user} /> {/* Use UserInformation component */}
      </div>

      <hr className="border-t-2 border-gray-400" />

      {/* Links */}
      <div className="p-4">
        <Link to="/dashboard" className="flex items-center p-2 cursor-pointer hover:bg-gray-700">
          <FaClipboardList className="text-xl" />
          <p className="ml-2">Dashboard</p>
        </Link>

        <Divider />

        <Link to="/add-product" className="flex items-center p-2 cursor-pointer hover:bg-gray-700">
          <FaPlus className="text-xl" />
          <p className="ml-2">Add Product</p>
        </Link>

        <Divider />

        <Link to="/categories" className="flex items-center p-2 cursor-pointer hover:bg-gray-700">
          <FaListAlt className="text-xl" />
          <p className="ml-2">Categories</p>
        </Link>

        <Divider />

        <Link to="/account" className="flex items-center p-2 cursor-pointer hover-bg-gray-700">
          <FaUserCircle className="text-xl" />
          <p className="ml-2">Account</p>
        </Link>

        <Divider />

        <Link to="/report-bug" className="flex items-center p-2 cursor-pointer hover:bg-gray-700">
          <FaBug className="text-xl" />
          <p className="ml-2">Report Bug</p>
        </Link>

        <Divider />

        <Link to="/" className="flex items-center p-2 cursor-pointer hover:bg-gray-700">
          <FaSignOutAlt className="text-xl" />
          <p className="ml-2">Logout</p>
        </Link>
      </div>
    </div>
  );
};

export default InventorySidePanel;

// Divider Component
const Divider = () => <hr className="my-2 border-t-2 border-gray-400" />;
