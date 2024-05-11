import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import DateTimeDisplay from "./DateTimeDisplay";


export default function Header() {
  const [pageState, setPageState] = useState("Sign in");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setPageState("Profile");
      } else {
        setPageState("Sign in");
      }
    });
  }, [auth]);

  function pathMatchRoute(route) {
    return route === location.pathname;
  }

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <div className="bg-white border-b shadow-sm sticky top-0 z-40">
      <header className="flex justify-between items-center px-2 max-w-6xl mx-auto">
      <div className="flex items-center mt-2">
  <div
    onClick={() => navigate("/")}
    className="w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center cursor-pointer mr-1 mb-2"
    style={{ fontStyle: 'italic', color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}
  >
    N
  </div>

  <div className="text-base font-semibold text-blue-800" style={{ fontFamily: 'serif', fontSize: '1rem', marginLeft: '0.2rem' }}>
  NENYURKA NIGERIA LIMITED
  </div>
</div>

        {/* Mobile Menu Button
        <div className="lg:hidden">
          <button
            className="text-gray-500"
            onClick={toggleDrawer}
          >
            ☰
          </button>
        </div> */}

        {/* Navigation Links - Desktop
        <div className="hidden lg:flex">
          <ul className="flex space-x-10">
            <li
              className={`cursor-pointer py-3 text-sm font-semibold text-gray-400 border-b-[3px] border-b-transparent ${pathMatchRoute("/") && "text-black border-b-red-500"}`}
              onClick={() => navigate("/")}
            >
              Home
            </li>
            <li
              className={`cursor-pointer py-3 text-sm font-semibold text-gray-400 border-b-[3px] border-b-transparent ${pathMatchRoute("/offers") && "text-black border-b-red-500"}`}
              onClick={() => navigate("/offers")}
            >
              Inventory Page
            </li>
            <li
              className={`cursor-pointer py-3 text-sm font-semibold text-gray-400 border-b-[3px] border-b-transparent ${pathMatchRoute("/blog") && "text-black border-b-red-500"}`}
              onClick={() => navigate("/blog")}
            >
              Sales Report
            </li>
            <li
              className={`cursor-pointer py-3 text-sm font-semibold text-gray-400 border-b-[3px] border-b-transparent ${pathMatchRoute("/contact") && "text-black border-b-red-500"}`}
              onClick={() => navigate("/contact-page")}
            >
             Products  Page
            </li>
            <li
              className={`cursor-pointer py-3 text-sm font-semibold text-gray-400 border-b-[3px] border-b-transparent ${pathMatchRoute("/offers") && "text-black border-b-red-500"}`}
              onClick={() => navigate("/offers")}
            >
              Properties
            </li>
            <li
              className={`cursor-pointer py-3 text-sm font-semibold text-gray-400 ${(pathMatchRoute("/sign-in") || pathMatchRoute("/profile")) && "text-black border-b-red-500"}`}
              onClick={() => navigate("/profile")}
            >
              {pageState}
            </li>
            {/* New Links for Services and Career */}
            {/* <li
              className={`cursor-pointer py-3 text-sm font-semibold text-gray-400 ${pathMatchRoute("/services") && "text-black border-b-red-500"}`}
              onClick={() => navigate("/services")}
            >
              Services
            </li>
            <li
              className={`cursor-pointer py-3 text-sm font-semibold text-gray-400 ${pathMatchRoute("/career") && "text-black border-b-red-500"}`}
              onClick={() => navigate("/career")}
            >
              Career
            </li>
          </ul>
        </div> */} 
       <DateTimeDisplay />

        {/* Drawer Navigation - Mobile */}
        {isDrawerOpen && (
          <div className="lg:hidden fixed top-0 left-0 w-full h-full bg-white opacity-95 z-50">
            <ul className="flex flex-col items-center mt-10">
              <li
                className={`cursor-pointer py-3 text-sm font-semibold text-gray-400 ${pathMatchRoute("/") && "text-black"}`}
                onClick={() => {
                  navigate("/");
                  toggleDrawer();
                }}
              >
                Home
              </li>
              <li
                className={`cursor-pointer py-3 text-sm font-semibold text-gray-400 ${pathMatchRoute("/offers") && "text-black"}`}
                onClick={() => {
                  navigate("/offers");
                  toggleDrawer();
                }}
              >
               Inventory
              </li>
              <li
                className={`cursor-pointer py-3 text-sm font-semibold text-gray-400 ${pathMatchRoute("/blog") && "text-black"}`}
                onClick={() => {
                  navigate("/blog");
                  toggleDrawer();
                }}
              >
              Pos Screen
              </li>
              <li
                className={`cursor-pointer py-3 text-sm font-semibold text-gray-400 ${pathMatchRoute("/contact") && "text-black"}`}
                onClick={() => {
                  navigate("/contact");
                  toggleDrawer();
                }}
              >
               Sales Report
              </li>
               {/* New Links for Services and Career */}
               <li
                className={`cursor-pointer py-3 text-sm font-semibold text-gray-400 ${pathMatchRoute("/services") && "text-black"}`}
                onClick={() => {
                  navigate("/services");
                  toggleDrawer();
                }}
              >
               Invoices/Receipt
              </li>
              <li
                className={`cursor-pointer py-3 text-sm font-semibold text-gray-400 ${pathMatchRoute("/career") && "text-black"}`}
                onClick={() => {
                  navigate("/career");
                  toggleDrawer();
                }}
              >
                Career
              </li>
              <li
                className={`cursor-pointer py-3 text-sm font-semibold text-gray-400 ${pathMatchRoute("/offers") && "text-black"}`}
                onClick={() => {
                  navigate("/offers");
                  toggleDrawer();
                }}
              >
                Properties
              </li>
              <li
                className={`cursor-pointer py-3 text-sm font-semibold text-gray-400 ${(pathMatchRoute("/sign-in") || pathMatchRoute("/profile")) && "text-black"}`}
                onClick={() => {
                  navigate("/profile");
                  toggleDrawer();
                }}
              >
                {pageState}
              </li>
             
            </ul>
          </div>
        )}
      </header>
    </div>
  );
}
