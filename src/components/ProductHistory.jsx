// ProductHistory.js
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
      setProductName(state.products.find((product) => product.id === productId)?.name || '');

      const salesHistory = productSales.map((sale) => ({
        date: sale.timestamp.toDate(),
        eventType: 'Sold',
        quantity: sale.quantitySold,
      }));

      const restocksHistory = productRestocks.map((restock) => ({
        date: restock.time.toDate(),
        eventType: 'Restocked',
        quantity: restock.quantity,
      }));

      const history = [...salesHistory, ...restocksHistory];

      history.sort((a, b) => a.date - b.date);

      setProductHistory(history);
    };

    getProductHistory();
  }, [productId, state.products, state.sales]);

  const totalRestocked = productHistory.reduce((sum, event) => (event.eventType === 'Restocked' ? sum + event.quantity : sum), 0);
  const totalSold = productHistory.reduce((sum, event) => (event.eventType === 'Sold' ? sum + event.quantity : sum), 0);
  const totalBalance = totalRestocked - totalSold;

  const totalPages = Math.ceil(productHistory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const itemsToDisplay = productHistory.slice(startIndex, endIndex);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
      <h2 style={{ fontSize: '1.5rem' }}>Product History for <strong>{productName}</strong></h2>
      <div style={{ width: '80%', maxWidth: '1200px', flex: '1', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Event Type</th>
              <th>Restocked</th>
              <th>Quantity Sold</th>

              <th>Stock Balance</th>
            </tr>
          </thead>
          <tbody>
            {itemsToDisplay.map((event, index) => {
              const isSold = event.eventType === 'Sold';
              const isRestocked = event.eventType === 'Restocked';
              const stockBalance = isRestocked
                ? event.quantity - (productHistory[index - 1]?.quantitySold || 0)
                : isSold
                ? -(event.quantity) // Quantity Sold is negative for balance calculation
                : 'N/A';

              return (
                <tr key={index}>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{event.date.toLocaleString()}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{event.eventType}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{isRestocked ? event.quantity : ''}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{isSold ? event.quantity : ''}</td>

                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>-</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="2"></td>
              <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>{totalRestocked}</td>

              <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>{totalSold}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>{totalBalance}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div style={{ marginTop: '20px' }}>
        <button
          style={{
            marginRight: '10px',
            padding: '10px',
            fontSize: '1rem',
            backgroundColor: '#e0e0e0',
            border: '1px solid #ccc',
            cursor: 'pointer',
          }}
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <button
          style={{
            padding: '10px',
            fontSize: '1rem',
            backgroundColor: '#e0e0e0',
            border: '1px solid #ccc',
            cursor: 'pointer',
          }}
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', width: '80%', maxWidth: '1200px' }}>
        <button
          style={{
            padding: '10px',
            fontSize: '1rem',
            backgroundColor: '#e0e0e0',
            border: '1px solid #ccc',
            cursor: 'pointer',
          }}
          onClick={() => console.log('Share/Export clicked')}
        >
          Share/Export
        </button>
        <button
          style={{
            padding: '10px',
            fontSize: '1rem',
            backgroundColor: '#e0e0e0',
            border: '1px solid #ccc',
            cursor: 'pointer',
          }}
          onClick={() => console.log('Print History clicked')}
        >
          Print History
        </button>
      </div>
    </div>
  );
};

export default ProductHistory;
