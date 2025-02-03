import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine,
  faShoppingCart,
  faCalendarAlt,
  faBox,
} from '@fortawesome/free-solid-svg-icons';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendar } from 'react-icons/fa';
import { useMyContext } from '../Context/MyContext';
import SalesPageSidePanel from '../components/SalesPageSidePanel';
import ExpenseInvoiceModal from '../components/ExpenseInvoiceModal';
import { Link } from 'react-router-dom';

const GoodsPurchases = () => {
  const { state, searchByKeyword, searchByDate, calculateTotalSalesValue, calculateTotalCOGS } = useMyContext();

  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [totalPurchaseValue, setTotalPurchaseValue] = useState(0);
  const tableRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [filteredPurchases, setFilteredPurchases] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedDateOption, setSelectedDateOption] = useState('All');
  const [totalSalesValue, setTotalSalesValue] = useState(0);
  const [totalCogsValue, setTotalCogsValue] = useState(0);

  useEffect(() => {
    const totalSales = calculateTotalSalesValue(state.sales);
    setTotalSalesValue(totalSales);
  }, [state.sales, calculateTotalSalesValue]);

  useEffect(() => {
    const totalCOGS = calculateTotalCOGS(state.sales);
    setTotalCogsValue(totalCOGS);
  }, [state.sales, calculateTotalCOGS]);

  useEffect(() => {
    calculateTotalPurchaseValue(filteredPurchases);
  }, [filteredPurchases]);

  useEffect(() => {
    let filtered = state.purchases;
    if (fromDate && toDate) {
      filtered = searchByDate(filtered, fromDate, toDate);
    }
    if (searchKeyword) {
      filtered = searchByKeyword(filtered, searchKeyword);
    }
    setFilteredPurchases(filtered);
    calculateTotalPurchaseValue(filtered);
  }, [state.purchases, fromDate, toDate, searchKeyword, searchByDate, searchByKeyword]);

  const calculateTotalPurchaseValue = (purchases) => {
    if (!purchases || purchases.length === 0) {
      setTotalPurchaseValue(0);
      return;
    }
    const calculatedTotalPurchaseValue = purchases.reduce((total, purchase) => {
      return total + parseFloat(purchase.totalCost || 0);
    }, 0);
    setTotalPurchaseValue(calculatedTotalPurchaseValue.toFixed(2));
  };

  const handlePurchaseClick = (purchase) => {
    setShowModal(true);
    setSelectedPurchase(purchase);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPurchase(null);
  };

  const handleFromDateChange = (date) => {
    setFromDate(date);
    if (toDate) {
      const filteredByDate = searchByDate(state.purchases, date, toDate);
      setFilteredPurchases(filteredByDate);
      calculateTotalPurchaseValue(filteredByDate);
    }
  };

  const handleToDateChange = (date) => {
    setToDate(date);
    if (fromDate) {
      const filteredByDate = searchByDate(state.purchases, fromDate, date);
      setFilteredPurchases(filteredByDate);
      calculateTotalPurchaseValue(filteredByDate);
    }
  };

  const calculateTodayPurchases = () => {
    const today = new Date().toLocaleDateString();
    return state.purchases
      .filter((purchase) => new Date(purchase.date).toLocaleDateString() === today)
      .reduce((total, purchase) => total + parseFloat(purchase.totalCost), 0);
  };

  const generateSn = (index) => index + 1;

  const saveAndPrintTable = () => {
    const table = document.getElementById('sales-table');
    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Sales Table</title>');
    printWindow.document.write('<style>@media print { .text-center { text-align: center; } .mb-4 { margin-bottom: 4px; } .table-print { border-collapse: collapse; } .table-print th, .table-print td { border: 2px solid black; padding: 8px; } }</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(table.outerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  };

  const renderActionButtons = () => (
    <div className="flex justify-center mt-10">
      <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <button className="bg-blue-500 text-white px-4 py-2 rounded-md" onClick={saveAndPrintTable}>
          Print Report
        </button>
        <Link to="/add-purchase" className="bg-blue-500 text-white px-4 py-2 rounded-md">
          Add Purchase
        </Link>
      </div>
    </div>
  );

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
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'This Week':
        const today = startDate.getDay();
        startDate.setDate(startDate.getDate() - today);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'This Month':
        startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
        break;
      case 'Yesterday':
        startDate.setDate(startDate.getDate() - 1);
        endDate = new Date(startDate);
        break;
      case 'Last Week':
        startDate.setDate(startDate.getDate() - 7);
        endDate.setDate(endDate.getDate() + 6);
        break;
      case 'Last Month':
        startDate = new Date(startDate.getFullYear(), startDate.getMonth() - 1, 1);
        endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
        break;
      default:
        break;
    }

    setFromDate(new Date(startDate));
    setToDate(new Date(endDate));
  };

  const formatDate = (date) => date.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const getCurrentDate = () => formatDate(new Date());

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
    <div className="container mx-auto flex flex-col md:flex-row">
      <div className="flex-none hidden lg:block">
        <SalesPageSidePanel />
      </div>

      <div className="flex-1 md:ml-8 p-4">
        <div className="mb-8 p-2">
          <div className="flex items-center justify-between mb-4 pr-4">
            <h2 className="text-2xl font-bold">Purchase Stats</h2>
            <button className="text-blue-500 cursor-pointer" onClick={() => window.history.back()}>
              Back
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            {renderStatCard('Total Purchases', `₦${totalPurchaseValue}`, 'blue', faChartLine)}
            {renderStatCard('Today Purchases', `₦${calculateTodayPurchases().toFixed(2)}`, 'red', faCalendarAlt)}
            {renderStatCard('Total Sales', `₦${totalSalesValue}`, 'green', faShoppingCart)}
            {renderStatCard('COG Sold', `₦${totalCogsValue}`, 'gray', faBox)}
          </div>
        </div>

        <div className="mb-8">
          <p><strong>Purchases by Dates:</strong></p>
          <div className="flex flex-col items-center sm:flex-row sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex flex-col items-center sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <label htmlFor="dateOption" className="text-lg">Dates</label>
              <select
                id="dateOption"
                value={selectedDateOption}
                onChange={handleDateOptionChange}
                className="border border-gray-300 rounded-md p-2"
                style={{ width: '150px' }}
              >
                <option value="All">All</option>
                <option value="Today">Today</option>
                <option value="This Week">This Week</option>
                <option value="This Month">This Month</option>
                <option value="Yesterday">Yesterday</option>
                <option value="Last Week">Last Week</option>
                <option value="Last Month">Last Month</option>
              </select>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
              <div className="relative">
                <DatePicker
                  selected={fromDate}
                  onChange={handleFromDateChange}
                  dateFormat="MM-dd-yyyy"
                  placeholderText="From"
                  className="border border-gray-300 rounded-md p-2 cursor-pointer"
                />
                <FaCalendar className="absolute top-3 right-2 text-gray-400 pointer-events-none" />
              </div>
              <div className="relative">
                <DatePicker
                  selected={toDate}
                  onChange={handleToDateChange}
                  dateFormat="MM-dd-yyyy"
                  placeholderText="To"
                  className="border border-gray-300 rounded-md p-2 cursor-pointer"
                />
                <FaCalendar className="absolute top-3 right-2 text-gray-400 pointer-events-none" />
              </div>
               <input
              type="text"
              className="border border-gray-300 rounded-md p-2"
              placeholder="Search"
              onChange={(e) => setSearchKeyword(e.target.value)}
              style={{ marginLeft: '16px', marginRight: '16px' }}
            />
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="table-container overflow-x-auto overflow-y-auto max-h-96" id="sales-table" ref={tableRef}>
            <div className="mb-4 text-center">
              <h2 className="text-2xl font-bold underline">Goods Purchase Record</h2>
              <p><strong>Selected Date Period:</strong> {renderSelectedDatePeriod()}</p>
              <p>Report Printed On: {getCurrentDate()}</p>
            </div>

            <table className="w-full table-auto">
              <thead className="sticky top-0 bg-white z-10">
                <tr>
                  <th className="border">S/n</th>
                  <th className="border">Attendant Name</th>
                  <th className="border">Description</th>
                  <th className="border">Invoice No</th>
                  <th className="border">Item Name</th>
                  <th className="border">Purchase Date</th>
                  <th className="border">Quantity</th>
                  <th className="border">Unit Price</th>
                  <th className="border">Total Cost</th>
                  <th className="border">Supplier Name</th>
                  <th className="border">Payment Method</th>
                  <th className="border">Payment Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredPurchases
                  .sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate))
                  .map((purchase, index) => (
                    <tr key={index} onClick={() => handlePurchaseClick(purchase)} style={{ cursor: 'pointer' }}>
                      <td className="border">{generateSn(index)}</td>
                      <td className="border">{purchase.attendantName}</td>
                      <td className="border">{purchase.description}</td>
                      <td className="border">{purchase.invoiceNo}</td>
                      <td className="border">{purchase.itemName}</td>
                      <td className="border">{new Date(purchase.purchaseDate).toLocaleDateString()}</td>
                      <td className="border">{purchase.quantity}</td>
                      <td className="border">₦{parseFloat(purchase.unitPrice).toFixed(2)}</td>
                      <td className="border">₦{parseFloat(purchase.totalCost).toFixed(2)}</td>
                      <td className="border">{purchase.supplierName}</td>
                      <td className="border">{purchase.paymentMethod}</td>
                      <td className="border">{purchase.paymentStatus}</td>
                    </tr>
                  ))}
                <tr>
                  <td className="border"><strong>Total</strong></td>
                  <td colSpan="7" className="border"></td>
                  <td className="border"><strong>₦{totalPurchaseValue}</strong></td>
                  <td colSpan="3" className="border"></td>
                </tr>
              </tbody>
            </table>
          </div>
          {renderActionButtons()}
        </div>

        {showModal && selectedPurchase && (
          <ExpenseInvoiceModal expenseInfo={selectedPurchase} onClose={handleCloseModal} />
        )}
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

export default GoodsPurchases;