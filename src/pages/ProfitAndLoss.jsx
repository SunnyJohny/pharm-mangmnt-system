import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendar } from 'react-icons/fa';
import { useMyContext } from '../Context/MyContext';
import ReceiptModal from '../components/ReceiptModal';

const ProfitAndLoss = () => {
  const { state, searchByDate, calculateTotalSalesValue, calculateTotalCOGS } = useMyContext();
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const navigate = useNavigate();

  const [totalSalesValue, setTotalSalesValue] = useState(0);
  const tableRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [filteredSales, setFilteredSales] = useState([]);
  const [totalTaxPaid, setTotalTaxPaid] = useState(0);
  const [totalExpenseAmount, setTotalExpenseAmount] = useState(0);
  const [totalCOGS, setTotalCOGS] = useState(0);
  const [selectedDateOption, setSelectedDateOption] = useState('All');

  useEffect(() => {
    const filteredByDate = searchByDate(state.taxes, fromDate, toDate);
    const totalTax = filteredByDate.reduce((total, tax) => total + parseFloat(tax.paidAmount || 0), 0);
    setTotalTaxPaid(totalTax);
  }, [state.taxes, fromDate, toDate, searchByDate]);

  useEffect(() => {
    calculateTotalSalesValue(filteredSales);
  }, [filteredSales, calculateTotalSalesValue]);

  useEffect(() => {
    setTotalSalesValue(calculateTotalSalesValue(filteredSales));
    setTotalCOGS(calculateTotalCOGS(filteredSales));
  }, [filteredSales, calculateTotalCOGS, calculateTotalSalesValue]);

  useEffect(() => {
    let filteredByDate;
    if (fromDate && toDate) {
      filteredByDate = searchByDate(state.expenses, fromDate, toDate);
    } else {
      filteredByDate = state.expenses;
    }
    const totalAmount = filteredByDate.reduce((acc, expense) => acc + parseFloat(expense.amount), 0);
    setTotalExpenseAmount(totalAmount);
  }, [state.expenses, searchByDate, fromDate, toDate]);

  useEffect(() => {
    const filteredByDate = searchByDate(state.sales, fromDate, toDate);
    setFilteredSales(filteredByDate);
  }, [state.sales, searchByDate, fromDate, toDate]);

  const handleFromDateChange = (date) => {
    setFromDate(date);
    const filteredByDate = searchByDate(state.sales, date, fromDate);
    setFilteredSales(filteredByDate);
    calculateTotalSalesValue(filteredByDate);
  };

  const handleToDateChange = (date) => {
    setToDate(date);
    const filteredByDate = searchByDate(state.sales, toDate, date);
    setFilteredSales(filteredByDate);
    calculateTotalSalesValue(filteredByDate);
  };

  const saveAndPrintTable = () => {
    const table = document.getElementById('sales-table');
    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Sales Table</title>');
    printWindow.document.write('<style>');
    printWindow.document.write(`
      body { font-family: Arial, sans-serif; margin: 20px; }
      .table-print { border-collapse: collapse; width: 100%; }
      .table-print th, .table-print td { border: 2px solid black; padding: 8px; }
    `);
    printWindow.document.write('</style></head><body>');
    printWindow.document.write(table.outerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
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
    } else {
      return 'All';
    }
  };

  const handleBack = () => {
    navigate("/inventory-page");
  };

  const profitAndLossData = {
    revenue: totalSalesValue,
    costOfGoodsSold: totalCOGS,
    grossProfit: (totalSalesValue - totalCOGS).toFixed(2),
    operatingExpenses: totalExpenseAmount.toFixed(2),
    taxes: totalTaxPaid.toFixed(2),
    netIncome: (totalSalesValue - totalCOGS - totalTaxPaid - totalExpenseAmount).toFixed(2)
  };

  return (
    <div className="container mx-auto flex flex-col items-center h-screen p-4 md:p-8">
      <div className="flex flex-col flex-1 items-center w-full max-w-4xl">
        {showModal && selectedSale && (
          <ReceiptModal saleInfo={selectedSale} onClose={handleCloseModal} />
        )}

        <div className="mb-8 w-full">

          <h2 className="text-2xl text-center font-bold mb-4">Profit & Loss Statement</h2>
          <div className="flex items-center justify-between mb-4">
            <button className="text-blue-500 cursor-pointer" onClick={handleBack}>Back</button>
          </div>
         
          <div className="flex flex-col items-center space-y-4 w-full">
            <div className="flex flex-col items-center space-y-2">
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
            <div className="flex flex-col items-center space-y-2">
              <div className="text-lg">Sales by Date</div>
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
            </div>
          </div>
        </div>

        <div className="mb-8 w-full">
          

          <div className="table-container overflow-x-auto overflow-y-auto w-full max-h-96" id="sales-table" ref={tableRef}>
            <div className="mb-4 text-center">
              <h2 className="text-2xl font-bold underline">Income Statement</h2>
              <p><strong>Selected Date Period:</strong> {renderSelectedDatePeriod()}</p>
              <p>Report Printed On: {getCurrentDate()}</p>
            </div>

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
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 font-semibold">₦{profitAndLossData.grossProfit}</dd>
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
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 font-bold underline">₦{profitAndLossData.netIncome}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          <button className="bg-blue-500 text-white px-4 py-2 rounded-md block mx-auto mt-4" onClick={saveAndPrintTable}>
            Print Statement
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfitAndLoss;