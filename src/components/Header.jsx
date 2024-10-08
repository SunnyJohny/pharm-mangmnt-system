import { useEffect, useState } from "react"; 
import { useLocation, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import DateTimeDisplay from "./DateTimeDisplay";
import { useMyContext } from '../Context/MyContext'; // Import the context
import mylogo from "../assets/svg/mylogo.png";


export default function Header() {
  const { state } = useMyContext(); // Access the context state
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

  useEffect(() => {
    // Log changes in selectedCompanyName
    console.log('Selected Company Name has changed:', state.selectedCompanyName);
  }, [state.selectedCompanyName]);

  function pathMatchRoute(route) {
    return route === location.pathname;
  }

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  // Extract and capitalize the initial letter of the selected company name
  const selectedCompanyName = state.selectedCompanyName || "";
  const initial = selectedCompanyName.charAt(0).toUpperCase();

  return (
    <div className="bg-white border-b shadow-sm sticky top-0 z-40">
      <header className="flex justify-between items-center px-2 max-w-6xl mx-auto">
        {/* Left section: App logo and name */}
        <div className="flex items-center mt-2">
        <div onClick={() => navigate("/")} className="flex items-center justify-center pb-2">
  <img src={mylogo} alt="BizTrack Logo" className="h-12 w-12 rounded-full object-cover" />
</div>

          <div className="text-base font-semibold text-blue-800" style={{ fontFamily: 'serif', fontSize: '1rem', marginLeft: '0.2rem' }}>
            BizTrack
          </div>
        </div>

        {/* Center section: Company Name */}
        <div className="text-lg font-semibold text-center text-gray-800">
          {selectedCompanyName}
        </div>

        {/* Right section: Date and Drawer */}
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
