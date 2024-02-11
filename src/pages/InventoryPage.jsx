import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendar } from 'react-icons/fa';

import { useMyContext } from '../Context/MyContext';
import InventorySidePanel from '../components/InventorySidePanel';

const InventoryPage = () => {
  const { state, searchInventoryByKeyword } = useMyContext();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [filteredItems, setFilteredItems] = useState([]);

  useEffect(() => {
    // Initialize with inventory data from the context
    setFilteredItems(state.products || []);
  }, [state.products]);

  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const itemsToDisplay = filteredItems.slice(startIndex, endIndex);

  const searchItems = (e) => {
    let searchText = '';

    if (e && e.target && e.target.value) {
      // If called with an event object, extract the search text
      searchText = e.target.value.toLowerCase();
    }

    // Use searchInventoryByKeyword from context to filter items by keyword
    const filtered = searchInventoryByKeyword(searchText);

    // Apply date filtering
    const filteredByDate = filtered.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate >= new Date(fromDate) && itemDate <= new Date(toDate);
    });

    setFilteredItems(filteredByDate);
  };

  const handleFromDateChange = (date) => {
    setFromDate(date);
  };

  const handleToDateChange = (date) => {
    setToDate(date);
  };

  const generateSn = (index) => index + 1;


  
  

  const handleTableDateClick = (date) => {
    setFromDate(date);
    setToDate(date);
  };

  const renderActionButtons = () => {
    const handlePrintInventory = () => {
      // Implement your logic for printing inventory here
      console.log('Printing Inventory');
    };

    return (
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded-md"
        onClick={handlePrintInventory}
      >
        Print Inventory
      </button>
    );
  };

  const renderPaginationButtons = () => {
    const handlePreviousPage = () => {
      setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
    };

    const handleNextPage = () => {
      setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
    };

    return (
      <div className="flex space-x-80">
        <button
          className={`px-4 py-2 rounded-md ${
            currentPage === 1
              ? 'bg-gray-300 text-gray-700'
              : 'bg-blue-500 text-white'
          }`}
          onClick={handlePreviousPage}
        >
          Previous
        </button>
        {renderActionButtons()}
        <button
          className={`px-4 py-2 rounded-md ${
            currentPage === totalPages
              ? 'bg-gray-300 text-gray-700'
              : 'bg-blue-500 text-white'
          }`}
          onClick={handleNextPage}
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="container mx-auto flex">
      <div className="flex-none">
        <InventorySidePanel />
      </div>

      <div className="ml-8 flex-1">
        <div className="mb-8 p-2">
          <h2 className="text-2xl font-bold">Inventory Stats</h2>
          <div className="flex mt-4 space-x-4">
            {renderStatCard('Total Products', totalItems.toString(), 'blue')}
            {renderStatCard('Total Store Value', '2', 'pink')}
            {renderStatCard('Out Of Stock', '3', 'red')}
            {renderStatCard('All Categories', '2', 'pink')}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Inventory Items</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="text-lg">Inventory by Date</div>
              <div className="relative">
                <DatePicker
                  selected={fromDate}
                  onChange={handleFromDateChange}
                  dateFormat="dd-MM-yyyy"
                  placeholderText="From"
                  className="border border-gray-300 rounded-md p-2 pl-2 cursor-pointer"
                />
                <FaCalendar className="absolute top-3 right-2  text-gray-400 pointer-events-none" />
              </div>
              <div className="relative">
                <DatePicker
                  selected={toDate}
                  onChange={handleToDateChange}
                  dateFormat="dd-MM-yyyy"
                  placeholderText="To"
                  className="border border-gray-300 rounded-md p-2 pl-2 cursor-pointer"
                />
                <FaCalendar className="absolute top-3 right-2  text-gray-400 pointer-events-none" />
              </div>
            </div>
            <input
              type="text"
              className="border border-gray-300 rounded-md p-2"
              placeholder="Search"
              onChange={searchItems}
              style={{ marginLeft: 'auto', marginRight: '16px' }}
            />
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              className="text-blue-500 cursor-pointer"
              onClick={() => window.history.back()}
            >
              Back
            </button>
          </div>

          {/* Table container with overflow-y-auto */}
          <div className="table-container overflow-y-auto">
            <table className="w-full table-auto">
              <thead>
                <tr>
                  <th className="border">S/n</th>
                  <th className="border">Name</th>
                  <th className="border">Date</th>
                  <th className="border">Item ID</th>
                  <th className="border">Opening Bal</th>

                  <th className="border">Qty-In</th>
                  <th className="border">Total Bal</th>
                  <th className="border">Qty Sold</th>
                  <th className="border">Qty Balance</th>
                  <th className="border">CostPrice</th>
                  <th className="border">Sales Price</th>
                  <th className="border">Item Value</th>
                  <th className="border">Action</th>
                </tr>
              </thead>
              <tbody>
                {itemsToDisplay.map((item) => (
                  <tr key={item.sn}>
                   <td className="border">{generateSn(itemsToDisplay.indexOf(item), totalItems)}</td>

                    <td className="border">{item.name}</td>
                    <td
                      className="border cursor-pointer text-blue-500"
                      onClick={() => handleTableDateClick(item.date)}
                    >
                      {item.date}
                    </td>
                    <td className="border">{item.id.slice(0, 3) + (item.id.length > 3 ? '...' : '')}</td>
                   
                   {/* <td className="border">{item['Opening-Balance'] && item['Opening-Balance'].length > 0 ? item['Opening-Balance'][0] : 0}</td> */}
                   <td className="border">
                      {console.log("Opening-Balance", item['Opening-Balance'])}
                      {item['Opening-Balance'] && item['Opening-Balance'].length > 0
                        ? item['Opening-Balance'][0]
                        : 'N/A'}
                    </td>

                    <td className="border">{item['Quantity-In'] && item['Quantity-In'].length > 0 ? item['Quantity-In'][0] : 'N/A'}</td>
                    <td className="border">
  {console.log("Opening-Balance", item['Opening-Balance'])}
  {console.log("Quantity-In", item['Quantity-In'])}
  {(
    (item['Opening-Balance'] && item['Opening-Balance'].length > 0 ? parseFloat(item['Opening-Balance'][0]) : 0) +
    (item['Quantity-In'] && item['Quantity-In'].length > 0 ? parseFloat(item['Quantity-In'][0]) : 0)
  ).toFixed(2)}
</td>



                    <td className="border">{item.value}</td>
                    <td className="border">{item.sn}</td>
                    <td className="border">{item.name}</td>
                  
                    <td className="border">{item.price}</td>
                    <td className="border">{item.QtyOut}</td>
                    <td className="border">{item.quantity}</td>
                    <td className="border">{item.value}</td>
                  
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between mt-4">
            {renderPaginationButtons()}
          </div>
        </div>
      </div>
    </div>
  );
};

const renderStatCard = (title, value, color) => (
  <div className={`flex-1 bg-${color}-500 text-white p-4 rounded-md`}>
    <div className="text-sm">{title}</div>
    <div className="text-2xl font-bold">{value}</div>
  </div>
);

export default InventoryPage;
