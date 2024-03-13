import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendar } from 'react-icons/fa';
import { useMyContext } from '../Context/MyContext';
import { faChartLine, faShoppingCart, faCalendarAlt, faBox } from '@fortawesome/free-solid-svg-icons';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import SalesPageSidePanel from '../components/SalesPageSidePanel';
import ReceiptModal from '../components/ReceiptModal';



const SalesPage = () => {
  const { state, searchByKeyword, searchByDate } = useMyContext();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  // const [filteredItems, setFilteredItems] = useState([]);
  const [totalStoreValue, setTotalStoreValue] = useState(0);
  const [firstRestockDates, setFirstRestockDates] = useState({});
  const [allPagesContent, setAllPagesContent] = useState([]);
  const [totalSalesValue, setTotalSalesValue] = useState(0); // Added state for total sales
  const navigate = useNavigate();
  const tableRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [filteredSales, setFilteredSales] = useState([]);
  const [, forceUpdate] = useState();
  const forceComponentUpdate = () => forceUpdate((prev) => !prev);

  const [searchKeyword, setSearchKeyword] = useState('');












  useEffect(() => {
    // Handle changes related to date filtering
    const filteredByDate = searchByDate(state.sales, fromDate, toDate);
  
    // Update filteredSales and calculate total store value based on filtered items
    setFilteredSales(filteredByDate);
    calculateTotalStoreValue(filteredByDate);
  }, [state.sales, searchByDate, fromDate, toDate]);
  
  useEffect(() => {
    // Handle changes related to keyword filtering
    const filteredByKeyword = searchByKeyword(state.sales, searchKeyword);
  
    // Update filteredSales and calculate total store value based on filtered items
    setFilteredSales(filteredByKeyword);
    calculateTotalStoreValue(filteredByKeyword);
  }, [state.sales, searchByKeyword, searchKeyword]);
  useEffect(() => {
    // Handle changes related to date filtering
    const filteredByDate = searchByDate(state.sales, fromDate, toDate);
  
    // Update filteredSales and calculate total store value based on filtered items
    setFilteredSales(filteredByDate);
    calculateTotalStoreValue(filteredByDate);
  }, [state.sales, searchByDate, fromDate, toDate]);
  
  useEffect(() => {
    // Handle changes related to keyword filtering
    const filteredByKeyword = searchByKeyword(state.sales, searchKeyword);
  
    // Update filteredSales and calculate total store value based on filtered items
    setFilteredSales(filteredByKeyword);
    calculateTotalStoreValue(filteredByKeyword);
  }, [state.sales, searchByKeyword, searchKeyword]);
    





  // useEffect(() => {
  //   setFilteredSales(state.sales);
  //   console.log(filteredSales) ;   

  // }, [state.sales]);



  useEffect(() => {
    if (tableRef.current) {
      console.log('Container dimensions:', tableRef.current.offsetWidth, tableRef.current.offsetHeight);
    }
  }, []);

  const totalItems = filteredSales.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const itemsToDisplay = filteredSales.slice(startIndex, endIndex);








  const handleFromDateChange = (date) => {
    setFromDate(date);


  };

  const handleToDateChange = (date) => {
    setToDate(date);

  };


  const generateSn = (index) => index + 1;

  // const handleRowClick = (itemId) => {
  //   navigate(`/product-details/${itemId}`);
  // };

  const renderActionButtons = () => {
    const handlePrintInventory = async () => {
      const pdf = new jsPDF();

      const tableContainer = document.querySelector('.table-container');

      if (tableContainer) {
        const canvas = await html2canvas(tableContainer);
        const imgData = canvas.toDataURL('image/png');

        pdf.addImage(imgData, 'PNG', 10, 10);

        const firstPageContent = imgData;

        if (allPagesContent.length > 0) {
          for (let index = 0; index < allPagesContent.length; index++) {
            const pageContent = allPagesContent[index];
            pdf.addPage();
            pdf.addImage(pageContent, 'PNG', 10, 10 + (index + 1) * tableContainer.clientHeight);
          }
        }

        navigate('/print-inventory', {
          state: {
            itemsToDisplay: itemsToDisplay.map((item, index) => ({
              ...item,
              sn: generateSn(index),
            })),
            state: {
              itemsPerPage,
              filteredSales,
              totalStoreValue,
              firstRestockDates,
              allPagesContent,
            },
          },
        });
      }
    };

    return (
      <button className="bg-blue-500 text-white px-4 py-2 rounded-md" onClick={handlePrintInventory}>
        Print Inventory
      </button>
    );
  };

  useEffect(() => {
    const salesDataFromContext = state.sales || [];
    console.log('Sales Data:', salesDataFromContext);
  }, [state.sales, state.products, state.productTotals, state.productTotalsMap]);

  useEffect(() => {
    const initialItems = state.sales || [];
    setFilteredSales(initialItems);
    const capturePagesContent = async () => {
      const pagesContent = [];
      const tableContainer = document.querySelector('.table-container');
      const itemsPerPage = 20;

      if (tableContainer) {
        const totalItems = filteredSales.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);

        for (let page = 1; page <= totalPages; page++) {
          const startIndex = (page - 1) * itemsPerPage;
          const endIndex = startIndex + itemsPerPage;
          const itemsToDisplay = filteredSales.slice(startIndex, endIndex);

          setFilteredSales(itemsToDisplay);
          calculateTotalStoreValue(itemsToDisplay);

          await new Promise((resolve) => setTimeout(resolve, 500));

          const canvas = await html2canvas(tableContainer);
          pagesContent.push(canvas.toDataURL('image/png'));
        }

        setAllPagesContent(pagesContent);
        setFilteredSales(initialItems);
        calculateTotalStoreValue(initialItems);
      }
    };

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

  const calculateTotalSalesValue = () => {
    const calculatedTotalSalesValue = state.sales.reduce(
      (total, sale) =>
        total +
        sale.products.reduce((acc, product) => acc + parseFloat(product.price), 0),
      0
    );
    setTotalSalesValue(calculatedTotalSalesValue.toFixed(2));
  };

  const calculateTodaySales = () => {
    const today = new Date().toLocaleDateString();

    return state.sales
      .filter((sale) => new Date(sale.date).toLocaleDateString() === today)
      .reduce((total, sale) => total + sale.products.reduce((acc, product) => acc + parseFloat(product.price), 0), 0);
  };


  const calculateTotalProductsSold = () => {
    const productNames = state.sales.flatMap(sale => sale.products.map(product => product.name));
    const uniqueProductNames = [...new Set(productNames)];
    return uniqueProductNames.length;
  };


  // Calculate total sales value on mount and when sales change
  useEffect(() => {
    calculateTotalSalesValue();
  }, [state.sales]);

  const handleRowClick = (sale) => {
    console.log('Clicked on row with ID:', sale.id); // Log the ID to the console
    setShowModal(true);
    setSelectedSale(sale);
  };


  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedSale(null);
  };
  return (
    <div className="container mx-auto flex">
      <div className="flex-none">
        <SalesPageSidePanel />
      </div>

      <div className="ml-8 flex-1">
        <div className="mb-8 p-2">
          <h2 className="text-2xl font-bold">Sales Stats</h2>
          <div className="flex mt-4 space-x-4">
            {renderStatCard('Total Revenue', `₦${totalSalesValue}`, 'blue', faChartLine)}
            {renderStatCard('Total Sales', `₦${totalSalesValue}`, 'pink', faShoppingCart)}
            {renderStatCard(
              'Today Sales',
              `₦${calculateTodaySales().toFixed(2)}`,
              'red',
              faCalendarAlt
            )}
            {renderStatCard('Cost Of Goods Sold', calculateTotalProductsSold(), 'blue', faBox)}
          </div>
        </div>

        {showModal && selectedSale && (
          <ReceiptModal saleInfo={selectedSale} onClose={handleCloseModal} />
        )}

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Transactions</h2>
          <div className="flex items-center space-x-4">
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
                {filteredSales
                  .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by date in descending order
                  .map((sale, index) => (
                    <tr onClick={() => handleRowClick(sale)} title="Click To View Invoice" style={{ cursor: 'pointer' }} key={index}>
                      <td className="border">{generateSn(index)}</td>
                      <td className="border">
                        {sale.products.map((product, productIndex) => (
                          <span key={productIndex}>
                            {productIndex < 2 ? (
                              <span>{product.name}</span>
                            ) : (
                              productIndex === 2 && sale.products.length > 2 ? (
                                <span>...</span>
                              ) : null
                            )}
                            {productIndex < sale.products.length - 1 ? <span>, </span> : null}
                          </span>
                        ))}
                      </td>
                      <td className="border">{sale.date}</td>
                      <td className="border">{sale.id.substring(0, 5)}{sale.id.length > 5 ? '...' : ''}</td>
                      <td className="border">{sale.saleId}</td>
                      <td className="border">{sale.customer.name}</td>
                      <td className="border">{sale.payment.method}</td>
                      {/* // For the Main Time */}
                      <td className="border">
                        {(sale.products.reduce((acc, product) => acc + parseFloat(product.price), 0) / 2).toFixed(2)}

                      </td>
                      <td className="border">
                        {sale.products.reduce((acc, product) => acc + parseFloat(product.price), 0)}
                      </td>
                      <td className="border">{sale.staff.name}</td>
                      <td className="border">{sale.payment.method}</td>
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





const renderStatCard = (title, value, color, icon) => (
  <div className={`flex-1 bg-${color}-500 text-white p-4 rounded-md flex flex-col items-center`}>
    <div className="text-lg font-bold mb-2">{title}</div>
    <div className="text-2xl font-bold flex items-center">
      {icon && <FontAwesomeIcon icon={icon} className="mr-2" />}
      {value}
    </div>
  </div>
);
export default SalesPage;
