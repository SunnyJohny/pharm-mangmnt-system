import React, { useEffect, useState } from 'react';
import { useMyContext } from '../Context/MyContext';

const ReceiptModal = ({ saleInfo, onClose, user }) => {
  const { state } = useMyContext();
  const [selectedSale, setSelectedSale] = useState(null);

  useEffect(() => {
    setSelectedSale(saleInfo);
  }, [saleInfo]);

  // Log the user object to the console
  console.log('User Object:', state.user);

  if (!selectedSale) {
    return null; // Add a check and handle case where selectedSale is null
  }

  const {
    id,
    date,
    // saleId,
    // customer,
    payment,
    staff,
    products,
  } = selectedSale;

  // Add checks for properties that might be undefined
  const receiptNumber = id || 'N/A';
  const transactionDateTime = date || 'N/A';
  const cart = products || [];
  const overallTotal = cart.reduce((total, item) => total + ((item.price || 0) * (item.quantity || 0)), 0); // Ensure item.price and item.quantity are valid numbers
  const selectedPaymentMethod = payment ? payment.method : 'N/A';
  const attendantName = staff ? staff : 'N/A';
  const handlePrint = () => {
    window.print();
    console.log('printing...');
  };

  return (
    <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full">
        <div className="p-4">
          <h2 className="text-2xl font-bold text-center mb-4">BENOKOSI PHARMACY LTD</h2>
          <p className="text-center">No. 13...Enugu State</p>
          <p className="text-center">Phone: 08033821417</p>
          <p className="text-center">Email: company@email.com</p>
          <p className="text-center">Attendant: {attendantName.name || 'N/A'}</p>


          <hr className="my-4" />
          <h3 className="text-xl text-center mb-2">Receipt No.: {receiptNumber}</h3>
          <p className="text-center">Date/Time: {transactionDateTime}</p>
          <hr className="my-4" />
          <table className="w-full text-left">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price (₦)</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item, index) => (
                <tr key={index}>
                  <td>{item.name || 'N/A'}</td>
                  <td>{item.quantity || 'N/A'}</td>
                  <td>{(item.price || 0) * (item.quantity || 0)}</td> {/* Ensure price and quantity are valid numbers */}
                </tr>
              ))}
            </tbody>
          </table>
          <hr className="my-4" />
          <p className="font-bold text-lg text-center mb-2">Total: ₦{overallTotal.toFixed(2)}</p>
          <p className="text-center">Payment Method: <strong>{selectedPaymentMethod}</strong></p>
          <hr className="my-4" />
          <p className="italic text-center">Thanks for your patronage. Please call again!</p>
          <hr className="my-4" />
          <p className="text-center">Software Developer: <strong>PixelForge Technologies</strong></p>
          <p className="text-center">Contact: <strong>08030611606, 08026511244.</strong></p>
        </div>

        <div className="flex justify-center space-x-4 mb-4">
          <button
            onClick={onClose}
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            Close Modal
          </button>

          <button
            onClick={handlePrint}
            className="bg-blue-500 text-white px-4 py-2 rounded-md mt-4"
          >
            Print
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
