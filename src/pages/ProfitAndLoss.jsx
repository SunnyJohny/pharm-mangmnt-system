

import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';

// import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendar } from 'react-icons/fa';
import { useMyContext } from '../Context/MyContext';

// import html2canvas from 'html2canvas';

import ReceiptModal from '../components/ReceiptModal';

const ProfitAndLoss  = () => {
  const { state, searchByKeyword, searchByDate,calculateTotalPaidAmount } = useMyContext();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(100);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  
  const [totalSalesValue, setTotalSalesValue] = useState(0); // Added state for total sales
  
  const tableRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [filteredSales, setFilteredSales] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const totalItems = filteredSales.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  // const itemsToDisplay = filteredSales.slice(startIndex, endIndex);
  const [selectedDateOption, setSelectedDateOption] = useState('All');
  // const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [totalExpenseAmount, setTotalExpenseAmount] = useState(0);
  const [allPagesContent, setAllPagesContent] = useState([]);
  const [totalStoreValue, setTotalStoreValue] = useState(0);

  if (filteredExpenses || endIndex || allPagesContent || totalStoreValue) {
    console.log("Variables are present and have been logged:",setAllPagesContent, filteredExpenses, endIndex, allPagesContent, setTotalStoreValue);
  } else {
    console.log("Variables are not present or are falsy.");
  }
  

const totalTaxPaidAmount = calculateTotalPaidAmount();





  useEffect(() => {
    if (fromDate && toDate) {
      const filteredByDate = searchByDate(state.expenses, fromDate, toDate);
      const totalAmount = filteredByDate.reduce((accumulator, expense) => {
        return accumulator + parseFloat(expense.amount);
      }, 0);
      setTotalExpenseAmount(totalAmount);
      setFilteredExpenses(filteredByDate);
    }
  }, [state.expenses, searchByDate, fromDate, toDate]);

  useEffect(() => {
    const filteredByDate = searchByDate(state.sales, fromDate, toDate);
    setFilteredSales(filteredByDate);
  }, [state.sales, searchByDate, fromDate, toDate]);

  useEffect(() => {
    const filteredByKeyword = searchByKeyword(state.sales, searchKeyword);
    setFilteredSales(filteredByKeyword);
  }, [state.sales, searchByKeyword, searchKeyword]);

  useEffect(() => {
    calculateTotalSalesValue(filteredSales);
  }, [filteredSales]);

  const calculateTotalSalesValue = (sales) => {
    if (!sales || sales.length === 0) {
      // setTotalSalesValue(0);
      console.log('filteredsales empty')
      return;
    }

    const calculatedTotalSalesValue = sales.reduce((total, sale) => {
      if (sale.products && Array.isArray(sale.products)) {
        return total + sale.products.reduce((acc, product) => acc + parseFloat(product.Amount|| 0), 0);
      } else {
        console.log('Undefined products array in sale:', sale);
        return total;
      }
    }, 0);
    setTotalSalesValue(calculatedTotalSalesValue.toFixed(2));
  };
  const handleFromDateChange = (date) => {
    setFromDate(date);
    const filteredByDate = searchByDate(state.sales, date, fromDate);
    console.log('Filtered by date:', filteredByDate);
    setFilteredSales(filteredByDate);
    calculateTotalSalesValue(filteredByDate);
  };

  const handleToDateChange = (date) => {
    setToDate(date);
    const filteredByDate = searchByDate(state.sales, toDate, date);
    console.log('Filtered by date:', filteredByDate);
    setFilteredSales(filteredByDate);
    calculateTotalSalesValue(filteredByDate);
  };

//   useEffect(() => {
//     console.log('Filtered sales:', filteredSales);
//   }, [filteredSales]);

//   useEffect(() => {
//     console.log('Total sales value:', totalSalesValue);
//   }, [totalSalesValue]);
  // useEffect(() => {
  //   // Fetch and calculate summary data
  //   fetchSummaryData();
  // }, []);



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



  const calculateTotalCOGS = () => {
    if (!filteredSales || filteredSales.length === 0) {
      return 0;
    }
  
    const totalCOGS = filteredSales.reduce((total, sale) => {
      return total + sale.products.reduce((acc, product) => {
        const costPrice = parseFloat(product.costPrice);
        return isNaN(costPrice) ? acc : acc + costPrice;
      }, 0);
    }, 0);
  
    return totalCOGS.toFixed(2);
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

  const profitAndLossData = {
    revenue: totalSalesValue,
    costOfGoodsSold: `${calculateTotalCOGS()}`,
    grossProfit: totalSalesValue-`${calculateTotalCOGS()}`,
    operatingExpenses: totalExpenseAmount,
    taxes: totalTaxPaidAmount,
    netIncome: totalSalesValue-`${calculateTotalCOGS()}`-totalExpenseAmount, // Adjusted net income after taxes
  };

  return (
    <div className="container mx-auto flex h-screen">
    


      <div className="ml-8 flex-1">
        

        {showModal && selectedSale && (
          <ReceiptModal saleInfo={selectedSale} onClose={handleCloseModal} />
        )}

        <div className="mb-8">
          <h2 className="text-2xl text-center font-bold mb-4">Profit & Loss Statement</h2>
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
              <h2 className="text-2xl font-bold underline">Income Statement</h2>

              <p><strong>Selected Date Period:</strong> {renderSelectedDatePeriod()}</p>
              <p>Report Printed On: {getCurrentDate()}</p>
            </div>

            <h2 className="text-2xl font-semibold mb-4"></h2>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-semibold leading-6 text-gray-900">Financial Summary</h3>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Revenue</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">₦{profitAndLossData.revenue}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Cost of Goods Sold</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">₦{profitAndLossData.costOfGoodsSold}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Gross Profit</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">₦{profitAndLossData.grossProfit}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Operating Expenses</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">₦{profitAndLossData.operatingExpenses}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Taxes</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">₦{profitAndLossData.taxes}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Net Income</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">₦{profitAndLossData.netIncome}</dd>
            </div>
          </dl>
        </div>
      </div>
          </div>

          <div className="flex justify-between mt-4">
            {renderPaginationButtons()}
          </div>
        </div>
      </div>
    </div>
  );
};


export default ProfitAndLoss ;
