import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MdClose } from "react-icons/md";
import { getFirestore, collection, addDoc, Timestamp, doc, getDocs } from 'firebase/firestore';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddProduct = ({ onAddProduct, onCloseModal }) => {
  const navigate = useNavigate();
  const [isNewProduct, setIsNewProduct] = useState(true);
  const [product, setProduct] = useState({
    name: "",
    supplier: "",
    quantitySupplied: "",
    costOfSupply: "",
    salesPrice: "",
    description: "",
    existingProduct: "", // Field for existing product ID
    quantityRestocked: 0, // Field for restocking quantity
  });
  const [existingProductNames, setExistingProductNames] = useState([]);

  useEffect(() => {
    const fetchExistingProductNames = async () => {
      try {
        const productsCollection = collection(getFirestore(), "products");
        const productsSnapshot = await getDocs(productsCollection);
        const names = [];

        productsSnapshot.forEach((doc) => {
          const { name } = doc.data();
          names.push({ id: doc.id, name });
        });

        setExistingProductNames(names);
      } catch (error) {
        console.error("Error fetching existing products:", error.message);
      }
    };

    fetchExistingProductNames();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct((prevProduct) => ({ ...prevProduct, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Validate form fields before adding the product
      if (isNewProduct) {
        // For new product
        if (
          !product.name ||
          !product.supplier ||
          !product.quantitySupplied ||
          !product.costOfSupply ||
          !product.salesPrice ||
          !product.description ||
          !product.quantityRestocked
        ) {
          // Check if any required field is empty
          toast.error("Please fill in all required fields.");
          return;
        }
        // Add additional validation logic if needed
      } else {
        // For existing product
        if (!product.existingProduct || !product.quantityRestocked) {
          // Check if any required field is empty
          toast.error("Please fill in all required fields.");
          return;
        }
        // Add additional validation logic if needed
      }

      // If it's an existing product, update the quantity in the main inventory
      if (!isNewProduct) {
        const existingProductRef = doc(getFirestore(), "products", product.existingProduct);
        const existingProductDoc = await getDocs(existingProductRef);

        if (existingProductDoc.exists()) {
          const existingQuantity = existingProductDoc.data().quantity || 0;
          const restockedQuantity = parseInt(product.quantityRestocked, 10) || 0;

          // Update the quantity in the main inventory
          await existingProductRef.update({
            quantity: existingQuantity + restockedQuantity,
          });

          console.log("Quantity updated successfully!");
        }
      }

      // Pass the product to the parent component for handling
      onAddProduct(product);

      // Close the modal
      onCloseModal();
      toast.success("Product added successfully!");
    } catch (error) {
      console.error("Error adding product:", error.message);
      toast.error("Error adding product. Please try again.");
    }
  };

  const handleBack = () => {
    navigate("/inventory-page"); // Replace with the correct route
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
              <h2 className="text-2xl font-bold mx-auto">Add Product</h2>
              <button onClick={onCloseModal} className="text-gray-500">
                <MdClose />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Product Type</label>
                <select
                  name="isNewProduct"
                  value={isNewProduct}
                  onChange={(e) => setIsNewProduct(e.target.value === "true")}
                  className="border rounded-md w-full p-2"
                  required
                >
                  <option value={true}>New Product</option>
                  <option value={false}>Existing Product</option>
                </select>
              </div>
              {!isNewProduct ? (
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Select Existing Product</label>
                  <select
                    name="existingProduct"
                    value={product.existingProduct}
                    onChange={handleInputChange}
                    className="border rounded-md w-full p-2"
                    required
                  >
                    <option value="" disabled>Select an existing product</option>
                    {existingProductNames.map(({ id, name }) => (
                      <option key={id} value={id}>{name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Product Name</label>
                    <input
                      type="text"
                      name="name"
                      value={product.name}
                      onChange={handleInputChange}
                      className="border rounded-md w-full p-2"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Supplier Details</label>
                    <input
                      type="text"
                      name="supplier"
                      value={product.supplier}
                      onChange={handleInputChange}
                      className="border rounded-md w-full p-2"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Quantity Supplied</label>
                    <input
                      type="text"
                      name="quantitySupplied"
                      value={product.quantitySupplied}
                      onChange={handleInputChange}
                      className="border rounded-md w-full p-2"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Cost of Supply</label>
                    <input
                      type="text"
                      name="costOfSupply"
                      value={product.costOfSupply}
                      onChange={handleInputChange}
                      className="border rounded-md w-full p-2"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Sales Price</label>
                    <input
                      type="text"
                      name="salesPrice"
                      value={product.salesPrice}
                      onChange={handleInputChange}
                      className="border rounded-md w-full p-2"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
                    <textarea
                      name="description"
                      value={product.description}
                      onChange={handleInputChange}
                      className="border rounded-md w-full p-2"
                      required
                      rows="4"
                    ></textarea>
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Quantity Restocked</label>
                    <input
                      type="text"
                      name="quantityRestocked"
                      value={product.quantityRestocked}
                      onChange={handleInputChange}
                      className="border rounded-md w-full p-2"
                      required
                    />
                  </div>
                </>
              )}
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md">
                Add Product
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
