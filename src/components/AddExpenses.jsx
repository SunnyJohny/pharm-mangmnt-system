import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MdClose } from "react-icons/md";
import { getFirestore, collection, addDoc, Timestamp, doc, getDocs, updateDoc, arrayUnion } from 'firebase/firestore';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddExpense = ({ onCloseModal }) => {
  const navigate = useNavigate();
  const [expense, setExpense] = useState({
    name: "",
    category: "",
    amount: 0,
    description: ""
  });

  useEffect(() => {
    // Fetch necessary data or perform any initial setup
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setExpense((prevExpense) => ({ ...prevExpense, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate form inputs
      if (!expense.name || !expense.category || expense.amount <= 0) {
        toast.error("Please fill in all required fields with valid values.");
        return;
      }

      // Add expense to the database
      await addExpenseToDatabase(expense);

      // Reset form fields
      setExpense({
        name: "",
        category: "",
        amount: 0,
        description: ""
      });

      // Show success message
      toast.success("Expense added successfully!");
    } catch (error) {
      console.error("Error adding expense:", error.message);
      toast.error("Error adding expense. Please try again.");
    }
  };

  const addExpenseToDatabase = async (expenseData) => {
    try {
      const expensesCollection = collection(getFirestore(), 'expenses');
      await addDoc(expensesCollection, {
        ...expenseData,
        timestamp: Timestamp.now()
      });
    } catch (error) {
      console.error("Error adding expense to database:", error.message);
      throw error;
    }
  };

  const handleBack = () => {
    navigate("/expenses"); // Navigate to the dashboard or any other desired page
  };

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
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md">
                Add Expense
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddExpense;
