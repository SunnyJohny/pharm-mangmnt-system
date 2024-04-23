import React, { useState } from 'react';
import { FaTrash, FaMinus, FaPlus } from 'react-icons/fa';

import { getFirestore, collection, addDoc, getDoc, Timestamp, doc, updateDoc, arrayUnion } from 'firebase/firestore';

import { useMyContext } from '../Context/MyContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CartItem = ({ id, name, price, quantity }) => {
  const { increaseQuantity, decreaseQuantity, removeFromCart, clearCart } = useMyContext();

  const handleIncreaseQuantity = () => {
    increaseQuantity(id);
  };

  const handleDecreaseQuantity = () => {
    decreaseQuantity(id);
  };

  const handleDeleteItem = () => {
    removeFromCart(id);
  };

  const handleClearCart = () => {
    clearCart();
  };

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex-1">
        <h3>{name}</h3>
      </div>
      <div className="flex items-center">
        <span className="mr-2">{price}</span>
        <FaMinus className="cursor-pointer text-sm" onClick={handleDecreaseQuantity} />
        <p className="mx-2">{quantity}</p>
        <FaPlus className="cursor-pointer text-sm" onClick={handleIncreaseQuantity} />
        <p className="ml-2">{price * quantity}</p>
        <FaTrash className="ml-4 cursor-pointer text-pink-500" onClick={handleDeleteItem} />
      </div>
    </div>
  );
};

const OverallTotal = ({ total, onClearItems, onPrintReceipt, selectedPaymentMethod, setSelectedPaymentMethod }) => (
  <div className="flex flex-col mt-4 items-end">
    <p className="text-lg font-bold mb-2   whitespace-nowrap">Total: ₦{total}</p>
    <select
        id="paymentMethod"
        className="bg-white border border-gray-300 mb-8 rounded-md py-2 px-4 focus:outline-none focus:border-blue-500"
        value={selectedPaymentMethod}
        onChange={(e) => setSelectedPaymentMethod(e.target.value)}
      >
        <option value="Cash">Cash</option>
        <option value="Credit">Credit</option> {/*Customer DEtails*/}
        <option value="Cheque">Cheque</option>  {/*Customer DEtails*/}
        <option value="POS">POS</option>   {/*Transaction Ref Number*/}
        <option value="App Transfer">Transfer</option> {/*Transaction Ref Number*/}
      </select>
    <div className="flex gap-4">
    <button className="bg-blue-500 text-white px-8 py-2 rounded-md cursor-pointer overflow-hidden whitespace-nowrap" onClick={onPrintReceipt}>
        Print Receipt
      </button>
     
      <button className="bg-red-500 text-white px-8 py-2 rounded-md overflow-hidden whitespace-nowrap" onClick={onClearItems}>
        Clear
      </button>
     
    </div>
  </div>
);

