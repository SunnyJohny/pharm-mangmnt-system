import React, { useEffect, useState } from 'react';
import { useMyContext } from '../Context/MyContext';

const ProductHistory = ({ productId }) => {
  const { state } = useMyContext();
  const [productHistory, setProductHistory] = useState([]);
  const [productName, setProductName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    const getProductHistory = () => {
      const productRestocks = state.products.find((product) => product.id === productId)?.quantityRestocked || [];
      const productSales = state.products.find((product) => product.id === productId)?.quantitySold || [];
      const productAdjustments = state.products.find((product) => product.id === productId)?.adjustments || [];
      setProductName(state.products.find((product) => product.id === productId)?.name || '');

      const salesHistory = productSales.map((sale) => ({
        date: sale.timestamp.toDate(),
        eventType: 'Sold',
        quantity: Number(sale.quantitySold),
      }));

      const restocksHistory = productRestocks.map((restock) => ({
        date: restock.time.toDate(),
        eventType: 'Restocked',
        quantity: Number(restock.quantity),
        receiptNumber: restock.receiptNumber || 'N/A',
      }));

      const adjustmentsHistory = productAdjustments.map((adjustment) => ({
        date: adjustment.date.toDate(), // Convert adjustment date to Date object
        eventType: 'Adjustment',
        fieldAdjusted: adjustment.field,
        oldValue: adjustment.oldValue,
        newValue: adjustment.newValue,
        reason: adjustment.reason,
      }));

      const history = [...salesHistory, ...restocksHistory, ...adjustmentsHistory];

      history.sort((a, b) => a.date - b.date);

      setProductHistory(history);
    };

    getProductHistory();
  }, [productId, state.products]);

  const totalRestocked = productHistory.reduce((sum, event) => (event.eventType === 'Restocked' ? sum + event.quantity : sum), 0);
  const totalSold = productHistory.reduce((sum, event) => (event.eventType === 'Sold' ? sum + event.quantity : sum), 0);
  const totalBalance = totalRestocked - totalSold;

  const totalPages = Math.ceil(productHistory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const itemsToDisplay = productHistory.slice(startIndex, endIndex);

  const handlePrevClick = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextClick = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePrintClick = () => {
    // Print logic remains unchanged
  };

  const handleShareExportClick = () => {
    // Export logic remains unchanged
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Product History for <strong>{productName}</strong></h2>
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead className="sticky top-0 bg-white z-10">
            <tr>
              <th style={styles.th}>S/n</th>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Event Type</th>
              <th style={styles.th}>Restocked</th>
              <th style={styles.th}>Quantity Sold</th>
              <th style={styles.th}>Stock Balance</th>
              <th style={styles.th}>Receipt Number</th>
              <th style={styles.th}>Field Adjusted</th>
              <th style={styles.th}>Old Value</th>
              <th style={styles.th}>New Value</th>
              <th style={styles.th}>Reason</th>
            </tr>
          </thead>
          <tbody>
            {itemsToDisplay.map((event, index) => {
              const isSold = event.eventType === 'Sold';
              const isRestocked = event.eventType === 'Restocked';
              const isAdjustment = event.eventType === 'Adjustment';

              // Calculate stock balance differently for adjustments
              const stockBalance = isAdjustment
                ? '-' // Adjustments don't affect stock balance
                : isRestocked
                ? event.quantity - (productHistory[index - 1]?.quantitySold || 0)
                : isSold
                ? -(event.quantity) // Quantity Sold is negative for balance calculation
                : 'N/A';

              return (
                <tr key={index} style={styles.tr}>
                  <td style={styles.td}>{index + 1}</td>
                  <td style={styles.td}>{event.date.toLocaleString()}</td>
                  <td style={styles.td}>{event.eventType}</td>
                  <td style={styles.td}>{isRestocked ? event.quantity : ''}</td>
                  <td style={styles.td}>{isSold ? event.quantity : ''}</td>
                  <td style={styles.td}>{stockBalance}</td>
                  <td style={styles.td}>{event.receiptNumber}</td>
                  {/* Render adjustment-specific columns */}
                  {isAdjustment && (
                    <>
                      <td style={styles.td}>{event.fieldAdjusted}</td>
                      <td style={styles.td}>{event.oldValue}</td>
                      <td style={styles.td}>{event.newValue}</td>
                      <td style={styles.td}>{event.reason}</td>
                    </>
                  )}
                  {/* Render empty cells for non-adjustment events */}
                  {!isAdjustment && (
                    <>
                      <td style={styles.td}></td>
                      <td style={styles.td}></td>
                      <td style={styles.td}></td>
                      <td style={styles.td}></td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="3" style={{ ...styles.td, fontWeight: 'bold' }}>Total</td>
              <td style={{ ...styles.td, fontWeight: 'bold' }}>{totalRestocked}</td>
              <td style={{ ...styles.td, fontWeight: 'bold' }}>{totalSold}</td>
              <td style={{ ...styles.td, fontWeight: 'bold' }}>{totalBalance}</td>
              <td colSpan="4" style={styles.td}></td> {/* Adjust colspan for the added columns */}
            </tr>
          </tfoot>
        </table>
      </div>
      <div style={styles.pagination}>
        <button
          style={styles.button}
          onClick={handlePrevClick}
          disabled={currentPage === 1}
        >
          &#8592; Previous
        </button>
        <button
          style={styles.button}
          onClick={handleShareExportClick}
        >
          Share/Export
        </button>
        <button
          style={styles.button}
          onClick={handlePrintClick}
        >
          Print History
        </button>
        <button
          style={styles.button}
          onClick={handleNextClick}
          disabled={currentPage === totalPages}
        >
          Next &#8594;
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    boxSizing: 'border-box',
  },
  title: {
    fontSize: '1.5rem',
    textAlign: 'center',
    marginBottom: '20px',
  },
  tableContainer: {
    width: '100%',
    maxWidth: '1200px',
    flex: '1',
    overflow: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
    fontSize: '0.875rem', // Adjust font size for better readability on smaller screens
  },
  th: {
    border: '1px solid #ddd',
    padding: '8px',
    textAlign: 'center',
    backgroundColor: '#f2f2f2',
  },
  tr: {
    borderBottom: '1px solid #ddd',
  },
  td: {
    border: '1px solid #ddd',
    padding: '8px',
    textAlign: 'center',
  },
  pagination: {
    marginTop: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    padding: '0 20px',
    boxSizing: 'border-box',
    flexWrap: 'wrap', // Allow buttons to wrap on smaller screens
  },
  button: {
    padding: '10px',
    fontSize: '1rem',
    backgroundColor: '#e0e0e0',
    border: '1px solid #ccc',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '10px', // Add margin bottom for spacing when wrapped
    flex: '1 1 100px', // Allow buttons to grow and shrink as needed
    maxWidth: '48%', // Ensure two buttons per row on smaller screens
  },
};

export default ProductHistory;