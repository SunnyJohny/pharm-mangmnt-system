import { useState } from "react";
import OAuth from "../components/OAuth";
import { db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { useNavigate } from 'react-router';
import { useMyContext } from '../Context/MyContext';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

const CompanySignUp = () => {
  const [showPassword, setShowPassword] = useState(false); // State for password visibility
  const { updateSelectedCompany } = useMyContext();
  const navigate = useNavigate();

  // Form data state
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    password: "",
    address: "", // Added company address field
  });

  const { companyName, email, password, address } = formData;

  // Handling form input changes
  const onChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  // Sign up handler
  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Saving company data in Firestore
      await setDoc(doc(db, "companies", user.uid), {
        companyName,
        email,
        address, // Saving the address
      });

      // Update the selected company in context
      updateSelectedCompany(companyName, user.uid);
      toast.success("Sign up was successful");

      // Redirect to sign-up page after registration
      navigate("/sign-up");
    } catch (error) {
      toast.error("Something went wrong with the registration");
    }
  };

  // Toggle password visibility
  const toggleShowPassword = () => {
    setShowPassword((prevState) => !prevState);
  };

  return (
    <section>
      <h1 className="text-3xl text-center mt-6 font-bold">Company Sign Up</h1>
      <div className="flex justify-center flex-wrap items-center px-6 py-12 max-w-6xl mx-auto">
        <div className="md:w-[67%] lg:w-[50%] mb-12 md:mb-6">
          {/* Image or additional content can be placed here */}
        </div>
        <div className="w-full md:w-[67%] lg:w-[40%] lg:ml-20">
          <form onSubmit={handleSignUp}>
            {/* Company Name Input */}
            <input
              type="text"
              id="companyName"
              value={companyName}
              onChange={onChange}
              placeholder="Company Name"
              className="mb-6 w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition ease-in-out"
            />

            {/* Email Input */}
            <input
              type="email"
              id="email"
              value={email}
              onChange={onChange}
              placeholder="Email Address"
              className="mb-6 w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition ease-in-out"
            />

            {/* Password Input */}
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

            {/* Address Input */}
            <input
              type="text"
              id="address"
              value={address}
              onChange={onChange}
              placeholder="Company Address"
              className="mb-6 w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition ease-in-out"
            />

            {/* Submit Button */}
            <button
              className="w-full bg-blue-600 text-white px-7 py-3 text-sm font-medium uppercase rounded shadow-md hover:bg-blue-700 transition duration-150 ease-in-out hover:shadow-lg active:bg-blue-800"
              type="submit"
            >
              Sign Up
            </button>

            
          </form>
        </div>
      </div>
    </section>
  );
};

export default CompanySignUp;
