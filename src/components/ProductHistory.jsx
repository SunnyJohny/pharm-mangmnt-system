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
        quantity: Number(sale.quantitySold),
      }));

      const restocksHistory = productRestocks.map((restock) => ({
        date: restock.time.toDate(),
        eventType: 'Restocked',
        quantity: Number(restock.quantity),
        receiptNumber: restock.receiptNumber || 'N/A',
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

  const handlePrevClick = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextClick = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePrintClick = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Product History</title>');
    printWindow.document.write('</head><body>');
  
    // Append the table content to the new window
    printWindow.document.write('<table style="width:100%; border-collapse: collapse;">');
    printWindow.document.write('<thead><tr><th>Date</th><th>Event Type</th><th>Restocked</th><th>Quantity Sold</th><th>Stock Balance</th><th>Receipt Number</th></tr></thead>');
    printWindow.document.write('<tbody>');
  
    // Append each row of the table
    productHistory.forEach((event, index) => {
      const isSold = event.eventType === 'Sold';
      const isRestocked = event.eventType === 'Restocked';
      const stockBalance = isRestocked
        ? event.quantity - (productHistory[index - 1]?.quantitySold || 0)
        : isSold
        ? -(event.quantity)
        : 'N/A';
  
      printWindow.document.write(`<tr><td>${event.date.toLocaleString()}</td><td>${event.eventType}</td><td>${isRestocked ? event.quantity : ''}</td><td>${isSold ? event.quantity : ''}</td><td>${stockBalance}</td><td>${event.receiptNumber}</td></tr>`);
    });
  
    // Append the footer with totals
    printWindow.document.write('<tfoot><tr>');
    printWindow.document.write(`<td colspan="2" style="font-weight: bold; font-family: Arial, sans-serif;">Total</td>`);
    printWindow.document.write(`<td style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold;">${totalRestocked}</td>`);
    printWindow.document.write(`<td style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold;">${totalSold}</td>`);
    printWindow.document.write(`<td style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold;">${totalBalance}</td>`);
    printWindow.document.write('</tr></tfoot>');
  
    // Close the HTML tags
    printWindow.document.write('</tbody></table></body></html>');
  
    // Trigger the print dialog
    printWindow.document.close();
    printWindow.print();
    printWindow.onafterprint = () => {
      // Close the print window after printing
      printWindow.close();
    };
  };
  
  

  const handleShareExportClick = () => {
    // Implement your share/export logic here
  
    // For example, you might use a library like FileSaver.js to save a file with the exported data.
    // This is just a placeholder, and you need to replace it with your actual implementation.
  
    // For demonstration purposes, let's create a CSV file and download it.
    const csvContent = productHistory.map((event) => `${event.date},${event.eventType},${event.quantity},${event.receiptNumber}`).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
  
    if (navigator.msSaveBlob) {
      // For IE and Edge
      navigator.msSaveBlob(blob, 'product_history.csv');
    } else {
      // For other browsers
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = 'product_history.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
      <h2 style={{ fontSize: '1.5rem' }}>Product History for <strong>{productName}</strong></h2>
      <div style={{ width: '80%', maxWidth: '1200px', flex: '1', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr>
              <th>S/n</th>
              <th>Date</th>
              <th>Event Type</th>
              <th>Restocked</th>
              <th>Quantity Sold</th>
              <th>Stock Balance</th>
              <th>Receipt Number</th>
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
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{index + 1}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{event.date.toLocaleString()}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{event.eventType}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{isRestocked ? event.quantity : ''}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{isSold ? event.quantity : ''}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>-</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{event.receiptNumber}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="3" style={{ fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>Total</td>
              <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', fontWeight: 'bold'
              }}>{totalRestocked}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>{totalSold}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>{totalBalance}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', width: '100%', padding: '0 20px', boxSizing: 'border-box' }}>
        <div
          style={{
            padding: '10px',
            fontSize: '1rem',
            backgroundColor: '#e0e0e0',
            border: '1px solid #ccc',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
          onClick={handlePrevClick}
          disabled={currentPage === 1}
        >
          &#8592; Previous
        </div>
        <div
          style={{
            padding: '10px',
            fontSize: '1rem',
            backgroundColor: '#e0e0e0',
            border: '1px solid #ccc',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
          onClick={handleShareExportClick}
        >
          Share/Export
        </div>
        <div
          style={{
            padding: '10px',
            fontSize: '1rem',
            backgroundColor: '#e0e0e0',
            border: '1px solid #ccc',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
          onClick={handlePrintClick}
        >
          Print History
        </div>
        <div
          style={{
            padding: '10px',
            fontSize: '1rem',
            backgroundColor: '#e0e0e0',
            border: '1px solid #ccc',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
          onClick={handleNextClick}
          disabled={currentPage === totalPages}
        >
          Next &#8594;
        </div>
      </div>
    </div>
  );
};

export default ProductHistory;
