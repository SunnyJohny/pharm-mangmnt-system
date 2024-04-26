import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import SignIn from "./pages/SignIn";
import CompanySignUp from "./pages/CompanySignUp";
import SignUp from "./pages/SignUp";


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
import PrintSalesPage from './components/PrintSalesPage';
import AddExpense from './components/AddExpenses';
import AdminComponent from './components/Admin';



import ExpensePage from './pages/ExpensePage';


function App() {
  return (
    <>
      <Router>
        <Header />
        <Routes>
        <Route path="/admin" element={<AdminComponent />}
/>

          <Route path="/" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/company-sign-up" element={<CompanySignUp />} />

          <Route path="/posscreen" element={<PosScreen />} />
          <Route path="/add-expense" element={<AddExpense />} />
          <Route path="/expenses" element={<ExpensePage />} />



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
          <Route path="/print-sales" element={<PrintSalesPage />} />

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
