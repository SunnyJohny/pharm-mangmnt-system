import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import SignIn from "./pages/SignIn";
import PrivateRoute from "./components/PrivateRoute";
import Header from "./components/Header";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "./components/Footer";
import InventoryPage from "./pages/InventoryPage";
import PosScreen from "./pages/PosScreen";
import AddProduct from "./components/AddProducts";
import ProductDetails from "./components/ProductDetails";
import ProductHistory from './components/ProductHistory';
import PrintInventoryPage from './components/PrintInventoryPage';
import SalesPage from './pages/SalesPage';


function App() {
  return (
    <>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<SignIn />} />
          <Route path="/posscreen" element={<PosScreen />} />
          
          {/* Add a PrivateRoute for the profile page */}
          <Route path="/profile" element={<PrivateRoute />}>
            {/* <Route path="/" element={<Profile />} /> */}
          </Route>

          <Route path="/inventory-page" element={<InventoryPage />} />
          <Route path="/sales" element={<SalesPage />} />

          <Route path="/add-product" element={<AddProduct />} />
          {/* Add a route for the product details page */}
          <Route path="/product-details/:productId" element={<ProductDetails />} />
          
          <Route path="/product-history/:productId" element={<ProductHistory />} />
          <Route path="/print-inventory" element={<PrintInventoryPage />} />

      
        </Routes>
        <Footer />
      </Router>
      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </>
  );
}

export default App;
