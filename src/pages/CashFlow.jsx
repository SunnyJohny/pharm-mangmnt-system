import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendar } from 'react-icons/fa';

const CashFlow = () => {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [selectedDateOption, setSelectedDateOption] = useState('All');

  const hardcodedData = {
    operatingActivities: {
      cashReceivedFromCustomers: 100000,
      cashPaidToSuppliers: 60000,
      cashPaidForWages: 20000,
      netCashFromOperatingActivities: 20000
    },
    investingActivities: {
      purchaseOfEquipment: 10000,
      proceedsFromSaleOfInvestments: 5000,
      netCashFromInvestingActivities: -5000
    },
    financingActivities: {
      proceedsFromLoans: 15000,
      repaymentOfLoans: 5000,
      dividendsPaid: 3000,
      netCashFromFinancingActivities: 7000
    },
    summary: {
      netIncreaseInCash: 22000,
      cashAtBeginningOfPeriod: 10000,
      cashAtEndOfPeriod: 32000
    }
  };

  const handleFromDateChange = (date) => {
    setFromDate(date);
  };

  const handleToDateChange = (date) => {
    setToDate(date);
  };

  const handleDateOptionChange = (e) => {
    const selectedOption = e.target.value;
    setSelectedDateOption(selectedOption);
  };

  const formatDate = (date) => {
    return date ? date.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'All';
  };

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

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const saveAndPrintTable = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Cash Flow Statement</title></head><body>');
    printWindow.document.write(document.getElementById('cash-flow-table').outerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div className="container mx-auto flex h-screen">
      <div className="ml-8 flex-1">
        <div className="mb-8">
          <h2 className="text-2xl text-center font-bold mb-4">Cash Flow Statement</h2>
          <div className="flex items-center space-x-4">
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
                <option value="This Month">This Month</option>
                <option value="This Fiscal Quarter">This Fiscal Quarter</option>
                <option value="This Fiscal Year">This Fiscal Year</option>
                <option value="Yesterday">Yesterday</option>
                <option value="Last Week">Last Week</option>
                <option value="Last Month">Last Month</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-lg">Date Range</div>
              <div className="relative">
                <DatePicker
                  selected={fromDate}
                  onChange={handleFromDateChange}
                  dateFormat="MM-dd-yyyy"
                  placeholderText="From"
                  className="border border-gray-300 rounded-md p-2 pl-2 cursor-pointer"
                />
                <FaCalendar className="absolute top-3 right-2 text-gray-400 pointer-events-none" />
              </div>
              <div className="relative">
                <DatePicker
                  selected={toDate}
                  onChange={handleToDateChange}
                  dateFormat="MM-dd-yyyy"
                  placeholderText="To"
                  className="border border-gray-300 rounded-md p-2 pl-2 cursor-pointer"
                />
                <FaCalendar className="absolute top-3 right-2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button className="text-blue-500 cursor-pointer" onClick={() => window.history.back()}>
              Back
            </button>
          </div>

          <div className="table-container overflow-x-auto overflow-y-auto" style={{ maxHeight: '300px' }} id="cash-flow-table">
            <div className="mb-4 text-center">
              <h2 className="text-2xl font-bold underline">Cash Flow Statement</h2>
              <p><strong>Selected Date Period:</strong> {renderSelectedDatePeriod()}</p>
              <p>Report Printed On: {getCurrentDate()}</p>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg font-semibold leading-6 text-gray-900">Cash Flow Summary</h3>
              </div>
              <div className="border-t border-gray-200">
                <dl>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Operating Activities</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                      Cash Received from Customers: ₦{hardcodedData.operatingActivities.cashReceivedFromCustomers}<br />
                      Cash Paid to Suppliers: ₦{hardcodedData.operatingActivities.cashPaidToSuppliers}<br />
                      Cash Paid for Wages: ₦{hardcodedData.operatingActivities.cashPaidForWages}<br />
                      Net Cash from Operating Activities: ₦{hardcodedData.operatingActivities.netCashFromOperatingActivities}
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Investing Activities</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                      Purchase of Equipment: ₦{hardcodedData.investingActivities.purchaseOfEquipment}<br />
                      Proceeds from Sale of Investments: ₦{hardcodedData.investingActivities.proceedsFromSaleOfInvestments}<br />
                      Net Cash from Investing Activities: ₦{hardcodedData.investingActivities.netCashFromInvestingActivities}
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Financing Activities</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                      Proceeds from Loans: ₦{hardcodedData.financingActivities.proceedsFromLoans}<br />
                      Repayment of Loans: ₦{hardcodedData.financingActivities.repaymentOfLoans}<br />
                      Dividends Paid: ₦{hardcodedData.financingActivities.dividendsPaid}<br />
                      Net Cash from Financing Activities: ₦{hardcodedData.financingActivities.netCashFromFinancingActivities}
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Summary</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">
                      Net Increase in Cash: ₦{hardcodedData.summary.netIncreaseInCash}<br />
                      Cash at Beginning of Period: ₦{hardcodedData.summary.cashAtBeginningOfPeriod}<br />
                      Cash at End of Period: ₦{hardcodedData.summary.cashAtEndOfPeriod}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600" onClick={saveAndPrintTable}>
              Save and Print Table
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashFlow;
