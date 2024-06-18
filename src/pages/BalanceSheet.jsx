import React, { useState, useRef, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { FaCalendar, FaArrowLeft } from 'react-icons/fa';
import 'react-datepicker/dist/react-datepicker.css';
import { useMyContext } from '../Context/MyContext';
import { useNavigate } from 'react-router-dom';

const BalanceSheet = () => {
  const { state } = useMyContext();
  const [selectedDateOption, setSelectedDateOption] = useState('');
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [showSection, setShowSection] = useState({
    currentAssets: false,
    nonCurrentAssets: false,
    liabilities: false,
    equity: false,
  });
  const [isDialogOpen, setIsDialogOpen] = useState(true);
  const dialogRef = useRef();
  const tableRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('My products', state.products);
  }, [state.products]);

  useEffect(() => {
    console.log('My Liabilities', state.liabilities);
  }, [state.liabilities]);

  const calculateAccountsReceivable = () => {
    const totalCreditSum = state.sales
      .filter(sale => sale.payment.method === 'Credit')
      .reduce((sum, sale) => sum + (Number(sale.totalAmount) || 0), 0);

    console.log('Total credit sales sum:', totalCreditSum);
    return totalCreditSum;
  };

  const accountsReceivable = calculateAccountsReceivable();

  const calculateInventoryValue = () => {
    const totalInventoryValue = state.products.reduce((sum, product) => {
      const price = Number(product.price) || 0;
      const quantityRestock = Number(product.quantityRestock) || 0;
      return sum + (price * quantityRestock);
    }, 0);

    console.log('Total inventory value sum:', totalInventoryValue);
    return totalInventoryValue;
  };
  const inventoryValue = calculateInventoryValue();

  const calculateTotals = () => {
    const totalAssets =
      state.assets.reduce(
        (sum, asset) => sum + (Number(asset.marketValue) || Number(asset.amount) || Number(asset.purchasePrice) || 0),
        0
      ) + accountsReceivable + inventoryValue;

    const totalLiabilities = state.liabilities.reduce((sum, liability) => sum + (Number(liability.amount) || 0), 0);

    const directEquity =
      (Number(state.equity?.ownersEquity) || 0) + (Number(state.equity?.retainedEarnings) || 0);
    const derivedEquity = totalAssets - totalLiabilities;

    if (directEquity !== derivedEquity) {
      console.warn('Discrepancy detected between direct and derived equity calculations.');
    }

    return { totalAssets, totalLiabilities, directEquity, derivedEquity };
  };

  const { totalAssets, totalLiabilities, directEquity, derivedEquity } = calculateTotals();

  const handleDateOptionChange = (event) => {
    setSelectedDateOption(event.target.value);
  };

  const handleFromDateChange = (date) => {
    setFromDate(date);
  };

  const handleToDateChange = (date) => {
    setToDate(date);
  };

  const toggleSection = (section) => {
    setShowSection({ ...showSection, [section]: !showSection[section] });
  };

  const getCurrentDate = () => {
    const date = new Date();
    return date.toLocaleDateString();
  };

  const renderSelectedDatePeriod = () => {
    if (fromDate && toDate) {
      return `${fromDate.toLocaleDateString()} - ${toDate.toLocaleDateString()}`;
    }
    return 'N/A';
  };

  const renderAssetDetails = (assetType, label) => {
    const asset = state.assets.find((asset) => asset.assetType === assetType);
    const value = asset ? (Number(asset.marketValue) || Number(asset.amount) || Number(asset.purchasePrice) || 0) : 0;
    return (
      <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6" aria-label={label} key={assetType}>
        <dt className="text-sm font-medium text-gray-500">{label}</dt>
        <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">₦{value}</dd>
      </div>
    );
  };

  const renderCurrentAssets = () => {
    const currentAssetTypes = [
      { type: 'cash', label: 'Cash' },
      { type: 'checking', label: 'Checking' },
      { type: 'cashEquivalents', label: 'Cash Equivalents' },
    ];

    return currentAssetTypes.map((assetType) => renderAssetDetails(assetType.type, assetType.label));
  };

  const renderNonCurrentAssets = () => {
    const nonCurrentAssetTypes = [
      { type: 'fixedAssets', label: 'Fixed Assets' },
      { type: 'otherAssets', label: 'Other Assets' },
    ];

    return nonCurrentAssetTypes.map((assetType) => renderAssetDetails(assetType.type, assetType.label));
  };

  const renderLiabilities = () => {
    return state.liabilities.map((liability) => (
      <div key={liability.id} className="bg-gray-100 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
        <dt className="text-sm font-medium text-gray-500">{liability.liabilityName}</dt>
        <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">₦{liability.amount}</dd>
      </div>
    ));
  };

  const saveAndPrintTable = () => {
    console.log('Save and Print Table');
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    dialogRef.current.close();
  };

  useEffect(() => {
    if (isDialogOpen && dialogRef.current) {
      dialogRef.current.showModal();
    }
  }, [isDialogOpen]);

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="container mx-auto flex h-full flex-col">
      <dialog ref={dialogRef} className="p-6 rounded-lg shadow-lg">
        <p className="mb-4">Make sure you update your assets and liability sections to get accurate data.</p>
        <button onClick={closeDialog} className="bg-blue-500 text-white px-4 py-2 rounded-md">
          OK
        </button>
      </dialog>
      <div className="flex justify-between items-center mb-8">
        <div className="ml-8">
          <h2 className="text-2xl font-bold" id="sales-table">
            Balance Sheet
          </h2>
        </div>
        <button className="text-blue-500 cursor-pointer" onClick={goBack}>
          <FaArrowLeft size={24} />
        </button>
      </div>
      <div className="ml-8 flex-1 overflow-auto pb-8">
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <div>
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
                {/* Options for date selection */}
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
            <input
              type="text"
              className="border border-gray-300 rounded-md p-2"
              placeholder="Search"
              style={{ marginLeft: 'auto' }}
            />
          </div>
        </div>
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button className="text-blue-500 cursor-pointer" onClick={() => toggleSection('currentAssets')}>
              {showSection.currentAssets ? '▼' : '▶'} Current Assets
            </button>
          </div>
          {showSection.currentAssets && (
            <div>
              {renderCurrentAssets()}
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6" aria-label="Accounts Receivable">
                <dt className="text-sm font-medium text-gray-500">Accounts Receivable</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">₦{accountsReceivable}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6" aria-label="Inventory">
                <dt className="text-sm font-medium text-gray-500">Inventory</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2">₦{calculateInventoryValue()}</dd>
              </div>
              <hr className="border-t border-gray-300 my-4" />
              <div className="bg-gray-200 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6" aria-label="Total Current Assets">
                <dt className="text-lg font-medium text-gray-700">Total Current Assets</dt>
                <dd className="mt-1 text-lg text-gray-900 sm:col-span-2">₦{accountsReceivable + inventoryValue}</dd>
              </div>
            </div>
          )}
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button className="text-blue-500 cursor-pointer" onClick={() => toggleSection('nonCurrentAssets')}>
              {showSection.nonCurrentAssets ? '▼' : '▶'} Non-Current Assets
            </button>
          </div>
          {showSection.nonCurrentAssets && (
            <div>
              {renderNonCurrentAssets()}
              <hr className="border-t border-gray-300 my-4" />
              <div className="bg-gray-200 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6" aria-label="Total Non-Current Assets">
                <dt className="text-lg font-medium text-gray-700">Total Non-Current Assets</dt>
                <dd className="mt-1 text-lg text-gray-900 sm:col-span-2">₦{state.assets.reduce((sum, asset) => asset.assetType !== 'cash' && asset.assetType !== 'checking' && asset.assetType !== 'cashEquivalents' ? sum + (Number(asset.marketValue) || Number(asset.amount) || Number(asset.purchasePrice) || 0) : sum, 0)}</dd>
              </div>
            </div>
          )}
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button className="text-blue-500 cursor-pointer" onClick={() => toggleSection('liabilities')}>
              {showSection.liabilities ? '▼' : '▶'} Liabilities
            </button>
          </div>
          {showSection.liabilities && (
            <div>
              {renderLiabilities()}
              <hr className="border-t border-gray-300 my-4" />
              <div className="bg-gray-200 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6" aria-label="Total Liabilities">
                <dt className="text-lg font-medium text-gray-700">Total Liabilities</dt>
                <dd className="mt-1 text-lg text-gray-900 sm:col-span-2">₦{totalLiabilities}</dd>
              </div>
            </div>
          )}
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button className="text-blue-500 cursor-pointer" onClick={() => toggleSection('equity')}>
              {showSection.equity ? '▼' : '▶'} Equity
            </button>
          </div>
          {showSection.equity && (
            <div>
              {/* Render equity details */}
              <hr className="border-t border-gray-300 my-4" />
              <div className="bg-gray-200 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6" aria-label="Total Equity">
                <dt className="text-lg font-medium text-gray-700">Total Equity</dt>
                <dd className="mt-1 text-lg text-gray-900 sm:col-span-2" style={{ textDecoration: 'underline double' }}>₦{derivedEquity}</dd>
              </div>
            </div>
          )}
        </div>

        <div className="bg-gray-200 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6" aria-label="Total Assets">
          <dt className="text-lg font-medium text-gray-700">Total Assets</dt>
          <dd className="mt-1 text-lg text-gray-900 sm:col-span-2">₦{totalAssets}</dd>
        </div>
        <div className="bg-gray-200 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6" aria-label="Total Liabilities">
          <dt className="text-lg font-medium text-gray-700">Total Liabilities</dt>
          <dd className="mt-1 text-lg text-gray-900 sm:col-span-2">₦{totalLiabilities}</dd>
        </div>
        <div className="bg-gray-200 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6" aria-label="Equity">
          <dt className="text-lg font-medium text-gray-700">Equity</dt>
          <dd className="mt-1 text-lg text-gray-900 sm:col-span-2" style={{ textDecoration: 'underline double' }}>₦{derivedEquity}</dd>
        </div>

        <div className="flex justify-center mb-8">
          <button
            className="bg-blue-500 text-white px-4 py-2 mt-2 rounded-md"
            onClick={saveAndPrintTable}
          >
            Save and Print
          </button>
        </div>
      </div>
    </div>
  );
};

export default BalanceSheet;
