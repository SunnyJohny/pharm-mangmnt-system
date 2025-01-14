import React, { useEffect, useState } from 'react';
import { FaShoppingCart } from 'react-icons/fa';
import ProductsPageSidePanel from '../components/ProductsPagesidePanel';
import { useMyContext } from '../Context/MyContext';
import Cart from '../components/Cart';
import CashiersCart from '../components/CashiersCart';

const Tooltip = ({ text, children, productId }) => {
  const { addToCart } = useMyContext();

  const handleAddToCart = () => {
    addToCart(productId);
  };

  return (
    <div className="relative group">
      {children}
      <div className="hidden group-hover:flex items-center cursor-pointer absolute top-0 left-1/2 transform -translate-x-1/2 bg-green-300 text-white p-2 rounded-md whitespace-nowrap mt-8">
        <span onClick={handleAddToCart}>{text}</span>
      </div>
    </div>
  );
};

const PosScreen = () => {
  const { addToCart, state } = useMyContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [ setIsIpadAndAbove] = useState(window.innerWidth < 768); // State to check screen size
  const [role, setRole] = useState(null); // Role selection state


  
  useEffect(() => {
    const handleResize = () => {
      setIsIpadAndAbove(window.innerWidth < 768); // 768px is the threshold for iPad and below
    };
  
    // Call handleResize initially to set the correct value
    handleResize();
  
    window.addEventListener('resize', handleResize);
  
    // Cleanup event listener on component unmount
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsIpadAndAbove]); // Include setIsIpadAndAbove as a dependency
  

  const filteredProducts = state.products.filter((product) =>
    product.name && product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddToCart = (productId) => {
    addToCart(productId);
  };

  // Role selection modal
  if (!role) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-100">
        <h2 className="text-2xl font-bold mb-6">Select Your Role</h2>
        <button
          onClick={() => setRole('salesRep')}
          className="p-4 bg-blue-500 text-white rounded-md mb-4"
        >
          Sales Representative
        </button>
        <button
          onClick={() => setRole('cashier')}
          className="p-4 bg-green-500 text-white rounded-md"
        >
          Cashier
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Left Section - Hidden on screens smaller than md */}
      <div className="hidden md:flex">
        <ProductsPageSidePanel />
      </div>

      {/* Center Section */}
      <div className="w-full md:w-3/4 bg-gray-300 p-4 overflow-y-auto">
        {/* Product List Title */}
        <h2 className="text-3xl font-bold mb-4 text-center">Product List</h2>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search product..."
          className="w-full p-2 mb-4 border rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Filtered Product List */}
        <div className="flex flex-wrap justify-center">
          {filteredProducts.map((product) => (
            <div key={product.id} className="w-1/4 p-4">
              {/* Content for each product */}
              <div className="bg-blue-300 p-4 rounded-md mb-2">
                <Tooltip text="Add to Cart" productId={product.id}>
                  <div
                    className="text-center flex flex-col items-center cursor-pointer hover"
                    onClick={() => handleAddToCart(product.id)}
                  >
                    <p className="text-lg font-bold mt-2">{product.name}</p>
                    <FaShoppingCart
                      className="w-6 h-6 text-blue-500 hover:opacity-80 transition-opacity mt-2"
                    />
                    <p className="text-sm">Price: ₦{product.price}</p>
                  </div>
                </Tooltip>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Section - Hidden on screens smaller than md */}
      <div className="hidden md:flex">
        {role === 'cashier' ? <CashiersCart /> : <Cart />}
      </div>
    </div>
  );
};

export default PosScreen;
