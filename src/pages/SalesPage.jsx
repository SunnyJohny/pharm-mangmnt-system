

import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';

// import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendar } from 'react-icons/fa';
import { useMyContext } from '../Context/MyContext';
import { faChartLine, faShoppingCart, faCalendarAlt, faBox } from '@fortawesome/free-solid-svg-icons';


import SalesPageSidePanel from '../components/SalesPageSidePanel';
import ReceiptModal from '../components/ReceiptModal';
import ProductsPageSidePanel from '../components/ProductsPagesidePanel';



const SalesPage = () => {
  const { state, searchByKeyword, searchByDate, calculateTotalSalesValue, calculateTotalCOGS } = useMyContext();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(100);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  // const [filteredItems, setFilteredItems] = useState([]);
  // const [totalStoreValue, setTotalStoreValue] = useState(0);

  const [totalSalesValue, setTotalSalesValue] = useState(0); // Added state for total sales

  const [totalCOGS, setTotalCOGS] = useState(0); 
  const tableRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [filteredSales, setFilteredSales] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  // const [summaryData, setSummaryData] = useState(null); // State to hold summary data

  const totalItems = filteredSales.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const itemsToDisplay = filteredSales.slice(startIndex, endIndex);
  const [selectedDateOption, setSelectedDateOption] = useState('All');


  // const calculateTotalStoreValue = (items) => {
  //   const calculatedTotalStoreValue = items.reduce(
  //     (total, item) =>
  //       total +
  //       item.price * ((state.productTotals.get(item.name) || 0) - (state.productTotalsMap.get(item.name) || 0)),
  //     0
  //   );
  //   setTotalStoreValue(calculatedTotalStoreValue.toFixed(2));
  // };






  // Combine date and keyword filters
  useEffect(() => {
    let filtered = state.sales;

    // Apply date filter if both fromDate and toDate are selected
    if (fromDate && toDate) {
      filtered = searchByDate(filtered, fromDate, toDate);
    }

    // Apply keyword filter
    if (searchKeyword) {
      filtered = searchByKeyword(filtered, searchKeyword);
    }

    setFilteredSales(filtered);
    calculateTotalSalesValue(filtered);
  }, [state.sales, fromDate, toDate, searchKeyword, searchByDate, searchByKeyword]);


  useEffect(() => {
    calculateTotalSalesValue(filteredSales);
  }, [filteredSales]);

  // const calculateTotalSalesValue = (sales) => {
  //   if (!sales || sales.length === 0) {
  //     // setTotalSalesValue(0);

  //     return;
  //   }

  //   const calculatedTotalSalesValue = sales.reduce((total, sale) => {
  //     if (sale.products && Array.isArray(sale.products)) {
  //       return total + sale.products.reduce((acc, product) => acc + parseFloat(product.Amount || 0), 0);
  //     } else {
  //       console.log('Undefined products array in sale:', sale);
  //       return total;
  //     }
  //   }, 0);
  //   setTotalSalesValue(calculatedTotalSalesValue.toFixed(2));
  // };

  useEffect(() => {
    setTotalSalesValue(calculateTotalSalesValue(filteredSales));
    setTotalCOGS(calculateTotalCOGS(filteredSales)); // Ensure this is called with the correct sales array
  }, [filteredSales]);
  


  const handleFromDateChange = (date) => {
    setFromDate(date);
    if (toDate) {
      const filteredByDate = searchByDate(state.sales, date, toDate);
      setFilteredSales(filteredByDate);
      calculateTotalSalesValue(filteredByDate);
    }
  };

  const handleToDateChange = (date) => {
    setToDate(date);
    if (fromDate) {
      const filteredByDate = searchByDate(state.sales, fromDate, date);
      setFilteredSales(filteredByDate);
      calculateTotalSalesValue(filteredByDate);
    }
  };


  // useEffect(() => {
  //   console.log('Filtered sales:', filteredSales);
  // }, [filteredSales]);

  // useEffect(() => {
  //   console.log('Total sales value:', totalSalesValue);
  // }, [totalSalesValue]);
  // useEffect(() => {
  //   // Fetch and calculate summary data
  //   fetchSummaryData();
  // }, []);

  useEffect(() => {
    let filtered = state.sales;

    // Apply date filter if both fromDate and toDate are selected
    if (fromDate && toDate) {
      filtered = searchByDate(filtered, fromDate, toDate);
    }

    // Apply keyword filter
    if (searchKeyword) {
      filtered = searchByKeyword(filtered, searchKeyword);
    }

    setFilteredSales(filtered);
    calculateTotalSalesValue(filtered);
  }, [state.sales, fromDate, toDate, searchKeyword, searchByDate, searchByKeyword]);




  const generateSn = (index) => index + 1;

  // const handleRowClick = (itemId) => {
  //   navigate(`/product-details/${itemId}`);
  // };

  const renderActionButtons = () => {
    // Function to handle printing of the table
    const saveAndPrintTable = () => {
      const table = document.getElementById('sales-table');
      const printWindow = window.open('', '_blank');
      printWindow.document.write('<html><head><title>Sales Table</title>');
      // Add custom CSS for printing
      printWindow.document.write('<style>');
      printWindow.document.write('@media print {');
      printWindow.document.write('.text-center { text-align: center; }');
      printWindow.document.write('.mb-4 { margin-bottom: 4px; }');
      printWindow.document.write('.table-print { border-collapse: collapse; }');
      printWindow.document.write('.table-print th, .table-print td { border: 2px solid black; padding: 8px; }');
      printWindow.document.write('}');
      printWindow.document.write('</style>');
      printWindow.document.write('</head><body>');
      // printWindow.document.write('<div class="text-center mb-4">');
      // printWindow.document.write('<h2 class="text-2xl font-bold underline">Sales Report</h2>');
      // printWindow.document.write(`<p><strong>Selected Date Period:</strong> ${renderSelectedDatePeriod()}</p>`);
      // printWindow.document.write(`<p>Report Printed On: ${getCurrentDate()}</p>`);
      // printWindow.document.write('</div>');
      printWindow.document.write(table.outerHTML);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.print();
      printWindow.close();
    };
    return (
      <button className="bg-blue-500 text-white px-4 py-2 rounded-md" onClick={saveAndPrintTable}>
        Print Sales
      </button>
    );
  };



  // useEffect(() => {
  //   const initialItems = state.sales || [];
  //   setFilteredSales(initialItems);
  //   const capturePagesContent = async () => {
  //     const pagesContent = [];
  //     const tableContainer = document.querySelector('.table-container');
  //     const itemsPerPage = 20;

  //     if (tableContainer) {
  //       const totalItems = filteredSales.length;
  //       const totalPages = Math.ceil(totalItems / itemsPerPage);

  //       const calculateTotalStoreValue = (items) => {
  //         const calculatedTotalStoreValue = items.reduce(
  //           (total, item) =>
  //             total +
  //             item.price * ((state.productTotals.get(item.name) || 0) - (state.productTotalsMap.get(item.name) || 0)),
  //           0
  //         );
  //         setTotalStoreValue(calculatedTotalStoreValue.toFixed(2));
  //       };

  //       for (let page = 1; page <= totalPages; page++) {
  //         const startIndex = (page - 1) * itemsPerPage;
  //         const endIndex = startIndex + itemsPerPage;
  //         const itemsToDisplay = filteredSales.slice(startIndex, endIndex);

  //         setFilteredSales(itemsToDisplay);
  //         calculateTotalStoreValue(itemsToDisplay);

  //         await new Promise((resolve) => setTimeout(resolve, 500));

  //         const canvas = await html2canvas(tableContainer);
  //         pagesContent.push(canvas.toDataURL('image/png'));
  //       }

  //       setAllPagesContent(pagesContent);
  //       setFilteredSales(initialItems);
  //       calculateTotalStoreValue(initialItems);
  //     }
  //   };

  //   capturePagesContent();
  // }, [state.products, state.productTotals, state.productTotalsMap, filteredSales, state.sales]);


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




  // Calculate total sales value on mount and when sales change
  useEffect(() => {
    calculateTotalSalesValue();
  }, [filteredSales]);



  // const calculateTotalCOGS = () => {
  //   if (!filteredSales || filteredSales.length === 0) {
  //     return 0;
  //   }

  //   const totalCOGS = filteredSales.reduce((total, sale) => {
  //     return total + sale.products.reduce((acc, product) => {
  //       const costPrice = parseFloat(product.costPrice);
  //       return isNaN(costPrice) ? acc : acc + costPrice;
  //     }, 0);
  //   }, 0);

  //   return totalCOGS.toFixed(2);
  // };


  const calculateTodaySales = () => {
    const today = new Date().toLocaleDateString();

    return state.sales
      .filter((sale) => new Date(sale.date).toLocaleDateString() === today)
      .reduce((total, sale) => total + sale.products.reduce((acc, product) => acc + parseFloat(product.Amount), 0), 0);
  };

  const calculateTotalProductsSold = (sales) => {
    const productNames = sales.flatMap(sale => sale.products.map(product => product.name));
    const uniqueProductNames = [...new Set(productNames)];
    return uniqueProductNames.length;
  };

  const handleRowClick = (sale) => {
    console.log('Clicked on row with ID:', sale.id); // Log the ID to the console
    setShowModal(true);
    setSelectedSale(sale);
    console.log("selected sale", selectedSale);
  };


  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedSale(null);
  };

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
      // Add more cases as needed
      default:
        break;
    }

    setFromDate(new Date(startDate)); // Use new Date object to avoid reference issues
    setToDate(new Date(endDate));
  };
  // Calculate total sales for each salesperson
  const salesBySalesperson = filteredSales.reduce((acc, sale) => {
    const { name } = sale.staff;
    const totalSale = sale.products.reduce((total, product) => total + parseFloat(product.Amount), 0);
    acc[name] = (acc[name] || 0) + totalSale;
    return acc;
  }, {});
  // Calculate total sales for each payment method
  const paymentMethods = filteredSales.reduce((acc, sale) => {
    const { method } = sale.payment;
    acc[method] = (acc[method] || 0) + sale.products.reduce((total, product) => total + parseFloat(product.Amount), 0);
    return acc;
  }, {});
  // Function to format date as MM-DD-YYYY
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' });
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

  return (
    <div className="container mx-auto flex h-screen">

      <div className="flex-none">
        {/* Render InventorySidePanel if user exists and role is admin, otherwise render ProductsPagesidePanel */}
        {state.user && state.user.role === 'admin' ? <SalesPageSidePanel />
          : <ProductsPageSidePanel />}
      </div>


      <div className="ml-8 flex-1">
        <div className="mb-8 p-2">

          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold">Sales Stats</h2>
            <button className="text-blue-500 cursor-pointer pr-24" onClick={() => window.history.back()}>
              Back
            </button>
          </div>
          <div className="flex mt-2 space-x-4">
            {renderStatCard('Total Revenue', `₦${totalSalesValue}`, 'blue', faChartLine)}
            {renderStatCard('Total Sales', `₦${totalSalesValue}`, 'pink', faShoppingCart)}
            {renderStatCard(
              'Today Sales',
              `₦${calculateTodaySales().toFixed(2)}`,
              'red',
              faCalendarAlt
            )}
            {renderStatCard('Cost Of Goods Sold', `₦${totalCOGS}`, 'blue', faBox)}

          </div>
        </div>

        {showModal && selectedSale && (
          <ReceiptModal saleInfo={selectedSale} onClose={handleCloseModal} />
        )}
        <div className="mb-4">

          <p><strong>Transactions by:</strong></p>
          <div className="flex items-center space-x-4">
            <div>
              {/* Dates label and dropdown */}
              <label
                htmlFor="dateOption"
                className="text-lg"
                style={{ marginRight: '16px' }} // Add margin-right of 16px (adjust as needed)
              >
                Dates
              </label>
              <select
                id="dateOption"
                value={selectedDateOption}
                onChange={handleDateOptionChange}
                className="border border-gray-300 rounded-md p-2 pl-4"
                style={{ width: '150px' }} // Set the width to 150px (adjust as needed)
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
                  dateFormat="MM-dd-yyyy"
                  placeholderText="From"
                  className="border border-gray-300 rounded-md p-2 pl-2 cursor-pointer"
                />
                <FaCalendar className="absolute top-3 right-2  text-gray-400 pointer-events-none" />
              </div>
              <div className="relative">
                <DatePicker
                  selected={toDate}
                  onChange={handleToDateChange}
                  dateFormat="MM-dd-yyyy"
                  placeholderText="To"
                  className="border border-gray-300 rounded-md p-2 pl-2 cursor-pointer"
                />
                <FaCalendar className="absolute top-3 right-2  text-gray-400 pointer-events-none" />
              </div>
            </div>
            {/* Search input */}
            <input
              type="text"
              className="border border-gray-300 rounded-md p-2"
              placeholder="Search"
              // Assuming you have a function setSearchKeyword to handle search
              onChange={(e) => setSearchKeyword(e.target.value)}
              style={{ marginLeft: 'auto', marginRight: '16px' }}
            />
          </div>
        </div>

        <div className="mb-8">


          <div className="table-container overflow-x-auto overflow-y-auto" style={{ maxHeight: '300px' }} id="sales-table" ref={tableRef}>
            {/* Header section */}
            <div className="mb-4 text-center">
              <h2 className="text-2xl font-bold underline">Sales Report</h2>

              <p><strong>Selected Date Period:</strong> {renderSelectedDatePeriod()}</p>
              <p>Report Printed On: {getCurrentDate()}</p>
            </div>

            <table className="w-full table-auto" >
              <thead>
                <tr>
                  <th className="border">S/n</th>
                  <th className="border">Prod. Names</th>
                  <th className="border">Trans. Date</th>
                  <th className="border">Trans. ID</th>
                  <th className="border">Receipt No</th>
                  <th className="border">Cust. Name</th>
                  <th className="border">Payment Method</th>
                  <th className="border">COGS</th>

                  <th className="border">Total Sale</th>
                  <th className="border">Attendant Name</th>
                  <th className="border">Payment Status</th>
                </tr>
              </thead>

              <tbody>
                {itemsToDisplay
                  .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by date in descending order
                  .map((sale, index) => (
                    <tr onClick={() => handleRowClick(sale)} title="Click To View Invoice" style={{ cursor: 'pointer' }} key={index}>
                      <td className="border">{generateSn(index)}</td>
                      <td className="border">
                        {sale.products.map((product, productIndex) => (
                          <div key={productIndex}>
                            {product.name}
                            {productIndex === sale.products.length - 1 ? '.' : ','} {/* Display full stop if it's the last product, otherwise display comma */}
                            {productIndex < sale.products.length - 1 && <br />} {/* Add line break if it's not the last product */}
                          </div>
                        ))}
                      </td>

                      <td className="border">{sale.date}</td>
                      <td className="border">{sale.id.substring(0, 5)}{sale.id.length > 5 ? '...' : ''}</td>
                      <td className="border">{sale.saleId}</td>
                      <td className="border">{sale.customer.name}</td>
                      <td className="border">{sale.payment.method}</td>
                      {/* COGS */}
                      <td className="border">
                        {sale.products.map((product, productIndex) => (
                          <div key={productIndex}>{product.costPrice}</div>
                        ))}
                      </td>
                      {/* Total Sale */}
                      <td className="border">
                        {sale.products.map((product, productIndex) => (
                          <div key={productIndex}>{product.Amount}</div>
                        ))}
                      </td>
                      <td className="border">{sale.staff.name}</td>
                      <td className="border">{sale.payment.method}</td>
                    </tr>
                  ))}
                {/* Additional row for totals */}
                <tr>
                  <td className="border"><strong>Total</strong></td> {/* Empty cell for S/N */}
                  <td className="border"></td> {/* Empty cell for Product Names */}
                  <td className="border"></td> {/* Empty cell for Transaction Date */}
                  <td className="border"></td> {/* Empty cell for Transaction ID */}
                  <td className="border"></td> {/* Empty cell for Receipt No */}
                  <td className="border"></td> {/* Empty cell for Customer Name */}
                  <td className="border"></td> {/* Empty cell for Payment Method */}
                  <td className="border"><strong>₦{totalCOGS}</strong></td> {/* Total COGS */}
                  <td className="border"><strong>₦{totalSalesValue}</strong></td> {/* Total Sales */}
                  <td className="border"></td> {/* Empty cell for Attendant Name */}
                  <td className="border"></td> {/* Empty cell for Payment Status */}
                </tr>
              </tbody>

              <tfoot>
                <tr>
                  <td colSpan="11" style={{ textAlign: 'center' }}>
                    <strong><u className="underline">Sales Summary</u></strong>
                  </td>


                </tr>
                <tr>
                  <td colSpan="9">
                    <strong>Payment Method:</strong>
                    <ul>
                      {Object.entries(paymentMethods).map(([method, totalAmount], index) => {

                        const amount = Number(totalAmount);
                        return (
                          <li key={index}>
                            {method}: ₦{isNaN(amount) ? "0.00" : amount.toFixed(2)}
                          </li>
                        );
                      })}
                    </ul>
                  </td>
                  <td colSpan="2">
                    <strong>Salespersons:</strong>
                    <ul>
                      {Object.entries(salesBySalesperson).map(([salesperson, totalSales], index) => {

                        const sales = Number(totalSales);
                        return (
                          <li key={index}>
                            {salesperson}: ₦{isNaN(sales) ? "0.00" : sales.toFixed(2)}
                          </li>
                        );
                      })}
                    </ul>
                  </td>
                </tr>



                <tr>
                  <td colSpan="3"><strong>Total Sales Transactions:</strong> {filteredSales.length}</td>
                  <td colSpan="3"><strong>Total Quantity Sold:</strong> {calculateTotalProductsSold(filteredSales)}</td>
                  <td colSpan="3" className="whitespace-no-wrap">
                    <strong>Total Sales Amount: <u className="underline">₦{totalSalesValue}</u></strong>
                  </td>
                </tr>

              </tfoot>

            </table>

            <div className="flex justify-between mb-24">
              {renderPaginationButtons()}
            </div>
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
export default SalesPage;

















