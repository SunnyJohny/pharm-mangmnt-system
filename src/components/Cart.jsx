import React, { useEffect, useState } from 'react';
import { useMyContext } from '../Context/MyContext';
import { FaTrash, FaMinus, FaPlus } from 'react-icons/fa';
import { getFirestore, collection, addDoc, getDoc, Timestamp, doc, updateDoc, arrayUnion, getDocs } from 'firebase/firestore';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { db } from '../firebase';

const CartItem = ({ id, name, price, quantity }) => {
  const { increaseQuantity, decreaseQuantity, removeFromCart } = useMyContext();

  const handleIncreaseQuantity = () => {
    increaseQuantity(id);
  };

  const handleDecreaseQuantity = () => {
    decreaseQuantity(id);
  };

  const handleDeleteItem = () => {
    removeFromCart(id);
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





const OverallTotal = ({
  total,
  onClearItems,
  onPrintReceipt,
  selectedPaymentMethod,
  isProcessing,
  setSelectedPaymentMethod,
}) => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [newCustomer, setNewCustomer] = useState("");
  const { state } = useMyContext();
  const { selectedCompanyId } = state;

  // Fetch customers from Firestore
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const customerSnapshot = await getDocs(
          collection(db, `companies/${selectedCompanyId}/customers`)
        );
        const customerList = customerSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCustomers(customerList);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };
  
    if (selectedCompanyId) {
      fetchCustomers();
    }
  }, [selectedCompanyId]); // Trigger the fetch whenever selectedCompanyId changes
  

  // Handle adding new customer
  const handleAddNewCustomer = async () => {
    if (newCustomer.trim() === "") {
      alert("Customer name cannot be empty.");
      return;
    }
  
    try {
      const newCustomerRef = await addDoc(
        collection(db, `companies/${selectedCompanyId}/customers`), // Add to the correct company
        {
          name: newCustomer.trim(),
          createdAt: new Date().toISOString(),
        }
      );
      setCustomers((prev) => [
        ...prev,
        { id: newCustomerRef.id, name: newCustomer.trim() },
      ]);
      setSelectedCustomer(newCustomerRef.id); // Set the new customer as selected
      setNewCustomer(""); // Clear the input
    } catch (error) {
      console.error("Error adding new customer:", error);
    }
  };
  

  return (
    <div className="flex flex-col mt-4 items-end">
      <p className="text-lg font-bold mb-2 whitespace-nowrap">
        Total: ₦{total}
      </p>
      {/* Payment Method Dropdown */}
      <select
        id="paymentMethod"
        className="bg-white border border-gray-300 mb-4 rounded-md py-2 px-4 focus:outline-none focus:border-blue-500"
        value={selectedPaymentMethod}
        onChange={(e) => setSelectedPaymentMethod(e.target.value)}
      >
        <option value="Cash">Cash</option>
        <option value="Credit">Credit</option>
        <option value="Cheque">Cheque</option>
        <option value="POS">POS</option>
        <option value="App Transfer">Transfer</option>
      </select>

      {/* Customer Dropdown */}
      <div className="w-full flex flex-col mb-8">
        <label htmlFor="customer" className="text-gray-700 font-semibold mb-2">
          Customer
        </label>
        <select
          id="customer"
          className="bg-white border border-gray-300 rounded-md py-2 px-4 mb-2 focus:outline-none focus:border-blue-500"
          value={selectedCustomer}
          onChange={(e) => setSelectedCustomer(e.target.value)}
        >
          <option value="">Select Customer</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name}
            </option>
          ))}
        </select>

        {/* Add New Customer Input */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add New Customer"
            value={newCustomer}
            onChange={(e) => setNewCustomer(e.target.value)}
            className="flex-1 bg-white border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleAddNewCustomer}
            className="bg-green-600 text-white px-4 py-2 rounded shadow-md hover:bg-green-700 transition duration-150 ease-in-out"
          >
            Add
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md cursor-pointer overflow-hidden whitespace-nowrap"
          onClick={onPrintReceipt}
          disabled={isProcessing} // Disable button when processing
        >
          {isProcessing ? "Processing..." : "Print Receipt"} {/* Show loading state */}
        </button>
        <button
          className="bg-red-500 text-white px-8 py-2 rounded-md overflow-hidden whitespace-nowrap"
          onClick={onClearItems}
        >
          Clear
        </button>
      </div>
    </div>
  );
};





const Cart = () => {
  const { state, clearCart } = useMyContext();
  const { selectedCompanyId } = state;
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("Cash");
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
  
  

  const handleClearItems = () => {
    clearCart();
  };

  const db = getFirestore();

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
        // receiptNumber: receiptNumber,  // Add receiptNumber to Firestore document
        date: transactionDateTime,
        customer: {
            name: 'Customer Name',
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
            method: selectedPaymentMethod,
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
        printWindow.print();
    } catch (error) {
        console.error('Error adding receipt to Firestore:', error);
        toast.error('Error processing sale. Please try again.');
    } finally {
        setIsProcessing(false);
    }
};

  
  return (
    // <div className="bg-gray-200 p-2 w-full md:w-1/4 max-h-[400px] overflow-y-auto">
    <div className="bg-gray-200 p-2 w-1/4">

      <h2 className="text-2xl font-bold mb-4 flex justify-between">
        <span>Cart</span>
        <span>Total</span>
      </h2>
      <div className="flex justify-between mb-2 text-sm sm:text-base">
        <span className="font-bold">Name</span>
        <span className="font-bold">Amount(&#x20A6;)</span>
        <span className="font-bold">Qty</span>
        <span className="font-bold">Total(&#x20A6;)</span>
      </div>
      <hr className="mb-4" />
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
        isProcessing={isProcessing} // Pass processing state to OverallTotal
      />
    </div>
  );
};

export default Cart;




