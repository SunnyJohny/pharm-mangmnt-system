import { useState } from "react";
import { toast } from "react-toastify";
import { addDoc, collection } from "firebase/firestore";
import { db, storage } from "../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
//new  again
import { useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";
import { MdClose } from "react-icons/md";

export default function AddExpense({ onCloseModal }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [expense, setExpense] = useState({
    name: "",
    category: "",
    amount: 0,
    description: "",
    date: null,
    receiptNo: "",
    vendorName: "",
    paymentMethod: "",
    attendantName: "",
    paymentStatus: "",
    receiptFile: {},
  });
  
  const handleBack = () => {
    navigate("/expenses");
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setExpense((prevExpense) => ({
      ...prevExpense,
      [name]: value,
    }));
  };
  
  const uploadImageAndSaveUrl = async (imageFile) => {
    try {
      const storageRef = ref(storage, 'receipts/' + imageFile.name);
      const snapshot = await uploadBytesResumable(storageRef, imageFile);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const downloadURL = await uploadImageAndSaveUrl(expense.receiptFile);
  
      // Format date to the desired string format
      const formattedDate = new Date().toLocaleString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true
      });
  
      const formData = {
        ...expense,
        date: formattedDate,
        receiptFile: downloadURL,
      };
  
      
      setLoading(false);
      toast.success("Expense added successfully");
      setExpense({
        name: "",
        category: "",
        amount: 0,
        description: "",
        date: null,
        receiptNo: "",
        vendorName: "",
        paymentMethod: "",
        attendantName: "",
        paymentStatus: "",
        receiptFile: null,
      });
    } catch (error) {
      setLoading(false);
      console.error("Error adding document: ", error);
      toast.error("Failed to add expense");
    }
  };
  
  
  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="fixed inset-0 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white p-4">
            <div className="flex items-center justify-between mb-4">
              <button onClick={handleBack} className="text-blue-500 text-lg cursor-pointer">
                &#8592; Back
              </button>
              <h2 className="text-2xl font-bold mx-auto">Add Expense</h2>
              <button onClick={onCloseModal} className="text-gray-500">
                <MdClose />
              </button>
            </div>

              <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Expense Name</label>
                <input
                  type="text"
                  name="name"
                  value={expense.name}
                  onChange={handleInputChange}
                  className="border rounded-md w-full p-2"
                  required
                />
            </div>
             <div className="mb-4">

              <label className="block text-gray-700 text-sm font-bold mb-2">Expense Category</label>
                <input
                  type="text"
                  name="category"
                  value={expense.category}
                  onChange={handleInputChange}
                  className="border rounded-md w-full p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Expense Amount</label>
                <input
                  type="number"
                  name="amount"
                  value={expense.amount}
                  onChange={handleInputChange}
                  className="border rounded-md w-full p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
                <textarea
                  name="description"
                  value={expense.description}
                  onChange={handleInputChange}
                  className="border rounded-md w-full p-2"
                  required
                  rows="4"
                ></textarea>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Date</label>
                <input
                  type="datetime-local"
                  name="date"
                  value={expense.date}
                  onChange={handleInputChange}
                  className="border rounded-md w-full p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Receipt No</label>
                <input
                  type="text"
                  name="receiptNo"
                  value={expense.receiptNo}
                  onChange={handleInputChange}
                  className="border rounded-md w-full p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Vendor Name</label>
                <input
                  type="text"
                  name="vendorName"
                  value={expense.vendorName}
                  onChange={handleInputChange}
                  className="border rounded-md w-full p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Payment Method</label>
                <input
                  type="text"
                  name="paymentMethod"
                  value={expense.paymentMethod}
                  onChange={handleInputChange}
                  className="border rounded-md w-full p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Attendant Name</label>
                <input
                  type="text"
                  name="attendantName"
                  value={expense.attendantName}
                  onChange={handleInputChange}
                  className="border rounded-md w-full p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Payment Status</label>
                <input
                  type="text"
                  name="paymentStatus"
                  value={expense.paymentStatus}
                  onChange={handleInputChange}
                  className="border rounded-md w-full p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Receipt File</label>
                <input
                  type="file"
                  name="receiptFile"
                  onChange={handleInputChange}
                  className="border rounded-md w-full p-2"
                  accept="image/*, application/pdf"
                  required
                />
              </div>
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md">
                Add Expense
              </button>
            </form>
          </div>
        </div>
      </div>|
    </div>
  );
}
