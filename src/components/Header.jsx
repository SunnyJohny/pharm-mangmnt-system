import { useEffect } from "react";
import { useMyContext } from "../Context/MyContext";
import mylogo from "../assets/svg/mylogo.png";
import { FaShoppingCart, FaSyncAlt } from "react-icons/fa";
import Cart from "./Cart";
import ProductsPageSidePanel from "./ProductsPagesidePanel";
import CashiersCart from '../components/CashiersCart';
import SalesPageSidePanel from "./SalesPageSidePanel";

export default function Header() {
  const { state, toggleSidePanel, toggleCart } = useMyContext();

  useEffect(() => {
    console.log("Selected Company Name has changed:", state.selectedCompanyName);
  }, [state.selectedCompanyName]);

  const selectedCompanyName = state.selectedCompanyName || "";

  // Helper function to check if the screen size is small
  const isSmallScreen = () => window.innerWidth < 768; // Tailwind `sm` breakpoint

  const handleToggleSidePanel = () => {
    if (isSmallScreen() && state.user) {
      toggleSidePanel();
    }
  };

  const handleToggleCart = () => {
    if (isSmallScreen() && state.user) {
      toggleCart();
    }
  };

  return (
    <div className="bg-white border-b shadow-sm sticky top-0 z-40">
      <header className="flex justify-between items-center px-2 max-w-6xl mx-auto">
        {/* Left Section: Logo */}
        <div className="flex items-center mt-2">
          <div
            onClick={handleToggleSidePanel}
            className="flex items-center justify-center pb-2 cursor-pointer"
          >
            <img
              src={mylogo}
              alt="BizTrack Logo"
              className="h-12 w-12 rounded-full object-cover"
            />
          </div>
          <div
            className="text-base font-semibold text-blue-800"
            style={{ fontFamily: "serif", fontSize: "1rem", marginLeft: "0.2rem" }}
          >
            BizTrack
          </div>
        </div>

     
           {/* Center Section: System Name */}
           <div className="text-xl font-bold text-center text-gray-800 ">
          <span className="relative">
            <span className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 blur-lg opacity-50"></span>
            <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
            {selectedCompanyName}
            </span>
          </span>
        </div>

        {/* Right Section: Date, Cart Icon, Reload Button */}
        <div className="flex items-center space-x-4">
          {/* Reload Button */}
          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center text-blue-800 text-xl bg-gray-200 hover:bg-gray-300 p-2 rounded-full"
            title="Reload"
          >
            <FaSyncAlt />
          </button>

          {/* Cart Icon with Counter */}
          <div onClick={handleToggleCart} className="relative cursor-pointer">
            <FaShoppingCart className="text-2xl text-blue-800 mr-2" />
            {/* Dynamic Counter */}
            {state.cart.length > 0 && (
              <span className="absolute -top-3 -right-1 bg-red-500 text-white rounded-full h-4 w-4 flex items-center justify-center text-xs">
                {state.cart.length}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Cart Component with Slide-In Animation */}
      {state.user && (
        <div
          className={`fixed top-16 right-0 h-full w-79 bg-white shadow-lg p-4 transform transition-transform duration-300 ${
            state.isCartOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {state.user.role === "cashier" ? <CashiersCart /> : <Cart />}
        </div>
      )}

      {/* Side Panel with Slide-In Animation */}
      {state.user && state.user.role === "admin" ? (
        <div
          className={`fixed top-16 left-0 h-full w-72 bg-white shadow-lg p-4 transform transition-transform duration-300 ${
            state.isSidePanelOpen ? "translate-x-0" : "-translate-x-full"
          } overflow-y-auto`} // Ensure scrollable panel
        >
          <SalesPageSidePanel />
        </div>
      ) : (
        <div
          className={`fixed top-16 left-0 h-full w-72 bg-white shadow-lg p-4 transform transition-transform duration-300 ${
            state.isSidePanelOpen ? "translate-x-0" : "-translate-x-full"
          } overflow-y-auto`} // Ensure scrollable panel
        >
          <ProductsPageSidePanel />
        </div>
      )}
    </div>
  );
}
