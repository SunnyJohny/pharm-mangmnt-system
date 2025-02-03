import React, { useEffect, useState, useRef } from "react";
import { doc, updateDoc, getFirestore, arrayUnion, addDoc, getDoc, collection, onSnapshot, Timestamp } from "firebase/firestore";
import { toast } from "react-toastify";
import { useMyContext } from '../Context/MyContext';
import { FaTrash, FaMinus, FaPlus } from 'react-icons/fa';

const db = getFirestore();

const CashiersCartItem = ({ id, name, price, quantity, pendingOrders }) => {
  const { increaseQuantity, decreaseQuantity, removeFromCart } = useMyContext();

  const handleIncreaseQuantity = () => {
    if (pendingOrders.length > 0) {
      toast.warn("Cannot add items directly to the cart when there are pending orders.");
      return;
    }
    increaseQuantity(id);
  };

  const handleDecreaseQuantity = () => {
    if (pendingOrders.length > 0) {
      toast.warn("Cannot modify items directly in the cart when there are pending orders.");
      return;
    }
    decreaseQuantity(id);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
      <div className="flex items-center justify-center gap-2">
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-sm font-medium">{name}</h3>
        </div>
        <span className="text-sm text-gray-600">₦{price}</span>
        <FaMinus
          className="cursor-pointer text-sm text-gray-500 hover:text-red-500"
          onClick={handleDecreaseQuantity}
        />
        <p className="text-sm mx-2">{quantity}</p>
        <FaPlus
          className="cursor-pointer text-sm text-gray-500 hover:text-green-500"
          onClick={handleIncreaseQuantity}
        />
        <p className="ml-4 text-sm">₦{price * quantity}</p>
        <FaTrash
          className="ml-4 cursor-pointer text-pink-500 hover:text-red-600"
          onClick={() => removeFromCart(id)}
        />
      </div>
    </div>
  );
};

