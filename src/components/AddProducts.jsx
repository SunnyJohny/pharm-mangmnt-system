import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdClose } from "react-icons/md"; 

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
    existingProduct: "", // Field for existing product
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate form fields before adding the product
    // ...

    // Pass the product to the parent component for handling
    onAddProduct(product);

    // Close the modal
    onCloseModal();
  };
  const handleBack = () => {
    // onCloseModal();
    navigate("/inventory-page"); // Replace with the correct route
  };
  return (
    <div className="fixed inset-0 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white p-4">
          <div className="flex items-center justify-between mb-4">
  <button
    onClick={handleBack}
    className="text-blue-500 text-lg cursor-pointer"
  >
    &#8592; Back
  </button>
  <h2 className="text-2xl font-bold mx-auto">Add Product</h2>
  <button onClick={onCloseModal} className="text-gray-500">
    <MdClose />
  </button>
</div>


            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Product Type
                </label>
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
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Select Existing Product
                  </label>
                  <input
                    type="text"
                    name="existingProduct"
                    value={product.existingProduct}
                    onChange={handleInputChange}
                    className="border rounded-md w-full p-2"
                    required
                  />
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Product Name
                    </label>
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
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Supplier Details
                    </label>
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
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Quantity Supplied
                    </label>
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
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Cost of Supply
                    </label>
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
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Sales Price
                    </label>
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
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={product.description}
                      onChange={handleInputChange}
                      className="border rounded-md w-full p-2"
                      required
                      rows="4"
                    ></textarea>
                  </div>
                </>
              )}
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
              >
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
