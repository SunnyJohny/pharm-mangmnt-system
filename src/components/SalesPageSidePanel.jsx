import React from 'react';
import { FaProductHunt, FaBoxes, FaChartBar, FaReceipt, FaCog, FaSignOutAlt, FaMoneyBillWave, FaUserCircle } from 'react-icons/fa'; // Added FaMoneyBillWave icon for "Add Tax"
import UserInformation from './User';
import { useMyContext } from '../Context/MyContext';
import { Link, useNavigate } from 'react-router-dom';

const SalesPageSidePanel = () => {
  const { state, logout } = useMyContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Call logoutUser method from context
    navigate('/'); // Navigate to home page
  };

  return (
    <div className="flex flex-col bg-gray-800 text-white h-full"> {/* Set height to full and add vertical scroll */}
      <UserInformation user={state.user} />
      <hr className="my-4 border-t-2 border-white" />
      {/* Tabs */}
      <div className="flex flex-col flex-grow "> {/* Use flex-grow to fill remaining space */}
        <Link to="/posscreen" className="flex items-center p-2 cursor-pointer hover:bg-gray-700">
          <FaProductHunt className="text-xl" />
          <p className="ml-2">Sales Page</p>
        </Link>
        <Link to="/inventory-page" className="flex items-center p-2 cursor-pointer hover:bg-gray-700">
          <FaBoxes className="text-xl" />
          <p className="ml-2">Inventory</p>
        </Link>
        <Link to="/expenses" className="flex items-center p-2 cursor-pointer hover:bg-gray-700">
          <FaChartBar className="text-xl" />
          <p className="ml-2">Expenses </p>
        </Link>
        <Link to="/purchases" className="flex items-center p-2 cursor-pointer hover:bg-gray-700">
          <FaChartBar className="text-xl" />
          <p className="ml-2">Goods Purchases </p>
        </Link>
        
        {/* New Link for "Add Tax" */}
        <Link to="/add-tax" className="flex items-center p-2 cursor-pointer hover:bg-gray-700">
          <FaMoneyBillWave className="text-xl" /> {/* Use the appropriate icon */}
          <p className="ml-2">Add Tax </p> {/* Adjust the text as needed */}
        </Link>
        {/* End of New Link */}
        <Link to="/posscreen" className="flex items-center p-2 cursor-pointer hover:bg-gray-700">
          <FaChartBar className="text-xl" />
          <p className="ml-2">Pos Screen</p>
        </Link>
        <Link to="/profitandloss" className="flex items-center p-2 cursor-pointer hover:bg-gray-700">
          <FaReceipt className="text-xl" />
          <p className="ml-2">Profit & Loss Statement</p>
        </Link>
        <Link to="/balance-sheet" className="flex items-center p-2 cursor-pointer hover:bg-gray-700">
          <FaReceipt className="text-xl" />
          <p className="ml-2">Balance Sheet</p>
        </Link>
        <Link to="/cash-flow" className="flex items-center p-2 cursor-pointer hover:bg-gray-700">
          <FaReceipt className="text-xl" />
          <p className="ml-2">Cash Flow Statement</p>
        </Link>
        <Link to="/sign-up" className="flex items-center p-2 cursor-pointer hover:bg-gray-700">
          <FaUserCircle className="text-xl" />
          <p className="ml-2">Staff Profile</p>
        </Link>
        <Link to="/settings" className="flex items-center p-2 cursor-pointer hover:bg-gray-700">
          <FaCog className="text-xl" />
          <p className="ml-2">Settings</p>
        </Link>
        <Link to="/" onClick={handleLogout} className="flex items-center p-2 mb-2 cursor-pointer hover:bg-gray-700">
          <FaSignOutAlt className="text-xl" />
          <p className="ml-2">Logout</p>
        </Link>
      </div>
    </div>
  );
};

export default SalesPageSidePanel;
