import React, { useState, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendar } from 'react-icons/fa';
import { useMyContext } from '../Context/MyContext';
import { faChartLine, faShoppingCart, faCalendarAlt, faBox } from '@fortawesome/free-solid-svg-icons';

import SalesPageSidePanel from '../components/SalesPageSidePanel';
import ReceiptModal from '../components/ReceiptModal';
import ProductsPageSidePanel from '../components/ProductsPagesidePanel';

// Utility function to parse and format dates
export const parseAndFormatDate = (dateStr) => {
  if (!dateStr) return 'Invalid date';

  // If the dateStr is already a Date object, format it
  if (dateStr instanceof Date) {
    return dateStr.toLocaleDateString('en-GB');
  }

  // Check if the dateStr is already in day/month/year format
  const dateParts = dateStr.split('/');
  if (dateParts.length === 3 && dateParts[0].length === 2 && dateParts[1].length === 2 && dateParts[2].length === 4) {
    // It's already in day/month/year format
    return dateStr;
  }

  // Try to parse the date as a different format
  const parsedDate = new Date(dateStr);
  if (isNaN(parsedDate)) {
    return 'Invalid date';
  }

  return parsedDate.toLocaleDateString('en-GB');
};

const SalesPage = () => {
  const { state, searchByKeyword, searchByDate, calculateTotalSalesValue, calculateTotalCOGS } = useMyContext();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [totalSalesValue, setTotalSalesValue] = useState(0);
  const [totalCOGS, setTotalCOGS] = useState(0);
  const tableRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [filteredSales, setFilteredSales] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedDateOption, setSelectedDateOption] = useState('All');

  const totalItems = filteredSales.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const itemsToDisplay = filteredSales.slice(startIndex, endIndex);

  useEffect(() => {
    let filtered = state.sales;

    if (fromDate && toDate) {
      filtered = searchByDate(filtered, fromDate, toDate);
    }

    if (searchKeyword) {
      filtered = searchByKeyword(filtered, searchKeyword);
    }

    setFilteredSales(filtered);
    calculateTotalSalesValue(filtered);
  }, [state.sales, fromDate, toDate, calculateTotalSalesValue, searchKeyword, searchByDate, searchByKeyword]);

  useEffect(() => {
    calculateTotalSalesValue(filteredSales);
  }, [filteredSales, calculateTotalSalesValue]);

  useEffect(() => {
    setTotalSalesValue(calculateTotalSalesValue(filteredSales));
    setTotalCOGS(calculateTotalCOGS(filteredSales));
  }, [filteredSales, calculateTotalCOGS, calculateTotalSalesValue]);

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

  const handleReload = () => {
    window.location.reload();
  };

  const generateSn = (index) => index + 1;

  const renderActionButtons = () => {
    const saveAndPrintTable = () => {
      const table = document.getElementById('sales-table');
      const printWindow = window.open('', '_blank');
      printWindow.document.write('<html><head><title>Sales Table</title>');
      printWindow.document.write('<style>@media print {body { -webkit-print-color-adjust: exact; }.text-center { text-align: center; }.mb-4 { margin-bottom: 4px; }.table-print { border-collapse: collapse; }.table-print th, .table-print td { border: 2px solid black; padding: 8px; }}</style>');
      printWindow.document.write('</head><body>');
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
      <div className="flex justify-between items-center w-full max-w-lg mx-auto mt-4">
        <button
          className={`px-3 py-1.5 rounded-md ${currentPage === 1 ? 'bg-gray-300 text-gray-700' : 'bg-blue-500 text-white'}`}
          onClick={handlePreviousPage}
        >
          Previous
        </button>
        {renderActionButtons()}
        <button
          className={`px-3 py-1.5 rounded-md ${currentPage === totalPages ? 'bg-gray-300 text-gray-700' : 'bg-blue-500 text-white'}`}
          onClick={handleNextPage}
        >
          Next
        </button>
      </div>
    );
  };

  const calculateTodaySales = () => {
    const today = new Date().toLocaleDateString('en-GB'); // Changed to en-GB for day/month/year format

    return state.sales
      .filter((sale) => new Date(sale.date).toLocaleDateString('en-GB') === today)
      .reduce((total, sale) => total + sale.products.reduce((acc, product) => acc + parseFloat(product.Amount), 0), 0);
  };

  const calculateTotalProductsSold = (sales) => {
    const productNames = sales.flatMap(sale => sale.products.map(product => product.name));
    const uniqueProductNames = [...new Set(productNames)];
    return uniqueProductNames.length;
  };

  const handleRowClick = (sale) => {
    setShowModal(true);
    setSelectedSale(sale);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedSale(null);
  };

  const salesBySalesperson = filteredSales.reduce((acc, sale) => {
    const { name } = sale.staff;
    const totalSale = sale.products.reduce((total, product) => total + parseFloat(product.Amount), 0);
    acc[name] = (acc[name] || 0) + totalSale;
    return acc;
  }, {});

  const paymentMethods = filteredSales.reduce((acc, sale) => {
    const method = sale.payment?.method || "Cash";
    acc[method] = (acc[method] || 0) + sale.products.reduce((total, product) => total + parseFloat(product.Amount), 0);
    return acc;
  }, {});

  const getCurrentDate = () => {
    return parseAndFormatDate(new Date());
  };

  const renderSelectedDatePeriod = () => {
    if (fromDate && toDate) {
      return `${parseAndFormatDate(fromDate)} to ${parseAndFormatDate(toDate)}`;
    } else if (fromDate) {
      return `From ${parseAndFormatDate(fromDate)}`;
    } else if (toDate) {
      return `To ${parseAndFormatDate(toDate)}`;
    } else {
      return 'All';
    }
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
        startDate.setHours(0, 0, 0, 0); // Start of the day
        endDate.setHours(23, 59, 59, 999); // End of the day
        break;
      case 'This Week':
        const today = startDate.getDay();
        startDate.setDate(startDate.getDate() - today);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'This Week to Date':
        const startOfWeek = startDate.getDay();
        startDate.setDate(startDate.getDate() - startOfWeek);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'This Month':
        startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
        break;
      case 'This Month - Date':
        startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'Last Month to Date':
        startDate = new Date(startDate.getFullYear(), startDate.getMonth() - 1, 1);
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'This Fiscal Quarter':
        const quarterStartMonth = Math.floor((startDate.getMonth() / 3)) * 3;
        startDate = new Date(startDate.getFullYear(), quarterStartMonth, 1);
        endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 3, 0);
        break;
      case 'This Fiscal Year':
        startDate = new Date(startDate.getFullYear(), 0, 1);
        endDate = new Date(startDate.getFullYear() + 1, 0, 0);
        break;
      case 'Yesterday':
        startDate.setDate(startDate.getDate() - 1);
        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'Last Week':
        startDate.setDate(startDate.getDate() - 7);
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'Last Month':
        startDate = new Date(startDate.getFullYear(), startDate.getMonth() - 1, 1);
        endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
        break;
      default:
        break;
    }
  
    setFromDate(startDate);
    setToDate(endDate);
  };

  return (
    <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 px-4 md:px-0">
      <div className="flex-none">
        {state.user && state.user.role === 'admin' ? <SalesPageSidePanel /> : <ProductsPageSidePanel />}
      </div>

      <div className="ml-8 flex-1">
        <div className="mb-8 p-2">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={handleReload}
              className="p-2 bg-gray-200 rounded ml-2"
            >
              Reload
            </button>
            <div className="flex-grow text-center">
              <h2 className="text-2xl font-bold">Sales</h2>
            </div>
            <button className="text-blue-500 cursor-pointer pr-24" onClick={() => window.history.back()}>
              Back
            </button>
          </div>

          <div className="flex flex-wrap p-2 md:space-x-4 space-y-4 md:space-y-0">
            {renderStatCard('Total Revenue', `₦${totalSalesValue}`, 'blue', faChartLine)}
            {renderStatCard('Total Sales', `₦${totalSalesValue}`, 'green', faShoppingCart)}
            {renderStatCard('Today Sales', `₦${calculateTodaySales().toFixed(2)}`, 'red', faCalendarAlt)}
            {renderStatCard('Cost Of Goods Sold', `₦${totalCOGS}`, 'gray', faBox)}
          </div>
        </div>

        {showModal && selectedSale && (
          <ReceiptModal saleInfo={selectedSale} onClose={handleCloseModal} />
        )}

        <div className="mb-4">
          <p><strong>Transactions by:</strong></p>
          <div className="flex flex-col md:flex-row md:items-center md:space-x-2 space-y-2 md:space-y-0">
            <div>
              <label
                htmlFor="dateOption"
                className="text-lg"
                style={{ marginRight: '16px' }}
              >
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
                  className="border border-gray-300 rounded-md p-2 pl-2 cursor-pointer w-full md:w-auto"
                />
                <FaCalendar className="absolute top-3 right-2 text-gray-400 pointer-events-none" />
              </div>
              <div className="relative">
                <DatePicker
                  selected={toDate}
                  onChange={handleToDateChange}
                  dateFormat="dd/MM/yyyy" // Changed to day/month/year format
                  placeholderText="To"
                  className="border border-gray-300 rounded-md p-2 pl-2 cursor-pointer w-full md:w-auto"
                />
                <FaCalendar className="absolute top-3 right-2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <input
              type="text"
              className="border border-gray-300 rounded-md p-2"
              placeholder="Search"
              onChange={(e) => setSearchKeyword(e.target.value)}
              style={{ marginLeft: 'auto', marginRight: '16px' }}
            />
          </div>
        </div>

        <div className="mb-8">
          <div className="table-container overflow-x-auto overflow-y-auto" style={{ maxHeight: '300px' }} id="sales-table" ref={tableRef}>
            <div className="mb-4 text-center">
              <h2 className="text-2xl font-bold underline">Sales Report</h2>
              <p><strong>Selected Date Period:</strong> {renderSelectedDatePeriod()}</p>
              <p>Report Printed On: {getCurrentDate()}</p>
            </div>

            <table className="w-full table-auto">
              <thead className="sticky top-0 bg-white z-10">
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
                  <th className="border">Sales Category</th>
                </tr>
              </thead>

              <tbody>
  {itemsToDisplay
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map((sale, index) => (
      <tr onClick={() => handleRowClick(sale)} title="Click To View Invoice" style={{ cursor: 'pointer' }} key={index}>
        <td className="border">{generateSn(index)}</td>
        <td className="border">
          {sale.products.map((product, productIndex) => (
            <div key={productIndex}>
              {product.name}
              {productIndex === sale.products.length - 1 ? '.' : ','}
              {productIndex < sale.products.length - 1 && <br />}
            </div>
          ))}
        </td>
        <td className="border">{parseAndFormatDate(sale.date)}</td> {/* Formatted date */}
        <td className="border">{sale.id.substring(0, 5)}{sale.id.length > 5 ? '...' : ''}</td>
        <td className="border">{sale.saleId}</td>
        <td className="border">{sale.customer.name}</td>
        <td className="border">{sale.payment?.method || 'N/A'}</td>
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
        <td className="border">{sale?.salesCategory || 'N/A'}</td>
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
      <strong>
        {Object.keys(salesBySalesperson).length > 1 ? "Sales Persons:" : "Sales Person:"}
      </strong>
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
    <td colSpan="3"><strong>Total Products Sold:</strong> {calculateTotalProductsSold(filteredSales)}</td>
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
<div className={`bg-${color}-500 text-white p-4 rounded-md inline-block m-2`}>
  <div className="text-sm">{title}</div>
  <div className="text-2xl font-bold">{value}</div>
</div>
);
export default SalesPage;