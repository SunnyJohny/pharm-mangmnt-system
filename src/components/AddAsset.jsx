import { useState } from "react";
import { toast } from "react-toastify";


//new  again
import { useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";
import { MdClose } from "react-icons/md";

export default function AddAsset({ onCloseModal }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [asset, setAsset] = useState({
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
    navigate("/posscreen");
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAsset((prevAsset) => ({
      ...prevAsset,
      [name]: value,
    }));
  };
  
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      
  
  
      
      setLoading(false);
      toast.success("Asset added successfully");
      setAsset({
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
      toast.error("Failed to add Asset");
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
              <h2 className="text-2xl font-bold mx-auto">Add Asset</h2>
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
                  value={asset.name}
                  onChange={handleInputChange}
                  className="border rounded-md w-full p-2"
                  required
                />
            </div>
             <div className="mb-4">

              <label className="block text-gray-700 text-sm font-bold mb-2">asset Category</label>
                <input
                  type="text"
                  name="category"
                  value={asset.category}
                  onChange={handleInputChange}
                  className="border rounded-md w-full p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">asset Amount</label>
                <input
                  type="number"
                  name="amount"
                  value={asset.amount}
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
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Date</label>
                <input
                  type="datetime-local"
                  name="date"
                  value={asset.date}
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
                  value={asset.receiptNo}
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
                  value={asset.vendorName}
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
                  value={asset.paymentMethod}
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
                  value={asset.attendantName}
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
                  value={asset.paymentStatus}
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
                Add asset
              </button>
            </form>
          </div>
        </div>
      </div>|
    </div>
  );
}