const CashiersCart = () => {
  const { state, clearCart } = useMyContext();
  const { selectedCompanyId, user, cart } = state;

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("Cash");
  const [selectedSalesCategory, setSelectedSalesCategory] = useState("Wholesale");
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingOrders, setPendingOrders] = useState([]);

  // Flag to stop notification sound
  const [stopNotification, setStopNotification] = useState(false);

  // Use useRef for notificationSound
  const notificationSoundRef = useRef(new Audio('/sounds/Flavour-Power-To-Win-(TrendyBeatz.com).mp3'));

  // Set up Firestore real-time listener to get pending orders
  useEffect(() => {
    const q = collection(db, `companies/${selectedCompanyId}/orders`);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newOrders = [];
      snapshot.forEach((doc) => {
        const order = doc.data();
        // Filter for pending orders only
        if (order.status === "pending") {
          newOrders.push({ ...order, id: doc.id });
        }
      });
      // Sort orders by date to process the earliest first
      newOrders.sort((a, b) => new Date(a.date) - new Date(b.date));

      // Play notification sound if there are new pending orders and notification is not stopped
      if (newOrders.length > pendingOrders.length && !stopNotification) {
        notificationSoundRef.current.play().catch((error) => {
          console.error("Error playing notification sound:", error);
        });
      }

      setPendingOrders(newOrders);
    });

    return () => unsubscribe();
  }, [selectedCompanyId, pendingOrders.length, stopNotification]);

  // Calculate the total amount based on pendingOrders or cart items
  const overallTotal = pendingOrders.length 
    ? pendingOrders[0].items.reduce((acc, item) => acc + item.price * item.quantity, 0)
    : cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handlePrintReceipt = async () => {
    if (!pendingOrders.length) {
      if (cart.length > 0) {
        const proceed = window.confirm("No pending orders to process. Do you wish to proceed to print the items in the cart?");
        if (!proceed) {
          setIsProcessing(false);
          return;
        }
      } else {
        toast.warn("No pending orders or items in the cart to process.");
        setIsProcessing(false);
        return;
      }
    }

    setIsProcessing(true);
    setStopNotification(true); // Stop notification sound

    const orderToProcess = pendingOrders.length > 0 ? pendingOrders[0] : null;
    const receiptNumber = Math.floor(Math.random() * 1000000);
    const transactionDateTime = new Date().toLocaleString();
    

    const totalInWords = numberToWords(overallTotal); // Convert total to words

    const salesDoc = {
      saleId: `sale_${receiptNumber}`,
      date: transactionDateTime,
      customer: {
        name: orderToProcess?.customer?.name || "Walk-in Customer",
        email: orderToProcess?.customer?.email || '',
      },
      products: orderToProcess ? orderToProcess.items.map((item) => ({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        Amount: item.price * item.quantity,
        costPrice: item.costPrice * item.quantity, // Assuming costPrice exists in order items
      })) : cart.map((item) => ({
        productId: item.id,
        name: item.name,
        quantity: item.quantity,
        Amount: item.price * item.quantity,
        costPrice: item.costPrice * item.quantity,
      })),
      totalAmount: orderToProcess ? orderToProcess.totalAmount : overallTotal,
      payment: {
        method: selectedPaymentMethod, // Ensure the selected payment method is used
      },
      salesCategory: selectedSalesCategory, // Add sales category to the document
      staff: {
        staffId: user?.id || 'default_staff_id',
        name: user?.name || 'default_staff_name',
      },
    };

    try {
      const docRef = await addDoc(collection(db, `companies/${selectedCompanyId}/sales`), salesDoc);
      console.log('Receipt added to Firestore with ID:', docRef.id);

      if (orderToProcess) {
        await Promise.all(orderToProcess.items.map((item) => updateProductSale(item.productId, item.quantity)));

        // Update order status to "processed"
        const orderRef = doc(db, `companies/${selectedCompanyId}/orders`, orderToProcess.id);
        await updateDoc(orderRef, { status: "processed" });
      } else {
        await Promise.all(cart.map((item) => updateProductSale(item.id, item.quantity)));
      }

      toast.success('Sale added successfully!');

      // Print receipt
      const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        });
      };
      const printWindow = window.open('', '_blank');
      
      printWindow.document.write(`
        <html>
        <head>
        <style>
        @media print {
          body {
            white-space: nowrap;
          }
        }
        </style>
        </head>
        <body>
        <div style="text-align: center;">
        <h2>${state.selectedCompanyName}</h2>
        <p>Address:${state.selectedCompanyAddress}</p>
        <p>Phone: ${state.selectedCompanyPhoneNumber}</p>
        <p>Email: ${state.selectedCompanyEmail}</p>
        <p>Ordered By: ${orderToProcess?.createdBy || user?.name}</p>
        <p>Cashier: ${user.name}</p>
        <hr>
        <h3>Receipt No.: ${receiptNumber}</h3>
        <p>Date/Time: ${formatDate(transactionDateTime)}</p>
        <hr>
        <table style="width: 100%; text-align: left;">
            <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price ( ₦ )</th>
                <th>Total</th>
            </tr>
            ${(orderToProcess ? orderToProcess.items : cart).map((item, index) => `
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
            Total: ₦ ${overallTotal.toFixed(2)}
        </p>
        <p style="text-align: center; font-style: italic;">
            Amount in Words: ${totalInWords} 
        </p>
        <p style="text-align: center;">Payment Method: <strong>${selectedPaymentMethod}</strong></p>
        <p style="text-align: center;">Sales Category: <strong>${selectedSalesCategory}</strong></p>
        <hr>
        <p style="font-style: italic; text-align: center;">Thanks for your patronage. Please call again!</p>
        <hr>
        </div>
        <p style="text-align: center;">Software Developer: <strong>PixelForge Technologies</strong></p>
        <p style="text-align: center;">Contact: <strong>08030611606, 08026511244.</strong></p>
        </body>
        </html>
      `);

      printWindow.document.close();
      // printWindow.focus();
      printWindow.print();
      // printWindow.close();

      // Clear the cart after printing the receipt
      clearCart();
    } catch (error) {
      console.error('Error adding receipt to Firestore:', error);
      toast.error('Error processing sale. Please try again.');
    } finally {
      setIsProcessing(false);
      setStopNotification(false); // Allow notification sound again after processing
    }
  };

  const updateProductSale = async (productId, quantitySold) => {
    try {
      const productRef = doc(db, `companies/${selectedCompanyId}/products`, productId);
      const productDoc = await getDoc(productRef);

      if (productDoc.exists()) {
        await updateDoc(productRef, {
          quantitySold: arrayUnion({
            quantitySold: quantitySold,
            timestamp: Timestamp.now(),
          }),
        });
        console.log('Product sale updated successfully!');
      } else {
        await addDoc(collection(db, `companies/${selectedCompanyId}/products`), {
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

  const numberToWords = (num) => {
    const a = [
      "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
      "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
    ];
    const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    const convertWholeNumber = (num) => {
      if (num < 20) return a[num];
      if (num < 100) return b[Math.floor(num / 10)] + " " + a[num % 10];
      if (num < 1000) return a[Math.floor(num / 100)] + " Hundred " + convertWholeNumber(num % 100);
      if (num < 1000000) return convertWholeNumber(Math.floor(num / 1000)) + " Thousand " + convertWholeNumber(num % 1000);

      return "Amount too large";
    };

    const [wholePart, koboPart] = num.toString().split('.');
    const wholePartWords = convertWholeNumber(Number(wholePart));
    let koboWords = '';
    if (koboPart) {
      koboWords = `and ${convertWholeNumber(Number(koboPart))} Kobo`;
    }

    return `${wholePartWords} Naira ${koboWords}`.trim();
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white shadow-lg rounded-md ">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Cashier's Cart</h2>
      <div className="grid grid-cols-4 gap-2 sm:flex sm:justify-between mb-2 text-sm sm:text-base">
        <span className="font-bold text-center sm:text-left">Name</span>
        <span className="font-bold text-center sm:text-left">Amount (&#x20A6;)</span>
        <span className="font-bold text-center sm:text-left">Qty</span>
        <span className="font-bold text-center sm:text-left">Total (&#x20A6;)</span>
      </div>

      <div className="divide-y divide-gray-300">
        {pendingOrders.length ? (
          pendingOrders[0].items.map((item) => (
            <CashiersCartItem key={item.productId} {...item} pendingOrders={pendingOrders} />
          ))
        ) : (
          <p className="text-center text-gray-500">No pending orders</p>
        )}
      </div>
      <div className="divide-y divide-gray-300">
        {cart.length ? (
          cart.map((item) => (
            <CashiersCartItem key={item.id} {...item} pendingOrders={pendingOrders} />
          ))
        ) : (
          <p className="text-center text-gray-500">Cart is empty</p>
        )}
      </div>

      <div className="flex justify-between mt-4">
        <span className="font-bold">Total:</span>
        <span className="font-bold text-lg">₦{overallTotal.toFixed(2)}</span>
      </div>

      <div className="mt-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Payment Method:</label>
        <select
          className="w-full border rounded-md p-2"
          value={selectedPaymentMethod}
          onChange={(e) => setSelectedPaymentMethod(e.target.value)}
        >
          <option value="Cash">Cash</option>
          <option value="Transfer">Transfer</option>
          <option value="POS">POS</option>
        </select>
      </div>

      <div className="mt-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Sales Category:</label>
        <select
          className="w-full border rounded-md p-2"
          value={selectedSalesCategory}
          onChange={(e) => setSelectedSalesCategory(e.target.value)}
        >
          <option value="Wholesale">Wholesale</option>
          <option value="Retail">Retail</option>
          <option value="Easy Buy">Easy Buy</option>
        </select>
      </div>

      <div className="flex justify-between mt-6 space-x-4">
  <button
    onClick={clearCart}
    disabled={isProcessing}
    className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 disabled:bg-gray-300"
  >
    Clear Cart
  </button>
  <button
    onClick={handlePrintReceipt}
    disabled={isProcessing}
    className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 disabled:bg-gray-300"
  >
    {isProcessing ? "Processing..." : "Print Receipt"}
  </button>
</div>
    </div>
  );
};

export default CashiersCart;