import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendar } from 'react-icons/fa';
import { useMyContext } from '../Context/MyContext';
import InventorySidePanel from '../components/InventorySidePanel';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ProductsPageSidePanel from '../components/ProductsPagesidePanel';

const InventoryPage = () => {
  const { state } = useMyContext();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(100);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [filteredItems, setFilteredItems] = useState([]);
  const [totalStoreValue, setTotalStoreValue] = useState(0);
  const [firstRestockDates, setFirstRestockDates] = useState({});
  const [allPagesContent, setAllPagesContent] = useState([]);
  const navigate = useNavigate();
  const tableRef = useRef(null);

  useEffect(() => {
    const initialItems = state.products || [];
    setFilteredItems(initialItems);

    if (initialItems.length > 0) {
      const datesMap = {};
      initialItems.forEach((product) => {
        if (Array.isArray(product.quantityRestocked) && product.quantityRestocked.length > 0) {
          const lastRestockEntry = product.quantityRestocked[product.quantityRestocked.length - 1];
          if (lastRestockEntry && lastRestockEntry.time && lastRestockEntry.time.toDate) {
            const productLastRestockTime = lastRestockEntry.time.toDate();
            datesMap[product.name] = productLastRestockTime;
          } else {
            console.log("Last restock entry has no 'time' property for", product.name);
          }
        } else {
          console.log("No restock history for", product.name);
        }
      });
      setFirstRestockDates(datesMap);
    }

    calculateTotalStoreValue(initialItems);
  }, [state.products, state.productTotals, state.productTotalsMap]);

  const searchItems = (e) => {
    let searchText = '';

    if (e && e.target && e.target.value) {
      searchText = e.target.value.toLowerCase();
    }

    const filteredByKeyword = searchInventoryByKeyword(state.products, searchText);
    const filteredByDate = searchByDate(filteredByKeyword, fromDate, toDate);

    setFilteredItems(filteredByDate);
    calculateTotalStoreValue(filteredByDate);
  };


  useEffect(() => {
    if (tableRef.current) {
      console.log('Container dimensions:', tableRef.current.offsetWidth, tableRef.current.offsetHeight);
    }
  }, []);

  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const itemsToDisplay = filteredItems.slice(startIndex, endIndex);

  const searchInventoryByKeyword = (items, searchText) => {
    return items.filter((item) => item.name.toLowerCase().includes(searchText));
  };

  const searchByDate = (items, startDate, endDate) => {
    return items.filter((item) => {
      const productDate = new Date(firstRestockDates[item.name]);
      return productDate >= startDate && productDate <= endDate;
    });
  };

  const handleFromDateChange = (date) => {
    setFromDate(date);
    searchItems();
  };

  const handleToDateChange = (date) => {
    setToDate(date);
    searchItems();
  };

  const generateSn = (index) => index + 1;

  const handleRowClick = (itemId) => {
    navigate(`/product-details/${itemId}`);
  };

  const renderActionButtons = () => {
    // InventoryPage.jsx
    const handlePrintInventory = async () => {
      const pdf = new jsPDF();

      // Create a reference to the table container
      const tableContainer = document.querySelector('.table-container');

      if (tableContainer) {
        // Capture the content of the entire table container
        const canvas = await html2canvas(tableContainer);
        const imgData = canvas.toDataURL('image/png');

        // Add the captured image to the PDF
        pdf.addImage(imgData, 'PNG', 10, 10);

        // Save the content of the first page
        const firstPageContent = imgData;

        // If there are more pages, capture and append their content
        if (allPagesContent.length > 0) {
          for (let index = 0; index < allPagesContent.length; index++) {
            const pageContent = allPagesContent[index];
            pdf.addPage();
            pdf.addImage(pageContent, 'PNG', 10, 10 + (index + 1) * tableContainer.clientHeight);
          }
        }

        // Save and open the PDF
        // pdf.save('inventory.pdf');

        // Navigate to the print page with relevant data
        navigate('/print-inventory', {
          state: {
            itemsToDisplay: itemsToDisplay.map((item, index) => ({
              ...item,
              sn: generateSn(index),
            })),
            // Pass other necessary data to PrintInventoryPage
            state: {
              itemsPerPage,
              filteredItems,
              totalStoreValue,
              firstRestockDates,
              allPagesContent,
            },
          },
        });
      }
    };



    const navigate = useNavigate();
    const [selectedProduct, setSelectedProduct] = useState(null); // State to store selected product data

    // Function to handle edit action
    const handleEdit = (item) => {
      // setSelectedProduct(item); // Set selected product data
      console.log("Selected Product:", item); // Log selected product data
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

  useEffect(() => {
    // Initialize with inventory data from the context
    const initialItems = state.products || [];
    setFilteredItems(initialItems);

    // ... (existing code)

    // Call calculateTotalStoreValue with the filtered items
    // Capture the content of each page
    const capturePagesContent = async () => {
      const pagesContent = [];
      const tableContainer = document.querySelector('.table-container');
      const itemsPerPage = 100;

      if (tableContainer) {
        const totalItems = filteredItems.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);

        for (let page = 1; page <= totalPages; page++) {
          const startIndex = (page - 1) * itemsPerPage;
          const endIndex = startIndex + itemsPerPage;
          const itemsToDisplay = filteredItems.slice(startIndex, endIndex);

          setFilteredItems(itemsToDisplay); // Update filteredItems for the current page
          calculateTotalStoreValue(itemsToDisplay);

          // Wait for the container to render content
          await new Promise((resolve) => setTimeout(resolve, 500));

          const canvas = await html2canvas(tableContainer);
          pagesContent.push(canvas.toDataURL('image/png'));
        }

        setAllPagesContent(pagesContent);
        setFilteredItems(initialItems); // Restore original filteredItems
        calculateTotalStoreValue(initialItems);
      }
    };

    // Call the async function
    capturePagesContent();
  }, [state.products, state.productTotals, state.productTotalsMap]);
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
          className={`px-4 py-2 rounded-md ${currentPage === 1 ? 'bg-gray-300 text-gray-700' : 'bg-blue-500 text-white'
            }`}
          onClick={handlePreviousPage}
        >
          Previous
        </button>
        {renderActionButtons()}
        <button
          className={`px-4 py-2 rounded-md ${currentPage === totalPages ? 'bg-gray-300 text-gray-700' : 'bg-blue-500 text-white'
            }`}
          onClick={handleNextPage}
        >
          Next
        </button>
      </div>
    );
  };

  const calculateTotalStoreValue = (items) => {
    const calculatedTotalStoreValue = items.reduce(
      (total, item) =>
        total +
        item.price * ((state.productTotals.get(item.name) || 0) - (state.productTotalsMap.get(item.name) || 0)),
      0
    );
    setTotalStoreValue(calculatedTotalStoreValue.toFixed(2));
  };

  return (
    <div className="container mx-auto flex">
      <div className="flex-none">
        {/* Render InventorySidePanel if user exists and role is admin, otherwise render ProductsPagesidePanel */}
        {state.user && state.user.role === 'admin' ? <InventorySidePanel /> : <ProductsPageSidePanel />}
      </div>

      <div className="ml-8 flex-1">
        <div className="mb-8 p-2">
          <h2 className="text-2xl font-bold">Inventory Stats</h2>
          <div className="flex mt-4 space-x-4">
            {renderStatCard('Total Products', totalItems.toString(), 'blue')}
            {renderStatCard('Total Store Value', `₦${totalStoreValue}`, 'pink')}
            {renderStatCard(
              'Out Of Stock',
              filteredItems.filter(
                (item) => (state.productTotals.get(item.name) || 0) - (state.productTotalsMap.get(item.name) || 0) === 0
              ).length.toString(),
              'red'
            )}
            {renderStatCard('All Categories', '2', 'blue')}


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
            <button className="text-blue-500 cursor-pointer" onClick={() => window.history.back()}>
              Back
            </button>
          </div>


          <div className="table-container overflow-x-auto overflow-y-auto" style={{ maxHeight: '100px' }} ref={tableRef}>
            <table className="w-full table-auto" id="inventory-table">
              <thead>
                <tr>
                  <th className="border">S/n</th>
                  <th className="border">Name</th>
                  <th className="border">Date</th>
                  <th className="border">Item ID</th>
                  <th className="border">Qty Restocked</th>
                  <th className="border">Total Bal</th>
                  <th className="border">Qty Sold</th>
                  <th className="border">Qty Balance</th>
                  <th className="border">M.Unit</th>

                  <th className="border">CostPrice</th>
                  <th className="border">Sales Price</th>
                  <th className="border">Item Value</th>


                  <th className="border">
                    {state.user && state.user.role === 'admin' ? (
                      <>
                        Action
                      </>
                    ) : null}
                  </th>

                </tr>
              </thead>
              <tbody>
                {itemsToDisplay.map((item) => (
                  <tr
                    key={item.sn}
                    onClick={() => handleRowClick(item.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td className="border">{generateSn(itemsToDisplay.indexOf(item))}</td>
                    <td className="border">{item.name}</td>
                    <td className="border">{firstRestockDates[item.name]?.toLocaleDateString()}</td>
                    <td className="border">{item.id.slice(0, 3) + (item.id.length > 3 ? '...' : '')}</td>
                    <td className="border">{state.productTotals.get(item.name) || 0}</td>
                    <td className="border">{state.productTotals.get(item.name) || 0}</td>
                    <td className="border">{state.productTotalsMap.get(item.name) || 0}</td>
                    <td className="border">
                      {(
                        (state.productTotals.get(item.name) || 0) -
                        (state.productTotalsMap.get(item.name) || 0)
                      )}
                    </td>
                    <td className="border">
                      Piece
                    </td>
                    <td className="border">{Number(item.costPrice).toFixed(2)}</td>
                    <td className="border">{Number(item.price).toFixed(2)}</td>

                    <td className="border">
                      {(
                        item.price *
                        ((state.productTotals.get(item.name) || 0) -
                          (state.productTotalsMap.get(item.name) || 0))
                      ).toFixed(2)}
                    </td>
                    <td className="border">
  {state.user && state.user.role === 'admin' ? (
    <>
      <Link to="/add-product" onClick={(e) => e.stopPropagation()}>
        <FontAwesomeIcon
          icon={faEdit}
          style={{ cursor: 'pointer', marginRight: '8px', color: 'blue' }}
        />
      </Link>
      <FontAwesomeIcon
        icon={faTrash}
        style={{ cursor: 'pointer', color: 'red' }}
      />
    </>
  ) : null}
</td>


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
