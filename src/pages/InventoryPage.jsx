import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendar } from 'react-icons/fa';
import { useMyContext } from '../Context/MyContext';
import InventorySidePanel from '../components/InventorySidePanel';
import ProductsPageSidePanel from '../components/ProductsPagesidePanel';
import EditPopup from '../components/EditPopup';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'react-toastify';

const InventoryPage = () => {
  const { state } = useMyContext();
  const { selectedCompanyId } = state;

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [filteredItems, setFilteredItems] = useState([]);
  const [totalStoreValue, setTotalStoreValue] = useState(0);
  const [firstRestockDates, setFirstRestockDates] = useState({});
  const [selectedDateOption, setSelectedDateOption] = useState('All');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showEditPop, setShowEditPop] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const navigate = useNavigate();
  const tableRef = useRef(null);

  const calculateTotalStoreValue = useCallback((items) => {
    const calculatedTotalStoreValue = items.reduce(
      (total, item) =>
        total +
        item.price * ((state.productTotals.get(item.name) || 0) - (state.productTotalsMap.get(item.name) || 0)),
      0
    );
    setTotalStoreValue(calculatedTotalStoreValue.toFixed(2));
  }, [state.productTotals, state.productTotalsMap]);

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
          }
        }
      });
      setFirstRestockDates(datesMap);
    }

    calculateTotalStoreValue(initialItems);
  }, [state.products, calculateTotalStoreValue]);

  const searchByDate = useCallback((items, startDate, endDate) => {
    if (!startDate && !endDate) return items;

    return items.filter((item) => {
      const productDate = new Date(firstRestockDates[item.name]);

      if (startDate && endDate) {
        return productDate >= startDate && productDate <= endDate;
      } else if (startDate) {
        return productDate >= startDate;
      } else if (endDate) {
        return productDate <= endDate;
      }
      return true;
    });
  }, [firstRestockDates]);

  const calculateTotals = () => {
    let totalQtyRestocked = 0;
    let totalTotalBal = 0;
    let totalQtySold = 0;
    let totalQtyBalance = 0;
    let totalCostPrice = 0;
    let totalSalesPrice = 0;
    let totalItemValue = 0;
    let totalCostValue = 0; // New variable for the total cost value
    let totalSalesPriceValue = 0; // New variable for the total sales price value

    filteredItems.forEach((item) => {
      const qtyRestocked = state.productTotals.get(item.name) || 0;
      const totalBal = state.productTotals.get(item.name) || 0;
      const qtySold = state.productTotalsMap.get(item.name) || 0;
      const qtyBalance = qtyRestocked - qtySold;
      const costPrice = Number(item.costPrice);
      const salesPrice = Number(item.price);
      const itemValue = salesPrice * qtyBalance;
      const costValue = costPrice * qtyRestocked; // Cost value for this item
      const salesPriceValue = salesPrice * qtySold; // Total sales price value for this item

      totalQtyRestocked += qtyRestocked;
      totalTotalBal += totalBal;
      totalQtySold += qtySold;
      totalQtyBalance += qtyBalance;
      totalCostPrice += costPrice;
      totalSalesPrice += salesPrice;
      totalItemValue += itemValue;
      totalCostValue += costValue; // Add to totalCostValue
      totalSalesPriceValue += salesPriceValue; // Add to totalSalesPriceValue
    });

    return {
      totalQtyRestocked,
      totalTotalBal,
      totalQtySold,
      totalQtyBalance,
      totalCostPrice,
      totalSalesPrice,
      totalItemValue,
      totalCostValue, // Include in returned totals
      totalSalesPriceValue, // Include in returned totals
    };
  };

  // Call the calculateTotals function to get totals
  const {
    totalQtyRestocked,
    totalTotalBal,
    totalQtySold,
    totalQtyBalance,
    totalCostPrice,
    totalSalesPrice,
    totalItemValue,
    totalCostValue, // Ensure you include this in the destructuring
    totalSalesPriceValue, // Include in destructuring
  } = calculateTotals();

  const searchInventoryByKeyword = (items, searchText) => {
    if (!Array.isArray(items)) return [];
    return items.filter((item) => {
      const name = item.name || '';
      return name.toLowerCase().includes(searchText);
    });
  };

  const searchItems = useCallback(() => {
    let searchText = searchKeyword.toLowerCase();

    const filteredByKeyword = searchInventoryByKeyword(state.products, searchText);
    const filteredByDate = searchByDate(filteredByKeyword, fromDate, toDate);

    setFilteredItems(filteredByDate);
    calculateTotalStoreValue(filteredByDate);
  }, [searchKeyword, fromDate, searchByDate, calculateTotalStoreValue, toDate, state.products]);

  useEffect(() => {
    searchItems();
  }, [searchItems]);

  const handleDateOptionChange = (e) => {
    const selectedOption = e.target.value;
    setSelectedDateOption(selectedOption);

    let startDate = new Date();
    let endDate = new Date();

    switch (selectedOption) {
      case 'All':
        setFromDate(null);
        setToDate(null);
        return;
      case 'Today':
        // Set both fromDate and toDate to the current day
        startDate.setHours(0, 0, 0, 0); // Start of the day
        endDate.setHours(23, 59, 59, 999); // End of the day
        break;
      case 'This Week':
        // Set the start date to the beginning of the current week (Sunday) and end date to today
        const today = startDate.getDay(); // Get current day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
        startDate.setDate(startDate.getDate() - today); // Set start date to Sunday of the current week
        endDate = new Date(); // End date is today
        endDate.setHours(23, 59, 59, 999); // End of the day
        break;
      case 'This Week to Date':
        const startOfWeek = startDate.getDay();
        startDate.setDate(startDate.getDate() - startOfWeek); // Start date is Sunday of the current week
        // End date is today
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999); // End of the day
        break;
      case 'This Month':
        startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
        break;
      case 'This Month - Date':
        // Set start date to the 1st of the month
        startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

        // Set end date to today's date
        endDate = new Date();

        // Set end date to end of the day
        endDate.setHours(23, 59, 59, 999);
        break;

      case 'Last Month to Date':
        // Set start date to the first day of the previous month and end date to today
        startDate = new Date(startDate.getFullYear(), startDate.getMonth() - 1, 1);
        endDate = new Date(); // End date is today
        endDate.setHours(23, 59, 59, 999); // End of the day
        break;
      case 'This Fiscal Quarter':
        const quarterStartMonth = Math.floor((startDate.getMonth() / 3)) * 3; // Get the start month of the current quarter
        startDate = new Date(startDate.getFullYear(), quarterStartMonth, 1); // Start of quarter
        endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 3, 0); // End of quarter
        break;
      case 'This Fiscal Year':
        startDate = new Date(startDate.getFullYear(), 0, 1); // Start of fiscal year (January 1st)
        endDate = new Date(startDate.getFullYear() + 1, 0, 0); // End of fiscal year (December 31st)
        break;
      case 'Yesterday':
        startDate.setDate(startDate.getDate() - 1); // Subtract one day
        endDate = new Date(startDate);
        break;
      case 'Last Week':
        startDate.setDate(startDate.getDate() - 7); // Subtract seven days
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6); // Set end date to one day before the current date
        break;
      case 'Last Month':
        startDate = new Date(startDate.getFullYear(), startDate.getMonth() - 1, 1); // Set to previous month
        endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0); // Set to last day of previous month
        break;
      default:
        break;
    }

    setFromDate(new Date(startDate)); // Use new Date object to avoid reference issues
    setToDate(new Date(endDate));
  };

  const handleFromDateChange = (date) => {
    setFromDate(date);
    searchItems();
  };

  const handleToDateChange = (date) => {
    setToDate(date);
    searchItems();
  };

  // Function to format date as day/month/year
  const formatDate = (date) => {
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getExpiryColor = (expiryDate) => {
    if (!expiryDate) {
      // Return a default color or class if expiryDate is undefined
      return "text-black";
    }

    const now = new Date();
    const expiry = new Date(expiryDate); // Parse the string to a Date object

    if (isNaN(expiry.getTime())) {
      // If the date is invalid, return a default color or handle it as needed
      return "text-black";
    }

    const timeDifference = expiry - now;
    const daysUntilExpiry = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry <= 0) {
      return "text-red-500"; // Expired
    } else if (daysUntilExpiry <= 7) {
      return "text-red-500"; // Expiring within a week
    } else if (daysUntilExpiry <= 60) {
      return "text-yellow-500"; // Expiring within 2 months
    } else {
      return "text-black"; // Safe
    }
  };

  // Function to get the current date
  const getCurrentDate = () => {
    return formatDate(new Date());
  };

  // Function to render the selected date period
  const renderSelectedDatePeriod = () => {
    if (fromDate && toDate) {
      return `${formatDate(fromDate)} to ${formatDate(toDate)}`;
    } else if (fromDate) {
      return `From ${formatDate(fromDate)}`;
    } else if (toDate) {
      return `To ${formatDate(toDate)}`;
    } else {
      return 'All';
    }
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

  const generateSn = (index) => index + 1;

  const handleRowClick = (itemId) => {
    navigate(`/product-details/${itemId}`);
  };

  const deleteProduct = async (itemId, e) => {
    if (e) e.stopPropagation(); // Prevent event bubbling only if 'e' exists

    try {
      const productToDelete = filteredItems.find((product) => product.id === itemId);

      if (!productToDelete) {
        toast.error('Product not found!');
        return;
      }

      const confirmDelete = window.confirm(`Are you sure you want to delete "${productToDelete.name}"?`);

      if (!confirmDelete) return;

      // Create a reference to the Firestore document
      const productRef = doc(db, `companies/${selectedCompanyId}/products/${itemId}`);

      // Delete the document from Firestore
      await deleteDoc(productRef);

      // Notify parent component about the deletion
      // onDelete(itemId);

      // Show a success toast notification
      toast.success('Product deleted successfully!');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error deleting product. Please try again.');
    }
  };

  const handleEditClick = (itemId, e) => {
    e.stopPropagation();
    const productToEdit = filteredItems.find((product) => product.id === itemId);
    setSelectedProduct(productToEdit);
    setShowEditPop(true);
  };
  const handleDeleteClick = (itemId, e) => {
    e.stopPropagation(); // Prevents event bubbling
    const productToDelete = filteredItems.find((product) => product.id === itemId);

    if (productToDelete) {
      const confirmDelete = window.confirm(`Are you sure you want to delete "${productToDelete.name}"?`);
      if (confirmDelete) {
        // Perform delete action (e.g., update state or call Firestore delete function)
        deleteProduct(itemId);
      }
    }
  };

  const renderActionButtons = () => {
    const handlePrintInventory = async () => {
      const tableContainer = tableRef.current;

      if (tableContainer) {
        const printWindow = window.open('', '_blank');
        printWindow.document.write('<html><head><title>Inventory Table</title>');
        printWindow.document.write('<style>');
        printWindow.document.write('@media print {');
        printWindow.document.write('body { -webkit-print-color-adjust: exact; }');
        printWindow.document.write('.text-center { text-align: center; }');
        printWindow.document.write('.mb-4 { margin-bottom: 4px; }');
        printWindow.document.write('.table-print { border-collapse: collapse; width: 100%; }');
        printWindow.document.write('.table-print th, .table-print td { border: 2px solid black; padding: 8px; }');
        printWindow.document.write('.table-print thead { display: table-header-group; }');
        printWindow.document.write('.table-print tfoot { display: table-footer-group; }');
        printWindow.document.write('.table-print tr { page-break-inside: avoid; }');
        printWindow.document.write('.no-print { display: none !important; }');
        printWindow.document.write('}');
        printWindow.document.write('</style>');
        printWindow.document.write('</head><body>');

        // Add a wrapper with the class to ensure the table is styled correctly
        printWindow.document.write('<div class="table-print">');
        printWindow.document.write(tableContainer.innerHTML);  // Use innerHTML to exclude the wrapper
        printWindow.document.write('</div>');

        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
      } else {
        console.error('Table container not found.');
      }
    };

    return (
      <button className="bg-blue-500 text-white px-4 py-2 rounded-md" onClick={handlePrintInventory}>
        Print
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
      <div className="flex justify-between items-center w-full md:w-1/2 max-w-lg mx-auto mt-4">
        <button
          className={`px-3 py-1.5 rounded-md ${currentPage === 1 ? 'bg-gray-300 text-gray-700' : 'bg-blue-500 text-white'} mr-2`}
          onClick={handlePreviousPage}
        >
          Previous
        </button>
        {renderActionButtons()}
        <button
          className={`px-3 py-1.5 rounded-md ${currentPage === totalPages ? 'bg-gray-300 text-gray-700' : 'bg-blue-500 text-white'} ml-2`}
          onClick={handleNextPage}
        >
          


          Next
      </button>
      </div>
    );
  };

  const renderFooter = () => {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-center">
        <div>Total Products: {totalItems}</div>
        <div>
          Total Store Value: {state.user?.role === 'admin' ? `₦${totalStoreValue}` : 'XXXXXX'}
        </div>
        <div>Out Of Stock: {filteredItems.filter((item) => (state.productTotals.get(item.name) || 0) - (state.productTotalsMap.get(item.name) || 0) <= 0).length}</div>
        <div>All Categories: 2</div>
      </div>
    );
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 px-4 md:px-0">


      <div className="flex-none hidden lg:block max-h-screen overflow-y-auto">
        {state.user && state.user.role === "admin" ? (
          <InventorySidePanel />
        ) : (
          <ProductsPageSidePanel />
        )}
      </div>

      <div className="flex-1">
        <div className="mb-8 p-2">
          <div className="flex items-center justify-between mb-2">
            <button onClick={handleReload} className="p-2 bg-gray-200 rounded">
              Reload
            </button>
            <div className="flex-grow text-center">
              <h2 className="text-2xl font-bold">Inventory</h2>
            </div>
            <button className="text-blue-500 cursor-pointer pr-24" onClick={() => window.history.back()}>
              Back
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            {renderStatCard('Total Products', totalItems.toString(), 'blue')}
            {renderStatCard(
              'Total Store Value',
              state.user && state.user.role === 'admin' ? `₦${totalStoreValue}` : 'XXXXXX',
              'green'
            )}
            {renderStatCard(
              'Out Of Stock',
              filteredItems.filter(
                (item) => (state.productTotals.get(item.name) || 0) - (state.productTotalsMap.get(item.name) || 0) <= 0
              ).length.toString(),
              'red'
            )}
            {renderStatCard('All Categories', '2', 'gray')}
          </div>
        </div>

        <div className="mb-4">
          <p><strong>Inventory by Dates:</strong></p>
          <div className="flex flex-col md:flex-row md:items-center md:space-x-2 space-y-2 md:space-y-0">
            <div className="flex items-center space-x-2">
              <label htmlFor="dateOption" className="text-lg" style={{ marginRight: '16px' }}>
                Dates
              </label>
              <select
                id="dateOption"
                value={selectedDateOption}
                onChange={handleDateOptionChange}
                className="border border-gray-300 rounded-md p-2 pl-4"
                style={{ width: '150px' }}
              >
                <option value="All">All</option>
                <option value="Today">Today</option>
                <option value="This Week">This Week</option>
                <option value="This Week - Date">This Week - Date</option>
                <option value="This Month">This Month</option>
                <option value="Last Month to Date">This Month to Date</option>
                <option value="This Fiscal Quarter">This Fiscal Quarter</option>
                <option value="This Fiscal Quarter to Date">This Fiscal Quarter to Date</option>
                <option value="This Fiscal Year">This Fiscal Year</option>
                <option value="This Fiscal Year to Last Month">This Fiscal Year to Last Month</option>
                <option value="This Fiscal Year to Date">This Fiscal Year to Date</option>
                <option value="Yesterday">Yesterday</option>
                <option value="Last Week">Last Week</option>
                <option value="Last Week to Date">Last Week to Date</option>
                <option value="Last Month">Last Month</option>
                <option value="Last Month to Date">Last Month to Date</option>
                <option value="Last Fiscal Quarter">Last Fiscal Quarter</option>
                <option value="Last Fiscal Quarter to Last Month">Last Fiscal Quarter to Last Month</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <DatePicker
                  selected={fromDate}
                  onChange={handleFromDateChange}
                  dateFormat="dd/MM/yyyy" // Changed to day/month/year format
                  placeholderText="From"
                  className="border border-gray-300 rounded-md p-2 pl-4 cursor-pointer w-full md:w-auto"
                />
                <FaCalendar className="absolute top-3 right-2 text-gray-400 pointer-events-none" />
              </div>
              <div className="relative">
                <DatePicker
                  selected={toDate}
                  onChange={handleToDateChange}
                  dateFormat="dd/MM/yyyy" // Changed to day/month/year format
                  placeholderText="To"
                  className="border border-gray-300 rounded-md p-2 pl-4 cursor-pointer w-full md:w-auto"
                />
                <FaCalendar className="absolute top-3 right-2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <input
              type="text"
              className="border border-gray-300 rounded-md p-2 w-full md:w-auto"
              placeholder="Search Product by Name"
              onChange={(e) => setSearchKeyword(e.target.value)}
              style={{ marginLeft: 'auto', marginRight: '16px' }}
            />
          </div>
        </div>

        <div className="mb-8">
          <div className="table-container overflow-x-auto overflow-y-auto" style={{ maxHeight: '300px' }} id="sales-table" ref={tableRef}>
            <div className="mb-4 text-center">
              <h2 className="text-2xl font-bold underline">Inventory Report</h2>
              <p><strong>Selected Date Period:</strong> {renderSelectedDatePeriod()}</p>
              <p>Report Printed On: {getCurrentDate()}</p>
            </div>

            <table className="w-full table-auto">
              <thead className="sticky top-0 bg-white z-10">
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
                  <th className="border">Exp.Date</th>
                  <th className="border">Products S/N</th>
                  <th className="border">Unit Cost</th>
                  <th className="border">Total Cost</th>
                  <th className="border">Unit S/Price</th>
                  <th className="border">Total S/Price</th>
                  <th className="border">Item Value</th>
                  <th className="border">
                    {state.user && state.user.role === "admin" ? <>Action</> : null}
                  </th>
                </tr>
              </thead>

              <tbody>
                {itemsToDisplay.map((item) => {
                  const totalRemaining =
                    (state.productTotals.get(item.name) || 0) -
                    (state.productTotalsMap.get(item.name) || 0);

                  return (
                    <tr
                      key={item.id}
                      onClick={() => handleRowClick(item.id)}
                      style={{ cursor: "pointer" }}
                      title="Click To View Details & Adjusted Fields"
                    >
                      <td className="border">{generateSn(itemsToDisplay.indexOf(item))}</td>
                      <td className="border">{item.name}</td>
                      <td className="border">{firstRestockDates[item.name] ? formatDate(firstRestockDates[item.name]) : 'N/A'}</td>
                      <td className="border">{item.id.slice(0, 3) + (item.id.length > 3 ? "..." : "")}</td>
                      <td className="border">{state.productTotals.get(item.name) || 0}</td>
                      <td className="border">{state.productTotals.get(item.name) || 0}</td>
                      <td className="border">{state.productTotalsMap.get(item.name) || 0}</td>
                      <td
                        className={`border ${totalRemaining === 0
                          ? "bg-red-500 text-white"
                          : totalRemaining < 5
                            ? "bg-yellow-500"
                            : ""
                          }`}
                      >
                        {totalRemaining}
                      </td>
                      <td className="border">Piece</td>
                      {totalRemaining > 0 ? (
                        <td className={`border ${getExpiryColor(item.expiryDate)}`}>
                          {item.expiryDate ? (
                            <strong>{formatDate(new Date(item.expiryDate))}</strong>
                          ) : (
                            "No Expiry Date"
                          )}
                        </td>
                      ) : (
                        <td className="border">N/A</td>
                      )}
                      <td className="border">{item.serialNumber}</td>
                      <td className="border">
                        {((item.costPrice || 0) / (state.productTotals.get(item.name) || 0)).toFixed(2)}
                      </td>
                      <td className="border">{Number(item.costPrice).toFixed(2)}</td>
                      <td className="border">{Number(item.price).toFixed(2)}</td>
                      <td className="border">
                        {((item.price || 0) * (state.productTotalsMap.get(item.name) || 0)).toFixed(2)}
                      </td>
                      <td className="border">{(item.price * totalRemaining).toFixed(2)}</td>
                      <td className="border">
                        {state.user && state.user.role === "admin" ? (
                          <>
                            <FontAwesomeIcon
                              icon={faEdit}
                              className="no-print"
                              style={{
                                cursor: "pointer",
                                marginRight: "8px",
                                color: "blue",
                              }}
                              onClick={(e) => handleEditClick(item.id, e)}
                            />
                            <FontAwesomeIcon
                              icon={faTrash}
                              className="no-print"
                              style={{ cursor: "pointer", color: "red" }}
                              onClick={(e) => handleDeleteClick(item.id, e)}
                            />
                          </>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              <tfoot>
                <tr>
                  <td className="border text-center font-bold" colSpan="4">
                    Total:
                  </td>
                  <td className="border font-bold">{totalQtyRestocked}</td>
                  <td className="border font-bold">{totalTotalBal}</td>
                  <td className="border font-bold">{totalQtySold}</td>
                  <td className="border font-bold">{totalQtyBalance}</td>
                  <td className="border"></td>
                  <td className="border"></td>
                  <td className="border"></td>
                  <td className="border font-bold">₦{totalCostPrice.toFixed(2)}</td>
                  <td className="border font-bold">₦{totalCostValue.toFixed(2)}</td>
                  <td className="border font-bold">₦{totalSalesPrice.toFixed(2)}</td>
                  <td className="border font-bold">₦{totalSalesPriceValue.toFixed(2)}</td>
                  <td className="border font-bold">
                    {state.user && state.user.role === 'admin' ? `₦${totalItemValue.toFixed(2)}` : 'XXXXXX'}
                  </td>
                  <td className="border"></td>
                </tr>
              </tfoot>
            </table>
            {renderFooter()}
            <div className="flex justify-between mb-4">{renderPaginationButtons()}</div>
          </div>
        </div>

        {showEditPop && selectedProduct && (
          <EditPopup
            product={selectedProduct}
            onClose={() => setShowEditPop(false)}
            onUpdate={(updatedProduct) => {
              // Update logic here, e.g., call a function to update the product
              setShowEditPop(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

const renderStatCard = (title, value, color) => (
  <div className={`bg-${color}-500 text-white p-4 rounded-md inline-block m-2`}>
    <div className="text-sm">{title}</div>
    <div className="text-2xl font-bold">{value}</div>
  </div>
);

export default InventoryPage;