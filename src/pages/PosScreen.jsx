import React, { useEffect, useState } from 'react';
import { FaShoppingCart } from 'react-icons/fa';
import ProductsPageSidePanel from '../components/ProductsPagesidePanel';
import { useMyContext } from '../Context/MyContext';
import Cart from '../components/Cart';
import CashiersCart from '../components/CashiersCart';
import { toast } from 'react-toastify';

const Tooltip = ({ text, children, productId }) => {
  const { addToCart, state } = useMyContext();

  const handleAddToCart = () => {
    // Check if the user is a cashier and if there are no pending orders
    const isCashier = state.user?.role === 'cashier';
    const hasPendingOrders = state.orders && state.orders.some(order => order.status === 'pending');

    if ((isCashier && !hasPendingOrders) || state.user?.role === 'sales rep') {
      addToCart(productId);
    } else {
      toast.warn("Cannot add items to the cart. Either you are not a cashier or there are pending orders.");
    }
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
  const [isIpadAndAbove, setIsIpadAndAbove] = useState(window.innerWidth >= 768); // State to check screen size
if (isIpadAndAbove){}
  useEffect(() => {
    const handleResize = () => {
      setIsIpadAndAbove(window.innerWidth >= 768); // 768px is the threshold for iPad and above
    };

    window.addEventListener('resize', handleResize);

    // Cleanup event listener on component unmount
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredProducts = state.products.filter((product) =>
    product.name && product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddToCart = (productId) => {
    // Check if the user is a cashier and if there are no pending orders
    const isCashier = state.user?.role === 'cashier';
    const hasPendingOrders = state.orders && state.orders.some(order => order.status === 'pending');

    if ((isCashier && !hasPendingOrders) || state.user?.role === 'sales rep') {
      addToCart(productId);
    } else {
      toast.warn("Cannot add items to the cart. Either you are not a cashier or there are pending orders.");
    }
  };

  // Get role from state.user.role
  const role = state.user?.role;

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

     {/* Right Section - Responsive */}
{/* Cart Component with Slide-In Animation */}
{state.user && (
  <div
    className={`fixed top-16 right-0 h-full w-72 bg-white shadow-lg p-4 transform transition-transform duration-300 ${
      state.isCartOpen ? "translate-x-0" : "translate-x-full"
    }`}
  >
    {state.user.role === "cashier" ? <CashiersCart /> : <Cart />}
  </div>
)}

    </div>
  );
};

export default PosScreen;