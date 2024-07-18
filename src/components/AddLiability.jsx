import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Spinner from "./Spinner";
import { MdClose, MdEdit, MdDelete } from "react-icons/md";
import { doc, deleteDoc, updateDoc, addDoc, collection } from "firebase/firestore";
import { db } from "../firebase";
import { useMyContext } from '../Context/MyContext';

import { useNavigate } from 'react-router';

export default function AddLiability() {
  const navigate = useNavigate();
  const { state, dispatch } = useMyContext();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentLiabilityId, setCurrentLiabilityId] = useState(null);
  const [liability, setLiability] = useState({
    liabilityName: "",
    description: "",
    amount: 0,
    dueDate: "",
    accountType: "",
    liabilityAccount: "",
    interestExpenseAccount: "",
    collectionDate: "",
    amountPaid: 0,
    loanBalance: 0,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Calculate loanBalance whenever amount or amountPaid changes
  useEffect(() => {
    const calculatedLoanBalance = parseFloat(liability.amount) - parseFloat(liability.amountPaid);
    setLiability((prevLiability) => ({
      ...prevLiability,
      loanBalance: calculatedLoanBalance,
    }));
  }, [liability.amount, liability.amountPaid]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handlePrint = () => {
    // Function for printing liabilities
    };
    
   
    const handleDownload = () => {
    // Function for downloading liabilities as CSV
    };



  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setCurrentLiabilityId(null);
    setLiability({
      liabilityName: "",
      description: "",
      amount: 0,
      dueDate: "",
      accountType: "",
      liabilityAccount: "",
      interestExpenseAccount: "",
      collectionDate: "",
      amountPaid: 0,
      loanBalance: 0,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLiability((prevLiability) => ({
      ...prevLiability,
      [name]: value,
    }));
  };

  const handleEdit = (index) => {
    const liabilityToEdit = state.liabilities[index];
    setLiability(liabilityToEdit);
    setCurrentLiabilityId(liabilityToEdit.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleBack = () => {
    navigate("/inventory-page");
  };

  const calculateTotal = (field) => {
    return state.liabilities.reduce((total, liability) => total + liability[field], 0);
  };

  const handleDelete = async (index) => {
    try {
      const liabilityToDelete = state.liabilities[index];
      await deleteDoc(doc(db, "liabilities", liabilityToDelete.id));
      dispatch({ type: 'DELETE_LIABILITY', payload: index });
      toast.success("Liability deleted successfully", { position: toast.POSITION.TOP_RIGHT });
    } catch (error) {
      console.error("Error deleting liability: ", error);
      toast.error("Failed to delete liability. Please try again later.", { position: toast.POSITION.TOP_RIGHT });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const {
        liabilityName,
        description,
        amount,
        dueDate,
        accountType,
        liabilityAccount,
        interestExpenseAccount,
        collectionDate,
        amountPaid,
        loanBalance,
      } = liability;

      const liabilityData = {
        liabilityName: liabilityName.trim(),
        description: description.trim(),
        amount: parseFloat(amount),
        dueDate,
        accountType,
        liabilityAccount,
        interestExpenseAccount,
        collectionDate,
        amountPaid: parseFloat(amountPaid),
        loanBalance: parseFloat(loanBalance), // Ensure loanBalance is included here
      };

      if (isEditing) {
        await updateDoc(doc(db, "liabilities", currentLiabilityId), liabilityData);
        toast.success("Liability updated successfully", { position: toast.POSITION.TOP_RIGHT });
      } else {
        const docRef = await addDoc(collection(db, "liabilities"), liabilityData);
        toast.success("Liability added successfully", { position: toast.POSITION.TOP_RIGHT });
      }

      handleCloseModal();
    } catch (error) {
      console.error("Error saving liability: ", error);
      toast.error("Failed to save liability. Please try again later.", { position: toast.POSITION.TOP_RIGHT });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:align-middle sm:max-w-lg sm:w-full w-full mx-4 my-8">
              <div className="bg-white p-4">
                <div className="flex items-center justify-between mb-4">
                  <button onClick={handleBack} className="text-blue-500 text-lg cursor-pointer">
                    &#8592; Back
                  </button>
                  <h2 className="text-2xl font-bold flex-1 text-center">
                    {isEditing ? "Edit Liability" : "Add Liability"}
                  </h2>
                  <button onClick={handleCloseModal} className="text-gray-500">
                    <MdClose size={24} />
                  </button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Liability Name</label>
                    <input
                      type="text"
                      name="liabilityName"
                      value={liability.liabilityName}
                      onChange={handleInputChange}
                      className="border rounded-md w-full p-2"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
                    <textarea
                      name="description"
                      value={liability.description}
                      onChange={handleInputChange}
                      className="border rounded-md w-full p-2"
                      required
                      rows="4"
                    ></textarea>
                  </div>
                  <hr className="my-6 border-gray-300" />
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Liability Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Amount</label>
                        <input
                          type="number"
                          name="amount"
                          value={liability.amount}
                          onChange={handleInputChange}
                          className="border rounded-md w-full p-2"
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Due Date</label>
                        <input
                          type="date"
                          name="dueDate"
                          value={liability.dueDate}
                          onChange={handleInputChange}
                          className="border rounded-md w-full p-2"
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Loan Collection/Receipt Date</label>
                        <input
                          type="date"
                          name="collectionDate"
                          value={liability.collectionDate}
                          onChange={handleInputChange}
                          className="border rounded-md w-full p-2"
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Amount Paid</label>
                        <input
                          type="number"
                          name="amountPaid"
                          value={liability.amountPaid}
                          onChange={handleInputChange}
                          className="border rounded-md w-full p-2"
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Loan Balance




                        </label>
                        <input
                          type="number"
                          name="loanBalance"
                          value={liability.loanBalance}
                          onChange={handleInputChange}
                          className="border rounded-md w-full p-2"
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Account Type</label>
                        <select
                          name="accountType"
                          value={liability.accountType}
                          onChange={handleInputChange}
                          className="border rounded-md w-full p-2"
                          required
                        >
                          <option value="">Select an Account Type</option>
                          <option value="Current Liabilities">Current Liabilities</option>
                          <option value="Accounts Payable">Accounts Payable</option>
                          <option value="Short-Term Debt">Short-Term Debt</option>
                          <option value="Long-Term Debt">Long-Term Debt</option>
                        </select>
                      </div>
                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Liability Account</label>
                        <input
                          type="text"
                          name="liabilityAccount"
                          value={liability.liabilityAccount}
                          onChange={handleInputChange}
                          className="border rounded-md w-full p-2"
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Interest Expense Account</label>
                        <input
                          type="text"
                          name="interestExpenseAccount"
                          value={liability.interestExpenseAccount}
                          onChange={handleInputChange}
                          className="border rounded-md w-full p-2"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-6">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                      {isEditing ? "Update Liability" : "Add Liability"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mt-2 mx-8">
        <button onClick={handleBack} className="text-blue-500 text-lg cursor-pointer">
          &#8592; Back
        </button>
        <h2 className="text-2xl font-bold text-center">Liability</h2>
        <div></div>
      </div>

      <div className="p-4 overflow-x-auto">
        <table className="min-w-full border border-collapse">
          <thead>
            <tr>
              <th className="border px-4 py-2">S/N</th>
              <th className="border px-4 py-2">Liability Name</th>
              <th className="border px-4 py-2">Description</th>
              <th className="border px-4 py-2">Liability Account</th>
              <th className="border px-4 py-2">Interest Expense Account</th>
              <th className="border px-4 py-2">Account Type</th>
              <th className="border px-4 py-2">Due Date</th>
              <th className="border px-4 py-2">Collection Date</th>

              <th className="border px-4 py-2">Amount</th>
              <th className="border px-4 py-2">Amount Paid</th>
              <th className="border px-4 py-2">Loan Balance</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(state.liabilities || []).map((liability, index) => (
              <tr key={index}>
                <td className="border px-4 py-2">{index + 1}</td>
                <td className="border px-4 py-2">{liability.liabilityName}</td>
                <td className="border px-4 py-2">{liability.description}</td>
                <td className="border px-4 py-2">{liability.liabilityAccount}</td>
                <td className="border px-4 py-2">{liability.interestExpenseAccount}</td>
                <td className="border px-4 py-2">{liability.accountType}</td>
                <td className="border px-4 py-2">{liability.dueDate}</td>
                <td className="border px-4 py-2">{liability.collectionDate}</td>

                <td className="border px-4 py-2">₦ {liability.amount}</td>
                <td className="border px-4 py-2">{liability.amountPaid}</td>
                <td className="border px-4 py-2">{liability.loanBalance}</td>
                <td className="border px-4 py-2 flex justify-center">
                  <button
                    onClick={() => handleEdit(index)}
                    className="text-blue-500 mx-2"
                  >
                    <MdEdit size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(index)}
                    className="text-red-500 mx-2"
                  >
                    <MdDelete size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
  <tr>
    <td className="border px-4 py-2 font-bold" colSpan="8">
      Total Amount:
    </td>
    <td className="border px-4 py-2 font-bold text-right" style={{ fontSize: '14px' }}>
      ₦ {calculateTotal("amount")}
    </td>
    <td className="border px-4 py-2 font-bold text-right" style={{ fontSize: '14px' }}>
      ₦ {calculateTotal("amountPaid")}
    </td>
    <td className="border px-4 py-2 font-bold text-right" style={{ fontSize: '14px' }}>
      ₦ {calculateTotal("loanBalance")}
    </td>
    <td className="border px-4 py-2 font-bold" colSpan="2"></td>
  </tr>
</tfoot>



        </table>
        {state.liabilities && state.liabilities.length === 0 && (
          <div className="text-center mt-4 text-gray-500">No liabilities found</div>
        )}
      </div>
      <div className="flex flex-wrap justify-center gap-2 p-2 mb-12">
  <button onClick={handlePrint} className="bg-blue-500 text-white px-4 py-2 rounded-md">
    Print Table
  </button>
  <button onClick={handleDownload} className="bg-green-500 text-white px-4 py-2 rounded-md">
    Download Table
  </button>
  <button onClick={handleOpenModal} className="bg-blue-500 text-white px-4 py-2 rounded-md">
    Add Liability
  </button>
</div>

    </>
  );
}
