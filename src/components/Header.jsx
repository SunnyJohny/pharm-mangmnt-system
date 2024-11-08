import { useEffect } from "react";
// import {  useNavigate } from "react-router-dom";
// import { getAuth, onAuthStateChanged } from "firebase/auth";
// import DateTimeDisplay from "./DateTimeDisplay";
import { useMyContext } from '../Context/MyContext';
import mylogo from "../assets/svg/mylogo.png";
import { FaShoppingCart } from "react-icons/fa";
import Cart from './Cart';
import ProductsPageSidePanel from "./ProductsPagesidePanel";

export default function Header() {
  const { state, toggleSidePanel, toggleCart } = useMyContext();
  // const [pageState, setPageState] = useState("Sign in");
  // const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  // const location = useLocation();
  // const navigate = useNavigate();
  // const auth = getAuth();

  // useEffect(() => {
  //   onAuthStateChanged(auth, (user) => {
  //     setPageState(user ? "Profile" : "Sign in");
  //   });
  // }, [auth]);

  useEffect(() => {
    console.log('Selected Company Name has changed:', state.selectedCompanyName);
  }, [state.selectedCompanyName]);

  const selectedCompanyName = state.selectedCompanyName || "";

  return (
    <div className="bg-white border-b shadow-sm sticky top-0 z-40">
      <header className="flex justify-between items-center px-2 max-w-6xl mx-auto">
        
        {/* Left Section: Logo */}
        <div className="flex items-center mt-2">
          <div onClick={() => toggleSidePanel()} className="flex items-center justify-center pb-2 cursor-pointer">
            <img src={mylogo} alt="BizTrack Logo" className="h-12 w-12 rounded-full object-cover" />
          </div>
          <div className="text-base font-semibold text-blue-800" style={{ fontFamily: 'serif', fontSize: '1rem', marginLeft: '0.2rem' }}>
            BizTrack
          </div>
        </div>

        {/* Center Section: Company Name */}
        <div className="text-lg font-semibold text-center text-gray-800">
          {selectedCompanyName}
        </div>

        {/* Right Section: Date, Cart Icon */}
        <div className="flex items-center space-x-4">
          {/* <DateTimeDisplay /> */}
          
          {/* Cart Icon with Counter */}
          <div onClick={() => toggleCart()} className="relative cursor-pointer ">
            <FaShoppingCart className="text-2xl text-blue-800 mr-2" /> {/* Added padding-right */}
            {/* Dynamic Counter */}
            {state.cart.length > 0 && (
              <span className="absolute -top-3 -right-1 bg-red-500 text-white rounded-full h-4 w-4 flex items-center justify-center text-xs">
                {state.cart.length}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Conditionally render the Cart component based on the visibility */}
      {state.isCartOpen && (
        <div className="absolute top-16 right-2 w-72 bg-white shadow-lg rounded-lg p-4">
          <Cart />
        </div>
      )}

      {/* Conditionally render the ProductsPageSidePanel based on the visibility */}
      {state.isSidePanelOpen && (
        <div className="absolute top-16 left-2 w-72 bg-white shadow-lg rounded-lg p-4">
          <ProductsPageSidePanel />
        </div>
      )}
    </div>
  );
}


// import { useEffect, useState } from "react"; 
// import { useLocation, useNavigate } from "react-router-dom";
// import { getAuth, onAuthStateChanged } from "firebase/auth";
// import DateTimeDisplay from "./DateTimeDisplay";
// import { useMyContext } from '../Context/MyContext'; // Import the context
// import mylogo from "../assets/svg/mylogo.png";


// export default function Header() {
//   const { state } = useMyContext(); // Access the context state
//   const [pageState, setPageState] = useState("Sign in");
//   const [isDrawerOpen, setIsDrawerOpen] = useState(false);
//   const location = useLocation();
//   const navigate = useNavigate();
//   const auth = getAuth();

//   useEffect(() => {
//     onAuthStateChanged(auth, (user) => {
//       if (user) {
//         setPageState("Profile");
//       } else {
//         setPageState("Sign in");
//       }
//     });
//   }, [auth]);

//   useEffect(() => {
//     // Log changes in selectedCompanyName
//     console.log('Selected Company Name has changed:', state.selectedCompanyName);
//   }, [state.selectedCompanyName]);

//   function pathMatchRoute(route) {
//     return route === location.pathname;
//   }

//   const toggleDrawer = () => {
//     setIsDrawerOpen(!isDrawerOpen);
//   };

//   // Extract and capitalize the initial letter of the selected company name
//   const selectedCompanyName = state.selectedCompanyName || "";
  

//   return (
//     <div className="bg-white border-b shadow-sm sticky top-0 z-40">
//       <header className="flex justify-between items-center px-2 max-w-6xl mx-auto">
//         {/* Left section: App logo and name */}
//         <div className="flex items-center mt-2">
//         <div onClick={() => navigate("/")} className="flex items-center justify-center pb-2">
//   <img src={mylogo} alt="BizTrack Logo" className="h-12 w-12 rounded-full object-cover" />
// </div>

//           <div className="text-base font-semibold text-blue-800" style={{ fontFamily: 'serif', fontSize: '1rem', marginLeft: '0.2rem' }}>
//             BizTrack
//           </div>
//         </div>

//         {/* Center section: Company Name */}
//         <div className="text-lg font-semibold text-center text-gray-800">
//           {selectedCompanyName}
//         </div>

//         {/* Right section: Date and Drawer */}
//         <DateTimeDisplay />

//         {/* Drawer Navigation - Mobile */}
//         {isDrawerOpen && (
//           <div className="lg:hidden fixed top-0 left-0 w-full h-full bg-white opacity-95 z-50">
//             <ul className="flex flex-col items-center mt-10">
//               <li
//                 className={`cursor-pointer py-3 text-sm font-semibold text-gray-400 ${pathMatchRoute("/") && "text-black"}`}
//                 onClick={() => {
//                   navigate("/");
//                   toggleDrawer();
//                 }}
//               >
//                 Home
//               </li>
//               <li
//                 className={`cursor-pointer py-3 text-sm font-semibold text-gray-400 ${pathMatchRoute("/offers") && "text-black"}`}
//                 onClick={() => {
//                   navigate("/offers");
//                   toggleDrawer();
//                 }}
//               >
//                 Inventory
//               </li>
//               <li
//                 className={`cursor-pointer py-3 text-sm font-semibold text-gray-400 ${pathMatchRoute("/blog") && "text-black"}`}
//                 onClick={() => {
//                   navigate("/blog");
//                   toggleDrawer();
//                 }}
//               >
//                 Pos Screen
//               </li>
//               <li
//                 className={`cursor-pointer py-3 text-sm font-semibold text-gray-400 ${pathMatchRoute("/contact") && "text-black"}`}
//                 onClick={() => {
//                   navigate("/contact");
//                   toggleDrawer();
//                 }}
//               >
//                 Sales Report
//               </li>
//               {/* New Links for Services and Career */}
//               <li
//                 className={`cursor-pointer py-3 text-sm font-semibold text-gray-400 ${pathMatchRoute("/services") && "text-black"}`}
//                 onClick={() => {
//                   navigate("/services");
//                   toggleDrawer();
//                 }}
//               >
//                 Invoices/Receipt
//               </li>
//               <li
//                 className={`cursor-pointer py-3 text-sm font-semibold text-gray-400 ${pathMatchRoute("/career") && "text-black"}`}
//                 onClick={() => {
//                   navigate("/career");
//                   toggleDrawer();
//                 }}
//               >
//                 Career
//               </li>
//               <li
//                 className={`cursor-pointer py-3 text-sm font-semibold text-gray-400 ${pathMatchRoute("/offers") && "text-black"}`}
//                 onClick={() => {
//                   navigate("/offers");
//                   toggleDrawer();
//                 }}
//               >
//                 Properties
//               </li>
//               <li
//                 className={`cursor-pointer py-3 text-sm font-semibold text-gray-400 ${(pathMatchRoute("/sign-in") || pathMatchRoute("/profile")) && "text-black"}`}
//                 onClick={() => {
//                   navigate("/profile");
//                   toggleDrawer();
//                 }}
//               >
//                 {pageState}
//               </li>
//             </ul>
//           </div>
//         )}
//       </header>
//     </div>
//   );
// }