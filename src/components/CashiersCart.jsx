import React, { useEffect, useState } from "react";
import { doc, updateDoc, getFirestore, arrayUnion, addDoc, getDoc, collection, onSnapshot, Timestamp } from "firebase/firestore";
import { toast } from "react-toastify";
import { useMyContext } from '../Context/MyContext';
import { FaTrash, FaMinus, FaPlus } from 'react-icons/fa';

const db = getFirestore();

const CashiersCartItem = ({ id, name, price, quantity }) => {
  const { increaseQuantity, decreaseQuantity, removeFromCart } = useMyContext();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
      <div className="flex items-center justify-center gap-2">
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-sm font-medium">{name}</h3>
        </div>
        <span className="text-sm text-gray-600">₦{price}</span>
        <FaMinus
          className="cursor-pointer text-sm text-gray-500 hover:text-red-500"
          onClick={() => decreaseQuantity(id)}
        />
        <p className="text-sm mx-2">{quantity}</p>
        <FaPlus
          className="cursor-pointer text-sm text-gray-500 hover:text-green-500"
          onClick={() => increaseQuantity(id)}
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
  const { selectedCompanyId, user } = state;

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("Cash");
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingOrders, setPendingOrders] = useState([]);

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
      setPendingOrders(newOrders);
    });

    return () => unsubscribe();
  }, [selectedCompanyId]);

  // Calculate the total amount for the first pending order
  const overallTotal = pendingOrders.length ? pendingOrders[0].items.reduce((acc, item) => acc + item.price * item.quantity, 0) : 0;

  const handlePrintReceipt = async () => {
    if (!pendingOrders.length) {
      toast.warn("No pending orders to process.");
      return;
    }

    setIsProcessing(true);
    const orderToProcess = pendingOrders[0];
    const receiptNumber = Math.floor(Math.random() * 1000000);
    const transactionDateTime = new Date().toLocaleString();

    const totalInWords = numberToWords(overallTotal); // Convert total to words
    
    const salesDoc = {
      saleId: `sale_${receiptNumber}`,
      date: transactionDateTime,
      customer: {
        name: orderToProcess.customer?.name || "Walk-in Customer",
        email: orderToProcess.customer?.email || '',
      },
      products: orderToProcess.items.map((item) => ({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        Amount: item.price * item.quantity,
        costPrice: item.costPrice * item.quantity, // Assuming costPrice exists in order items
      })),
      totalAmount: orderToProcess.totalAmount,
      payment: {
        method: orderToProcess.paymentMethod,
      },
      staff: {
        staffId: user?.id || 'default_staff_id',
        name: user?.name || 'default_staff_name',
      },
    };

    try {
      const docRef = await addDoc(collection(db, `companies/${selectedCompanyId}/sales`), salesDoc);
      console.log('Receipt added to Firestore with ID:', docRef.id);

      await Promise.all(orderToProcess.items.map((item) => updateProductSale(item.productId, item.quantity)));
      
      // Update order status to "processed"
      const orderRef = doc(db, `companies/${selectedCompanyId}/orders`, orderToProcess.id);
      await updateDoc(orderRef, { status: "processed" });
      toast.success('Sale added successfully!');
      
      // Print receipt
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
        <p>Ordered By: ${orderToProcess.createdBy}</p>
        <p>Cashier: ${user.name}</p>
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
            ${orderToProcess.items.map((item, index) => `
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
      printWindow.focus();
      printWindow.print();
      printWindow.close();

    } catch (error) {
      console.error('Error adding receipt to Firestore:', error);
      toast.error('Error processing sale. Please try again.');
    } finally {
      setIsProcessing(false);
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
    <div className="w-full max-w-md mx-auto bg-white shadow-lg rounded-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Cashier's Cart</h2>

      <div className="divide-y divide-gray-300">
        {pendingOrders.length ? (
          pendingOrders[0].items.map((item) => (
            <CashiersCartItem key={item.productId} {...item} />
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
          <option value="Card">Card</option>
          <option value="Transfer">Transfer</option>
        </select>
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={clearCart}
          disabled={isProcessing}
          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 disabled:bg-gray-300"
        >
          Clear Cart
        </button>
        <button
          onClick={handlePrintReceipt}
          disabled={isProcessing}
          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:bg-gray-300"
        >
          {isProcessing ? "Processing..." : "Print Receipt"}
        </button>
      </div>
    </div>
  );
};

export default CashiersCart;