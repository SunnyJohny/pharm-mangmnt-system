import React, { useState } from "react";
import { toast } from "react-toastify";
import Spinner from "../components/Spinner";
import { MdClose } from "react-icons/md";
import { addDoc, collection } from "firebase/firestore"; // Assuming you are using Firestore
import { db } from "../firebase"; // Adjust the import path as necessary
import { useMyContext } from '../Context/MyContext';
import { useNavigate } from 'react-router';

export default function AddAsset() {
  const navigate = useNavigate();
  const { state } = useMyContext();
  const [loading, setLoading] = useState(false);
  const [asset, setAsset] = useState({
    assetName: "",
    description: "",
    purchasePrice: 0,
    salvageValue: 0,
    depreciationStartDate: "",
    depreciationMethod: "",
    usefulLife: 0,
    assetAccount: "",
    depreciationExpenseAccount: "",
    accumulatedDepreciationAccount: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };


  const calculateTotal = (field) => {
    return state.assets.reduce((total, asset) => total + parseFloat(asset[field]), 0);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "accumulatedDepreciationAccount" && value === "Add New") {
      setAsset((prevAsset) => ({
        ...prevAsset,
        assetName: value,
        [name]: value,
      }));
    } else {
      setAsset((prevAsset) => ({
        ...prevAsset,
        [name]: value,
      }));
    }
  };

  const handlePrint = () => {
    // Define a print-specific CSS style
    const printStyle = `
      @media print {
        body * {
          visibility: hidden;
        }
        .printable-content, .printable-content * {
          visibility: visible;
        }
      }
    `;

    // Create a new window to print only the desired content
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print</title>
          <style>${printStyle}</style>
        </head>
        <body>
          <div class="printable-content">
            <h2 class="text-2xl font-bold mb-4" text-center>Fixed Asset</h2>
            <!-- Table to display data -->
            <div class="overflow-x-auto">
              <table class="min-w-full border border-collapse">
                <thead>
                  <tr>
                    <th>S/N</th>
                    <th>Asset Name</th>
                    <th>Description</th>
                    <th>Accumulated Depreciation Account</th>
                    <th>Asset Account</th>
                    <th>Depreciation Expense Account</th>
                    <th>Depreciation Method</th>
                    <th>Depreciation Start Date</th>
                    <th>Purchase Price</th>
                    <th>Salvage Value</th>
                    <th>Useful Life</th>
                  </tr>
                </thead>
                <tbody>
                  ${state.assets.map((asset, index) => `
                    <tr>
                      <td>${index + 1}</td>
                      <td>${asset.assetName}</td>
                      <td>${asset.description}</td>
                      <td>${asset.accumulatedDepreciationAccount}</td>
                      <td>${asset.assetAccount}</td>
                      <td>${asset.depreciationExpenseAccount}</td>
                      <td>${asset.depreciationMethod}</td>
                      <td>${asset.depreciationStartDate}</td>
                      <td>${asset.purchasePrice}</td>
                      <td>${asset.salvageValue}</td>
                      <td>${asset.usefulLife}</td>
                    </tr>
                  `).join('')}
                </tbody>
                <!-- Footer with totals -->
                <tfoot>
                  <tr>
                    <td colspan="7"></td>
                    <td class="font-bold">Totals:</td>
                    <td class="font-bold">₦ ${calculateTotal("purchasePrice")}</td>
                    <td class="font-bold">₦ ${calculateTotal("salvageValue")}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };


  const handleDownload = () => {
    const header = [
      "S/N",
      "Asset Name",
      "Description",
      "Accumulated Depreciation Account",
      "Asset Account",
      "Depreciation Expense Account",
      "Depreciation Method",
      "Depreciation Start Date",
      "Purchase Price",
      "Salvage Value",
      "Useful Life"
    ];

    const rows = state.assets.map((asset, index) => [
      index + 1,
      asset.assetName,
      asset.description,
      asset.accumulatedDepreciationAccount,
      asset.assetAccount,
      asset.depreciationExpenseAccount,
      asset.depreciationMethod,
      asset.depreciationStartDate,
      asset.purchasePrice,
      asset.salvageValue,
      asset.usefulLife
    ]);

    const footer = [
      "",
      "",
      "",
      "",
      "",
      "",
      "Totals:",
      "",
      calculateTotal("purchasePrice"),
      calculateTotal("salvageValue"),
      ""
    ];

    const csvContent = [
      header,
      ...rows,
      footer
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "assets.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBack = () => {
    navigate("/inventory-page");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const {
        assetName,
        description,
        purchasePrice,
        salvageValue,
        depreciationStartDate,
        depreciationMethod,
        usefulLife,
        assetAccount,
        depreciationExpenseAccount,
        accumulatedDepreciationAccount,
      } = asset;

      if (
        !assetName.trim() ||
        !description.trim() ||
        isNaN(parseFloat(purchasePrice)) ||
        isNaN(parseFloat(salvageValue)) ||
        !depreciationStartDate ||
        !depreciationMethod ||
        isNaN(parseFloat(usefulLife)) ||
        !assetAccount ||
        !depreciationExpenseAccount ||
        !accumulatedDepreciationAccount
      ) {
        toast.error("All fields must be filled and contain valid data", {
          position: toast.POSITION.TOP_RIGHT,
        });
        setLoading(false);
        return;
      }

      const assetData = {
        assetName: assetName.trim(),
        description: description.trim(),
        purchasePrice: parseFloat(purchasePrice),
        salvageValue: parseFloat(salvageValue),
        depreciationStartDate,
        depreciationMethod,
        usefulLife: parseFloat(usefulLife),
        assetAccount,
        depreciationExpenseAccount,
        accumulatedDepreciationAccount,
      };

      await addDoc(collection(db, "assets"), assetData);

      toast.success("Asset added successfully", {
        position: toast.POSITION.TOP_RIGHT,
      });

      setAsset({
        assetName: "",
        description: "",
        purchasePrice: 0,
        salvageValue: 0,
        depreciationStartDate: "",
        depreciationMethod: "",
        usefulLife: 0,
        assetAccount: "",
        depreciationExpenseAccount: "",
        accumulatedDepreciationAccount: "",
      });
    } catch (error) {
      console.error("Error adding asset: ", error);
      toast.error("Failed to add asset. Please try again later.", {
        position: toast.POSITION.TOP_RIGHT,
      });
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
            <h2 className="text-2xl font-bold flex-1 text-center">Add Asset</h2>
            <button onClick={handleCloseModal} className="text-gray-500">
              <MdClose size={24} />
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Asset Name</label>
              <input
                type="text"
                name="assetName"
                value={asset.assetName}
                onChange={handleInputChange}
                className="border rounded-md w-full p-2"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
              <textarea
                name="description"
                value={asset.description}
                onChange={handleInputChange}
                className="border rounded-md w-full p-2"
                required
                rows="4"
              ></textarea>
            </div>

            {/* Divider line */}
            <hr className="my-6 border-gray-300" />

            {/* Depreciation Details */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Depreciation Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Purchase Price</label>
                  <input
                    type="number"
                    name="purchasePrice"
                    value={asset.purchasePrice}
                    onChange={handleInputChange}
                    className="border rounded-md w-full p-2"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Salvage Value</label>
                  <input
                    type="number"
                    name="salvageValue"
                    value={asset.salvageValue}
                    onChange={handleInputChange}
                    className="border rounded-md w-full p-2"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Depreciation Start Date</label>
                  <input
                    type="datetime-local"
                    name="depreciationStartDate"
                    value={asset.depreciationStartDate}
                    onChange={handleInputChange}
                    className="border rounded-md w-full p-2"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Depreciation Method</label>
                  <select
                    name="depreciationMethod"
                    value={asset.depreciationMethod}
                    onChange={handleInputChange}
                    className="border rounded-md w-full p-2"
                    required
                  >
                    <option value="">Select Depreciation Method</option>
                    <option value="Straight">Straight</option>
                    <option value="Double Declining">Double Declining</option>
                    <option value="150% Accelerated">150% Accelerated</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Useful Life</label>
                  <input
                    type="number"
                    name="usefulLife"
                    value={asset.usefulLife}
                    onChange={handleInputChange}
                    className="border rounded-md w-full p-2"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Divider line */}
            <hr className="my-6 border-gray-300" />

            {/* Accounts Details */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Accounts Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Asset Account</label>
                  <select
                    name="assetAccount"
                    value={asset.assetAccount}
                    onChange={(e) => {
                      const newValue = e.target.value === "Add New" ? "" : e.target.value;
                      handleInputChange({ target: { name: e.target.name, value: newValue } });
                    }}
                    className="border rounded-md w-full p-2"
                    required
                  >
                    <option value="">Select Asset Account</option>
                    <option value="Add New">Add New</option>
                    <option value="15000">Fixed Asset: Furniture and Equipment</option>
                    <option value="15100">Fixed Asset: Vehicles</option>
                    <option value="15200">Fixed Asset: Buildings and Improvements</option>
                    <option value="15300">Fixed Asset: Land</option>
                    <option value="1700">Fixed Asset: Accumulated Depreciation</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Depreciation Expense Account</label>
                  <select
                    name="depreciationExpenseAccount"
                    value={asset.depreciationExpenseAccount}
                    onChange={(e) => {
                      const newValue = e.target.value === "Add New" ? "" : e.target.value;
                      handleInputChange({ target: { name: e.target.name, value: newValue } });
                    }}
                    className="border rounded-md w-full p-2"
                    required
                  >
                    <option value="">Select Depreciation Expense Account</option>
                    <option value="Add New">Add New</option>
                    <option value="80100">Fixed Asset: Other Expenses</option>
                    <option value="Ask My Accountant">Fixed Asset: Ask My Accountant</option>
                    <option value="Depreciation Other Account">Fixed Asset: Depreciation Other Account</option>
                    <option value="Interest Paid on Loan Other Account">Fixed Asset: Interest Paid on Loan Other Account</option>
                    <option value="Reconciliation Discrepancy Other Account">Fixed Asset: Reconciliation Discrepancy Other Account</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Accumulated Depreciation Account</label>
                  <select
                    name="accumulatedDepreciationAccount"
                    value={asset.accumulatedDepreciationAccount}
                    onChange={(e) => {
                      const newValue = e.target.value === "Add New" ? "" : e.target.value;
                      handleInputChange({ target: { name: e.target.name, value: newValue } });
                    }}
                    className="border rounded-md w-full p-2"
                    required
                  >
                    <option value="">Select Accumulated Depreciation Account</option>
                    <option value="Add New">Add New</option>
                    <option value="15000">Fixed Asset: Furniture and Equipment</option>
                    <option value="15100">Fixed Asset: Vehicles</option>
                    <option value="15200">Fixed Asset: Buildings and Improvements</option>
                    <option value="15300">Fixed Asset: Land</option>
                    <option value="1700">Fixed Asset: Accumulated Depreciation</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Divider line */}
            <hr className="my-6 border-gray-300" />

            {/* Save Button */}
            <div className="text-center">
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md">
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
)}
 <div className="flex justify-between items-center mb-4 mx-8">
    <button onClick={handleBack} className="text-blue-500 text-lg cursor-pointer">
      &#8592; Back
    </button>
    <h2 className="text-2xl font-bold text-center">Fixed Asset</h2>
    <div></div> {/* Adjust this empty div for spacing if needed */}
  </div>
      {/* Table to display data */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-collapse">
          <thead>
            <tr>
              <th className="border px-4 py-2">S/N</th>
              <th className="border px-
4 py-2">Asset Name</th>
              <th className="border px-4 py-2">Description</th>
              <th className="border px-4 py-2">Accumulated Depreciation Account</th>
              <th className="border px-4 py-2">Asset Account</th>
              <th className="border px-4 py-2">Depreciation Expense Account</th>
              <th className="border px-4 py-2">Depreciation Method</th>
              <th className="border px-4 py-2">Depreciation Start Date</th>
              <th className="border px-4 py-2">Purchase Price</th>
              <th className="border px-4 py-2">Salvage Value</th>
              <th className="border px-4 py-2">Useful Life</th>
            </tr>
          </thead>
          <tbody>
            {state.assets.map((asset, index) => (
              <tr key={asset.id}>
                <td className="border px-4 py-2">{index + 1}</td>
                <td className="border px-4 py-2">{asset.assetName}</td>
                <td className="border px-4 py-2">{asset.description}</td>
                <td className="border px-4 py-2">{asset.accumulatedDepreciationAccount}</td>
                <td className="border px-4 py-2">{asset.assetAccount}</td>
                <td className="border px-4 py-2">{asset.depreciationExpenseAccount}</td>
                <td className="border px-4 py-2">{asset.depreciationMethod}</td>
                <td className="border px-4 py-2">{asset.depreciationStartDate}</td>
                <td className="border px-4 py-2">{asset.purchasePrice}</td>
                <td className="border px-4 py-2">{asset.salvageValue}</td>
                <td className="border px-4 py-2">{asset.usefulLife}</td>
              </tr>
            ))}
          </tbody>
          {/* Footer with totals */}
          <tfoot>
            <tr>
              <td colSpan="7"></td>
              <td className="font-bold">Totals:</td>
              <td className="font-bold">₦{calculateTotal("purchasePrice")}</td>
              <td className="font-bold">₦{calculateTotal("salvageValue")}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

   {/* Buttons for printing and downloading */}
<div className="flex flex-wrap justify-center gap-2 p-4">
  <button onClick={handlePrint} className="bg-blue-500 text-white px-4 py-2 rounded-md">
    Print Table
  </button>
  <button onClick={handleDownload} className="bg-green-500 text-white px-4 py-2 rounded-md">
    Download Table
  </button>
  <button onClick={handleOpenModal} className="bg-blue-500 text-white px-4 py-2 rounded-md">
    Add Asset
  </button>
</div>

    </>
  );
}