const Cart = () => {
  const { state, clearCart } = useMyContext();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("Cash");

  const { cart } = state;

  const overallTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleClearItems = () => {
    clearCart();
  };


  // Create a Firestore instance
  const db = getFirestore();

  // Function to update product sale information in the 'products' collection
  const updateProductSale = async (productId, quantitySold) => {
    try {
      const productRef = doc(db, 'products', productId);
  
      // Check if the product already exists in the collection
      const productDoc = await getDoc(productRef);
  
      if (productDoc.exists()) {
        // If the product exists, update the quantitySold field
        await updateDoc(productRef, {
          quantitySold: arrayUnion({
            quantitySold: quantitySold,
            timestamp: Timestamp.now(),
          }),
        }, { merge: true });
        console.log('Product sale updated successfully!');
      } else {
        // If the product doesn't exist, add a new document with the quantitySold field
        await addDoc(collection(db, 'products'), {
          productId: productId,
          quantitySold: [{
            quantitySold: quantitySold,
            timestamp: Timestamp.now(),
          }],
        });
        console.log('New product added to products collection!');
      }
    } catch (error) {
      console.error('Error updating product sale:', error.message);
      throw error;
    }
  };
  
  

  // Function to handle the printing of the receipt
 // Function to handle the printing of the receipt
const handlePrintReceipt = async () => {
  // Generate a unique receipt number
  const receiptNumber = Math.floor(Math.random() * 1000000);

  // Get the current date and time
  const transactionDateTime = new Date().toLocaleString();

  // Create a salesDoc object with dynamic values
  const salesDoc = {
    saleId: `sale_${receiptNumber}`,
    date: transactionDateTime,
    customer: {
      name: 'Customer Name',
      email: 'customer@example.com',
      // other customer details
    },
    products: cart.map((item) => ({
      productId: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      // other product details
    })),
    totalAmount: overallTotal,
    payment: {
      method: selectedPaymentMethod,
      // other payment details
    },
    staff: {
      staffId: 'staff_id_123',
      name: 'Staff Name',
      // other staff details
    },
  };

  try {
    // Add the document to the 'sales' collection
    const docRef = await addDoc(collection(db, 'sales'), salesDoc);
    toast.success('Sale added successfully!');
    console.log('Receipt added to Firestore with ID:', docRef.id);

    // Use Promise.all to wait for all updateProductSale promises to complete
    await Promise.all(cart.map(async (item) => {
      await updateProductSale(item.id, item.quantity);
    }));

    // Implement the logic to print the formatted receipt
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <!-- Add Xprinter ESC/POS commands for formatting -->
          <style>
            @media print {
              body {
                white-space: nowrap; /* Prevent line breaks */
              }
            }
          </style>
        </head>
        <body>
          <div style="text-align: center;">
            <h2>Your BENOKOSI PHARMACY LTD</h2>
            <p>Company Address</p>
            <p>Phone: Company Phone</p>
            <p>Email: company@email.com</p>
            <p>Attendant: John</p>

            <hr>
            <h3>Receipt No.: ${receiptNumber}</h3>
            <p>Date/Time: ${transactionDateTime}</p>
            <hr>
            <table style="width: 100%; text-align: left;">
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price ( ₦ )</th>
                <th>Total</th>
              </tr>
              <!-- Include cart items here with Xprinter formatting -->
              ${cart.map((item, index) => `
                <tr key=${index}>
                  <td>${item.name || 'N/A'}</td>
                  <td>${item.quantity || 'N/A'}</td>
                  <td>${(Number(item.price) && Number(item.quantity)) ? (Number(item.price) * Number(item.quantity)).toFixed(2) : 'N/A'}</td>
                  <td>${(Number(item.price) && Number(item.quantity)) ? (Number(item.price) * Number(item.quantity)).toFixed(2) : 'N/A'}</td>
                </tr>
              `).join('')}
            </table>
            <hr>
            <p style="text-align: center; font-weight: bold; margin-right: 12px;">
              Total: ₦ ${overallTotal}  <!-- Nigerian Naira sign -->
            </p>
            <p style="text-align: center;">Payment Method: <strong>${selectedPaymentMethod}</strong></p>
            <hr>
            <p style="font-style: italic; text-align: center;">Thanks for your patronage. Please call again!</p>
            <hr>
          </div>
          <p style="text-align: center;">Software Developer: <strong>PixelForge Technologies </strong></p>
          <p style="text-align: center;">Contact: <strong>08030611606, 08026511244.</strong></p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  } catch (error) {
    console.error('Error adding receipt to Firestore:', error);
  }
};


  return (
    <div className="bg-gray-200 p-2 w-1/4">
      <h2 className="text-2xl font-bold mb-4 flex justify-between">
        <span>Cart</span>
        <span>Total</span>
      </h2>
      {/* Header row */}
      <div className="flex justify-between">
        <span className="font-bold">Name</span>
        <span className="font-bold">Amount(&#x20A6;)</span>
        <span className="font-bold">Qty</span>
        <span className="font-bold">Total(&#x20A6;)</span>
      </div>
      <hr className="mb-4" />
      <hr className="my-4 border-t-2 border-white" />

      {cart.map((item) => (
        <CartItem
          key={item.id}
          id={item.id}
          name={item.name}
          price={item.price}
          quantity={item.quantity}
        />
      ))}

      <OverallTotal
        total={overallTotal}
        onClearItems={handleClearItems}
        onPrintReceipt={handlePrintReceipt}
        selectedPaymentMethod={selectedPaymentMethod}
        setSelectedPaymentMethod={setSelectedPaymentMethod}
      />
    </div>
  );
};

export default Cart;
