

import {  useNavigate } from 'react-router-dom';


import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendar } from 'react-icons/fa';
import { useMyContext } from '../Context/MyContext';
import InventorySidePanel from '../components/InventorySidePanel';

// import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ProductsPageSidePanel from '../components/ProductsPagesidePanel';
import { useCallback, useEffect, useRef, useState, } from 'react';
import EditPopup from '../components/EditPopup';



const InventoryPage = () => {
  const { state } = useMyContext(); // Destructure fetchProduct from the context
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(100);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [filteredItems, setFilteredItems] = useState([]);
  const [totalStoreValue, setTotalStoreValue] = useState(0);
  const [firstRestockDates, setFirstRestockDates] = useState({});
  const [allPagesContent, setAllPagesContent] = useState(1);

  const [showEditPop, setShowEditPop] = useState(false); // State to control the visibility of EditPop
  const [selectedProduct, setSelectedProduct] = useState(null); // State to hold the selected product for editing
  const navigate = useNavigate();
  const tableRef = useRef(null);

if(allPagesContent){

}
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
  
  
  const searchItems = (e) => {
    let searchText = '';

    if (e && e.target && e.target.value) {
      searchText = e.target.value.toLowerCase();
    }

    const filteredByKeyword = searchInventoryByKeyword(state.products, searchText);
    const filteredByDate = searchByDate(filteredByKeyword, fromDate, toDate);

    setFilteredItems(filteredByDate);
    calculateTotalStoreValue(filteredByDate);
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

  const searchInventoryByKeyword = (items, searchText) => {
    return items.filter((item) => item.name.toLowerCase().includes(searchText));
  };

  const searchByDate = (items, startDate, endDate) => {
    return items.filter((item) => {
      const productDate = new Date(firstRestockDates[item.name]);
      return productDate >= startDate && productDate <= endDate;
    });
  };

  const handleFromDateChange = (date) => {
    setFromDate(date);
    searchItems();
  };

  const handleToDateChange = (date) => {
    setToDate(date);
    searchItems();
  };

  const generateSn = (index) => index + 1;

  const handleRowClick = (itemId) => {
    navigate(`/product-details/${itemId}`);
  };

  const renderActionButtons = () => {
    // InventoryPage.jsx
    const handlePrintInventory = async () => {
      const tableContainer = tableRef.current;

      if (tableContainer) {
        const printWindow = window.open('', '_blank');
        printWindow.document.write('<html><head><title>Inventory Table</title>');
        // Add custom CSS for printing
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
        printWindow.document.write('}');
        printWindow.document.write('</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(tableContainer.outerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
      } else {
        console.error('Table container not found.');
      }
    };
    





    return (
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded-md"
        onClick={handlePrintInventory}


      >
        Print Inventory
      </button>
    );
  };

  useEffect(() => {
    const capturePagesContent = async () => {
      const pagesContent = [];
      const tableContainer = document.querySelector('.table-container');
      const itemsPerPage = 100;

      if (tableContainer) {
        const totalItems = filteredItems.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);

        for (let page = 1; page <= totalPages; page++) {
          const startIndex = (page - 1) * itemsPerPage;
          const endIndex = startIndex + itemsPerPage;
          const itemsToDisplay = filteredItems.slice(startIndex, endIndex);

          await new Promise((resolve) => setTimeout(resolve, 1000));

          const canvas = await html2canvas(tableContainer);
          pagesContent.push(canvas.toDataURL('image/png'));
        }

        setAllPagesContent(pagesContent);
      }
    };

    capturePagesContent();
  }, [filteredItems]);

  
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



  const handleEditClick = (itemId, e) => {
    // Prevent propagation to avoid triggering row click
    e.stopPropagation();

    console.log('Edit clicked for item ID:', itemId);

    const productToEdit = filteredItems.find((product) => product.id === itemId);
    setSelectedProduct(productToEdit);
    setShowEditPop(true);
  };



  return (
    <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
    {/* Toggle Button for Side Panel */}
      <div className="flex-none">
        {/* Render InventorySidePanel if user exists and role is admin, otherwise render ProductsPagesidePanel */}
        {state.user && state.user.role === 'admin' ? <InventorySidePanel /> : <ProductsPageSidePanel />}
      </div>

      <div className="ml-8 flex-1">
        <div className="mb-8 p-2">
          <h2 className="text-2xl font-bold">Inventory Stats</h2>
          <div className="flex mt-4 space-x-4">
            {renderStatCard('Total Products', totalItems.toString(), 'blue')}
            {renderStatCard('Total Store Value', `₦${totalStoreValue}`, 'pink')}
            {renderStatCard(
              'Out Of Stock',
              filteredItems.filter(
                (item) => (state.productTotals.get(item.name) || 0) - (state.productTotalsMap.get(item.name) || 0) === 0
              ).length.toString(),
              'red'
            )}
            {renderStatCard('All Categories', '2', 'blue')}


          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Inventory Items</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="text-lg">Inventory by Date</div>
              <div className="relative">
                <DatePicker
                  selected={fromDate}
                  onChange={handleFromDateChange}
                  dateFormat="dd-MM-yyyy"
                  placeholderText="From"
                  className="border border-gray-300 rounded-md p-2 pl-2 cursor-pointer"
                />
                <FaCalendar className="absolute top-3 right-2  text-gray-400 pointer-events-none" />
              </div>
              <div className="relative">
                <DatePicker
                  selected={toDate}
                  onChange={handleToDateChange}
                  dateFormat="dd-MM-yyyy"
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
              onChange={searchItems}
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
                  <th className="border">Name</th>
                  <th className="border">Date</th>
                  <th className="border">Item ID</th>
                  <th className="border">Qty Restocked</th>
                  <th className="border">Total Bal</th>
                  <th className="border">Qty Sold</th>
                  <th className="border">Qty Balance</th>
                  <th className="border">M.Unit</th>

                  <th className="border">CostPrice</th>
                  <th className="border">Sales Price</th>
                  <th className="border">Item Value</th>


                  <th className="border">
                    {state.user && state.user.role === 'admin' ? (
                      <>
                        Action
                      </>
                    ) : null}
                  </th>

                </tr>
              </thead>
              <tbody>
                {itemsToDisplay.map((item) => (
                  <tr
                    
                    key={item.id} // Add a unique key based on the item's identifier
                    onClick={() => handleRowClick(item.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td className="border">{generateSn(itemsToDisplay.indexOf(item))}</td>
                    <td className="border">{item.name}</td>
                    <td className="border">{firstRestockDates[item.name]?.toLocaleDateString()}</td>
                    <td className="border">{item.id.slice(0, 3) + (item.id.length > 3 ? '...' : '')}</td>
                    <td className="border">{state.productTotals.get(item.name) || 0}</td>
                    <td className="border">{state.productTotals.get(item.name) || 0}</td>
                    <td className="border">{state.productTotalsMap.get(item.name) || 0}</td>
                    <td className="border">
                      {(
                        (state.productTotals.get(item.name) || 0) -
                        (state.productTotalsMap.get(item.name) || 0)
                      )}
                    </td>
                    <td className="border">
                      Piece
                    </td>
                    <td className="border">{Number(item.costPrice).toFixed(2)}</td>
                    <td className="border">{Number(item.price).toFixed(2)}</td>

                    <td className="border">
                      {(
                        item.price *
                        ((state.productTotals.get(item.name) || 0) -
                          (state.productTotalsMap.get(item.name) || 0))
                      ).toFixed(2)}
                    </td>
                    <td className="border">
                      {state.user && state.user.role === 'admin' ? (
                        <>
                          <FontAwesomeIcon
                            icon={faEdit}
                            style={{ cursor: 'pointer', marginRight: '8px', color: 'blue' }}
                            onClick={(e) => handleEditClick(item.id, e)}
                          />


                          <FontAwesomeIcon
                            icon={faTrash}
                            style={{ cursor: 'pointer', color: 'red' }}
                          />
                        </>
                      ) : null}
                    </td>


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

      {/* EditPop Component */}
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
  );
};

const renderStatCard = (title, value, color) => (
  <div className={`flex-1 bg-${color}-500 text-white p-4 rounded-md`}>
    <div className="text-sm">{title}</div>
    <div className="text-2xl font-bold">{value}</div>
  </div>
);

export default InventoryPage;
