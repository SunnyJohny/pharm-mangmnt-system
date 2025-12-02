import React, { useState } from 'react';
import { useMyContext } from '../Context/MyContext';
import { FaTrash, FaMinus, FaPlus } from 'react-icons/fa';
import { getFirestore, collection, addDoc, getDoc, Timestamp, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const db = getFirestore();
//testing
export const CartItem = ({ id, name, price, quantity }) => {
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

const OverallTotal = ({ total, onClearItems, onPrintReceipt, onPlaceOrder, selectedPaymentMethod, setSelectedPaymentMethod, isProcessing, userRole }) => (
  <div className="flex flex-col items-end mt-4">
    <p className="text-lg font-bold mb-2">Total: ₦{total}</p>
    {/* <select
      className="w-full sm:w-auto bg-white border border-gray-300 mb-4 rounded-md py-2 px-4 focus:outline-none focus:border-blue-500"
      value={selectedPaymentMethod}
      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
    >
      <option value="Cash">Cash</option>
      <option value="Credit">Credit</option>
      <option value="Cheque">Cheque</option>
      <option value="POS">POS</option>
      <option value="App Transfer">Transfer</option>
    </select> */}

    <div className="flex flex-wrap gap-4 justify-center sm:justify-end">
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
        onClick={userRole === 'cashier' ? onPrintReceipt : onPlaceOrder}
        disabled={isProcessing}
      >
        <span>{isProcessing ? 'Processing...' : (userRole === 'cashier' ? 'Print Receipt' : 'Order')}</span>
      </button>
      <button
        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
        onClick={onClearItems}
      >
        Clear
      </button>
    </div>
  </div>
);

const Cart = () => {
  const { state, clearCart } = useMyContext();
  const { selectedCompanyId } = state;
  // const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("Cash");
  // const [selectedCustomer, setSelectedCustomer] = useState("john");
  const [isProcessing, setIsProcessing] = useState(false);

  const { cart } = state;
  const overallTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

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
  
    // Split the number into whole and decimal (kobo) parts
    const [wholePart, koboPart] = num.toString().split('.');
  
    // Convert the whole part
    const wholePartWords = convertWholeNumber(Number(wholePart));
  
    // Convert the kobo part if it exists
    let koboWords = '';
    if (koboPart) {
      koboWords = `and ${convertWholeNumber(Number(koboPart))} Kobo`;
    }
  
    return `${wholePartWords} Naira ${koboWords}`.trim();
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

  const handlePrintReceipt = async () => {
    const receiptNumber = Math.floor(Math.random() * 1000000); // Generate a unique receipt number
    const transactionDateTime = new Date().toLocaleString();
    setIsProcessing(true);

    const totalInWords = numberToWords(overallTotal); // Convert total to words
    
    const salesDoc = {
        saleId: `sale_${receiptNumber}`,
        date: transactionDateTime,
        customer: {
            name: "Walk In Customer",
            email: 'customer@example.com',
        },
        products: cart.map((item) => ({
            productId: item.id,
            name: item.name,
            quantity: item.quantity,
            Amount: item.price * item.quantity,
            costPrice: item.costPrice * item.quantity,
        })),
        totalAmount: overallTotal,
        payment: {
            // method: selectedPaymentMethod,
        },
        staff: {
            staffId: state.user?.id || 'default_staff_id',
            name: state.user?.name || 'default_staff_name',
        },
    };

    try {
        const docRef = await addDoc(collection(db, `companies/${selectedCompanyId}/sales`), salesDoc);
        console.log('Receipt added to Firestore with ID:', docRef.id);

        await Promise.all(cart.map(async (item) => {
            await updateProductSale(item.id, item.quantity);
        }));
        toast.success('Sale added successfully!');
       
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
            <p>Attendant: ${state.user.name}</p>
            <hr>
            <h3>Receipt No.: ${receiptNumber}</h3> <!-- Display receipt number on the receipt -->
            <p>Date/Time: ${transactionDateTime}</p>
            <hr>
            <table style="width: 100%; text-align: left;">
                <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Price ( ₦ )</th>
                    <th>Total</th>
                </tr>
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
                Total: ₦ ${overallTotal.toFixed(2)}
            </p>
            <p style="text-align: center; font-style: italic;">
                Amount in Words: ${totalInWords} 
            </p>
            <p style="text-align: center;">Payment Method: <strong></strong></p>
            
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
        printWindow.print();
    } catch (error) {
        console.error('Error adding receipt to Firestore:', error);
        toast.error('Error processing sale. Please try again.');
    } finally {
        setIsProcessing(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      toast.warn("Your cart is empty. Add items before placing an order.");
      return;
    }
  
    setIsProcessing(true);
  
    const orderNumber = Math.floor(Math.random() * 1000000); // Generate a unique order number
    const transactionDateTime = new Date().toLocaleString();
  
    const order = {
      orderId: `order_${orderNumber}`,
      date: transactionDateTime,
      createdBy: state.user?.name|| 'default_sales_rep_id',
      assignedTo: 'cashier_id', // Replace with actual cashier's ID or keep null for unassigned orders
      status: 'pending',
      items: cart.map((item) => ({
        productId: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount: overallTotal,
      // paymentMethod: selectedPaymentMethod,
    };
  
    try {
      await addDoc(collection(db, `companies/${selectedCompanyId}/orders`), order);
      toast.success("Order placed successfully!");
      clearCart(); // Clear the sales rep's cart after placing the order
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };
  

  return (
    <div className=" bg-gray-50 shadow-md rounded-md">
    <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Sales Rep's Cart</h2>

      <div className="grid grid-cols-4 gap-2 sm:flex sm:justify-between mb-2 text-sm sm:text-base">
        <span className="font-bold text-center sm:text-left">Name</span>
        <span className="font-bold text-center sm:text-left">Amount (&#x20A6;)</span>
        <span className="font-bold text-center sm:text-left">Qty</span>
        <span className="font-bold text-center sm:text-left">Total (&#x20A6;)</span>
      </div>

      <div className="flex flex-col gap-4">
        {cart.map((item) => (
          <CartItem key={item.id} {...item} />
        ))}
      </div>
      <OverallTotal
        total={overallTotal}
        onClearItems={clearCart}
        onPrintReceipt={handlePrintReceipt}
        onPlaceOrder={handlePlaceOrder}
        // selectedPaymentMethod={selectedPaymentMethod}
        // setSelectedPaymentMethod={setSelectedPaymentMethod}
        isProcessing={isProcessing}
        userRole={state.user?.role || "cashier"}
      />
    </div>
  );
};

export default Cart;