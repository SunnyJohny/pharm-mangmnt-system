import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendar } from 'react-icons/fa';
import { useMyContext } from '../Context/MyContext';
import { faChartLine, faShoppingCart, faCalendarAlt, faBox } from '@fortawesome/free-solid-svg-icons';
// import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import SalesPageSidePanel from '../components/SalesPageSidePanel';
import ExpenseInvoiceModal from '../components/ExpenseInvoiceModal';




const ExpensePage = () => {
  const { state, searchByKeyword, searchByDate } = useMyContext();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(100);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  // const [filteredItems, setFilteredItems] = useState([]);
  // const [totalStoreValue, setTotalStoreValue] = useState(0);
  const [allPagesContent, setAllPagesContent] = useState([]);
  // const [totalSalesValue, setTotalSalesValue] = useState(0); // Added state for total sales
  // const navigate = useNavigate();
  const tableRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  // const [summaryData, setSummaryData] = useState(null); // State to hold summary data

  const totalItems = filteredExpenses.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const itemsToDisplay = filteredExpenses.slice(startIndex, endIndex);
  const [selectedDateOption, setSelectedDateOption] = useState('All');

  if (allPagesContent) {
    console.log("")
  }

  useEffect(() => {
    const filteredByDate = searchByDate(state.expenses, fromDate, toDate);
    setFilteredExpenses(filteredByDate);
  }, [state.expenses, searchByDate, fromDate, toDate]);

  useEffect(() => {
    const filteredByKeyword = searchByKeyword(state.expenses, searchKeyword);
    setFilteredExpenses(filteredByKeyword);
  }, [state.expenses, searchByKeyword, searchKeyword]);

  useEffect(() => {
    const calculateTotalStoreValue = (items) => {
      const calculatedTotalStoreValue = items.reduce(
        (total, item) =>
          total +
          item.price * ((state.productTotals.get(item.name) || 0) - (state.productTotalsMap.get(item.name) || 0)),
        0
      );
      // setTotalStoreValue(calculatedTotalStoreValue.toFixed(2));
      console.log(calculatedTotalStoreValue);
    };
  
    const initialItems = state.expenses || [];
    setFilteredExpenses(initialItems);
    const capturePagesContent = async () => {
      const pagesContent = [];
      const tableContainer = document.querySelector('.table-container');
      const itemsPerPage = 20;
  
      if (tableContainer) {
        const totalItems = initialItems.length; // Using initialItems instead of filteredExpenses
        const totalPages = Math.ceil(totalItems / itemsPerPage);
  
        for (let page = 1; page <= totalPages; page++) {
          const startIndex = (page - 1) * itemsPerPage;
          const endIndex = startIndex + itemsPerPage;
          const itemsToDisplay = initialItems.slice(startIndex, endIndex); // Using initialItems instead of filteredExpenses
  
          calculateTotalStoreValue(itemsToDisplay); // Moved the function call here
  
          await new Promise((resolve) => setTimeout(resolve, 500));
  
          const canvas = await html2canvas(tableContainer);
          pagesContent.push(canvas.toDataURL('image/png'));
        }
  
        setAllPagesContent(pagesContent);
      }
    };
  
    capturePagesContent();
  }, [state.expenses, state.products, state.productTotals, state.productTotalsMap, filteredExpenses]);
  


   // Function to handle clicking on an expense row to open the modal
   const handleExpenseClick = (expense) => {
    console.log('Clicked on row with ID:', expense.id,expense.receiptFile); // Log the ID to the console
    setShowModal(true);
    setSelectedExpense(expense);
  };
  

    // Function to close the modal
    const handleCloseModal = () => {
      setShowModal(false);
      setSelectedExpense(null);
    };


  const handleFromDateChange = (date) => {
    setFromDate(date);
    const filteredByDate = searchByDate(state.expenses, date, fromDate);
    console.log('Filtered by date:', filteredByDate);
    setFilteredExpenses(filteredByDate);
    // calculateTotalSalesValue(filteredByDate);
  };

  const handleToDateChange = (date) => {
    setToDate(date);
    const filteredByDate = searchByDate(state.expenses, toDate, date);
    console.log('Filtered by date:', filteredByDate);
    setFilteredExpenses(filteredByDate);
    // calculateTotalSalesValue(filteredByDate);
  };

  useEffect(() => {
    console.log('Filtered expenses:', filteredExpenses);
  }, [filteredExpenses]);

  // useEffect(() => {
  //   console.log('Total Expenses value:', totalExpensesValue);
  // }, [totalExpensesValue]);
  // useEffect(() => {
  //   // Fetch and calculate summary data
  //   fetchSummaryData();
  // }, []);
  



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


  useEffect(() => {
    const initialItems = state.expenses || [];
    setFilteredExpenses(initialItems);
    const capturePagesContent = async () => {
      const pagesContent = [];
      const tableContainer = document.querySelector('.table-container');
      const itemsPerPage = 20;
  
      if (tableContainer) {
        const totalItems = initialItems.length; // Using initialItems instead of filteredExpenses
        const totalPages = Math.ceil(totalItems / itemsPerPage);
  
        for (let page = 1; page <= totalPages; page++) {
          const startIndex = (page - 1) * itemsPerPage;
          const endIndex = startIndex + itemsPerPage;
          const itemsToDisplay = initialItems.slice(startIndex, endIndex); // Using initialItems instead of filteredExpenses
  
          calculateTotalStoreValue(itemsToDisplay); // Moved the function call here
  
          await new Promise((resolve) => setTimeout(resolve, 500));
  
          const canvas = await html2canvas(tableContainer);
          pagesContent.push(canvas.toDataURL('image/png'));
        }
  
        setAllPagesContent(pagesContent);
      }
    };
  
    capturePagesContent();
  }, [state.expenses, state.products, state.productTotals, state.productTotalsMap, calculateTotalStoreValue,filteredExpenses]);

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
    <div className="container mx-auto flex">
      <div className="flex-none">
        <SalesPageSidePanel />
      </div>

      <div className="ml-8 flex-1">
        <div className="mb-8 p-2">
          <h2 className="text-2xl font-bold">Expense Stats</h2>
          <div className="flex mt-4 space-x-4">
            {renderStatCard('Total Revenue', `₦${'400'}`, 'blue', faChartLine)}
            {renderStatCard('Total Sales', `₦${'600'}`, 'pink', faShoppingCart)}
            {renderStatCard(
              'Today Sales',
              `₦${'400'}`,
              'red',
              faCalendarAlt
            )}
            {renderStatCard('Cost Of Goods Sold', `₦${'700'}`, 'blue', faBox)}

          </div>
        </div>

        

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Transactions</h2>
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
              <div className="text-lg">Sales by Date</div>
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
          <div className="flex items-center justify-between mb-4">
            <button className="text-blue-500 cursor-pointer" onClick={() => window.history.back()}>
              Back
            </button>
          </div>

          <div className="table-container overflow-x-auto overflow-y-auto" style={{ maxHeight: '300px' }} id="sales-table" ref={tableRef}>
            {/* Header section */}
            <div className="mb-4 text-center">
              <h2 className="text-2xl font-bold underline">Expense Report</h2>

              <p><strong>Selected Date Period:</strong> {renderSelectedDatePeriod()}</p>
              <p>Report Printed On: {getCurrentDate()}</p>
            </div>

            <table className="w-full table-auto">
  <thead>
    <tr>
      <th className="border">S/n</th>
      <th className="border">Expense Description</th>
      <th className="border">Expense Date</th>
      <th className="border">Transaction ID</th>
      <th className="border">Receipt No</th>
      <th className="border">Vendor Name</th>
      <th className="border">Payment Method</th>
      <th className="border">Amount</th>
      <th className="border">Attendant Name</th>
      <th className="border">Payment Status</th>
    </tr>
  </thead>

  <tbody>
    {itemsToDisplay
      .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by date in descending order
      .map((expense, index) => (
         <tr key={index} onClick={() => handleExpenseClick(expense)} style={{ cursor: 'pointer' }}>
          <td className="border">{generateSn(index)}</td>
          <td className="border">{expense.description}</td>
          <td className="border">{expense.date}</td>



          <td className="border">{expense.id.substring(0, 5)}{expense.id.length > 5 ? '...' : ''}</td>
          <td className="border">{expense.receiptNo}</td>
          <td className="border">{expense.vendorName}</td>
          <td className="border">{expense.paymentMethod}</td>
          <td className="border">{expense.amount}</td>
          <td className="border">{expense.attendantName}</td>
          <td className="border">{expense.paymentStatus}</td>
        </tr>
      ))}
    {/* Additional row for totals */}
    <tr>
      <td className="border"><strong>Total</strong></td> {/* Empty cell for S/N */}
      <td colSpan="6" className="border"></td> {/* Empty cell for the rest of the columns */}
      <td className="border"><strong>₦{'600'}</strong></td> {/* Total Expenses */}
      <td className="border"><strong>₦{'300'}</strong></td> {/* Total Amount */}
      <td colSpan="2" className="border"></td> {/* Empty cell for the rest of the columns */}
    </tr>
  </tbody>
</table>


          </div>

          <div className="flex justify-between mt-4">
            {renderPaginationButtons()}
          </div>
        </div>
        
      {/* Render the modal */}
      {showModal && selectedExpense && (
          <ExpenseInvoiceModal expenseInfo={selectedExpense} onClose={handleCloseModal} />
        )}
      {/* {selectedExpense && <ExpenseInvoiceModal expenseInfo={selectedExpense} onClose={handleCloseModal} />} */}
      </div>
    </div>
  );
};

const renderStatCard = (title, value, color, icon) => (
  <div className={`flex-1 bg-${color}-500 text-white p-4 rounded-md flex flex-col items-center`}>
    <div className="text-lg font-bold mb-2">{title}</div>
    <div className="text-2xl font-bold flex items-center">
      {icon && <FontAwesomeIcon icon={icon} className="mr-2" />}
      {value}
    </div>
  </div>
);
export default ExpensePage;