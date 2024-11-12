import { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { useNavigate } from 'react-router';
import { useMyContext } from '../Context/MyContext';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

const CompanySignUp = () => {
  const [showPassword, setShowPassword] = useState(false); 
  const { updateSelectedCompany, selectedCompany } = useMyContext();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    password: "",
    address: "", 
    phoneNumber: "", 
  });

  const [companyUpdated, setCompanyUpdated] = useState(false);

  const { companyName, email, password, address, phoneNumber } = formData;

  const onChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "companies", user.uid), {
        companyName,
        email,
        address,
        phoneNumber
      });

      updateSelectedCompany(companyName, user.uid);
      setCompanyUpdated(true);

      toast.success("Sign up was successful");
      navigate("/sign-up");
    } catch (error) {
      toast.error("Something went wrong with the registration");
    }
  };

  useEffect(() => {
    if (companyUpdated && selectedCompany) {
      navigate("/sign-up");
    }
  }, [companyUpdated, selectedCompany, navigate]);

  const toggleShowPassword = () => {
    setShowPassword((prevState) => !prevState);
  };

  const handleClose = () => {
    navigate("/ ");
  };

  return (
    <section className="flex justify-center items-center h-screen px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md relative">
        
        {/* Close Icon */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
          aria-label="Close"
        >
          &times;
        </button>
        
        <h1 className="text-3xl text-center mt-6 font-bold">Company Sign Up</h1>
        <form onSubmit={handleSignUp} className="mt-8">
          <input
            type="text"
            id="companyName"
            value={companyName}
            onChange={onChange}
            placeholder="Company Name"
            className="mb-6 w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition ease-in-out"
          />

          <input
            type="email"
            id="email"
            value={email}
            onChange={onChange}
            placeholder="Email Address"
            className="mb-6 w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition ease-in-out"
          />

          <div className="relative mb-6">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={onChange}
              placeholder="Password"
              className="w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition ease-in-out"
            />
            <button
              type="button"
              onClick={toggleShowPassword}
              className="absolute right-3 top-2 text-gray-600"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <input
            type="text"
            id="address"
            value={address}
            onChange={onChange}
            placeholder="Company Address"
            className="mb-6 w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition ease-in-out"
          />
          <input
            type="text"
            id="phoneNumber"
            value={phoneNumber}
            onChange={onChange}
            placeholder="Company Phone Number"
            className="mb-6 w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition ease-in-out"
          />

          <button
            className="w-full bg-blue-600 text-white px-7 py-3 text-sm font-medium uppercase rounded shadow-md hover:bg-blue-700 transition duration-150 ease-in-out hover:shadow-lg active:bg-blue-800"
            type="submit"
          >
            Sign Up
          </button>
        </form>
      </div>
    </section>
  );
};

export default CompanySignUp;
