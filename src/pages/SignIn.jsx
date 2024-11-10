import { useState } from "react";
import { AiFillEyeInvisible, AiFillEye } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, getAuth } from "firebase/auth";
import { db } from "../firebase"; // Ensure db is properly initialized
import { toast } from "react-toastify";
import { useMyContext } from '../Context/MyContext';
import { doc, getDoc } from "firebase/firestore"; // Import Firestore functions


// Remember to remove company dropdown at the end of the work

export default function SignIn() {
  const { state, setState, updateSelectedCompany } = useMyContext(); // Access the context state
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    companyName: "", // Add companyName to formData state
    companyId: ""    // Add companyId to formData state
  });
  const { email, password, companyName, companyId } = formData;
  const navigate = useNavigate();

  function onChange(e) {
    const { id, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [id]: value,
    }));

    // Update selected company name and ID in the context state
    if (id === 'companyName') {
      const selectedCompany = state.companies.find(company => company.companyName === value);
      if (selectedCompany) {
        updateSelectedCompany(value, selectedCompany.id);
        setFormData(prevState => ({
          ...prevState,
          companyId: selectedCompany.id
        }));
        console.log("Selected company updated to:", value, "with ID:", selectedCompany.id);
      }
    }
  }

  async function onSubmit(e) {
    e.preventDefault();

    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      if (userCredential.user) {
        console.log("User credential:", userCredential.user);

        // Fetch additional user data from Firestore
        const userData = await getUserData(userCredential.user.uid);
        console.log("User data:", userData);

        // Update the context state with the fetched user data
        if (userData) {
          setState(prevState => ({
            ...prevState,
            user: userData,
          }));

          // Conditional rendering based on user data
          if (userData.role === 'admin') {
            navigate("/admin");
          } else {
            navigate("/posscreen");
          }
        } else {
          // Handle the case where user data is not yet available (optional: loading indicator)
          toast.warning("Please Try Again");
        }
      }
    } catch (error) {
      // More detailed error handling
      if (error.code === 'auth/user-not-found') {
        toast.error("No user found with this email. Please check your email or sign up.");
      } else if (error.code === 'auth/wrong-password') {
        toast.error("Incorrect password. Please try again.");
      } else {
        toast.error("Failed to sign in. Please try again later.");
      }
      console.log("Error details:", error); // This will help debug further
    }
  }


  async function getUserData(userId) {
    try {
      // Ensure the correct Firestore path
      const userDocRef = doc(db, "companies", companyId, "users", userId); // Ensure you're fetching from the right company
      const userDocSnapshot = await getDoc(userDocRef);

      if (userDocSnapshot.exists()) {
        return userDocSnapshot.data();
      } else {
        console.log("User document does not exist");
        return null;
      }
    } catch (error) {
      console.error("Error getting user data:", error);
      return null;
    }
  }

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <section>
       <button
          onClick={handleReload}
          className="p-2 bg-gray-200 rounded"
        >
          Reload
        </button>
      <h1 className="text-3xl text-center mt-6 font-bold">Sign In</h1>
      <div className="flex justify-center flex-wrap items-center px-6 py-12 max-w-6xl mx-auto">
        <div className="md:w-[67%] lg:w-[50%] mb-12 md:mb-6">
          <img
            src="https://images.unsplash.com/flagged/photo-1564767609342-620cb19b2357?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1373&q=80"
            alt="key"
            className="w-full rounded-2xl"
          />
        </div>
        <div className="w-full md:w-[67%] lg:w-[40%] lg:ml-20">
          <form onSubmit={onSubmit}>
            <input
              type="email"
              id="email"
              value={email}
              onChange={onChange}
              placeholder="Email address"
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
              {showPassword ? (
                <AiFillEyeInvisible
                  className="absolute right-3 top-3 text-xl cursor-pointer"
                  onClick={() => setShowPassword((prevState) => !prevState)}
                />
              ) : (
                <AiFillEye
                  className="absolute right-3 top-3 text-xl cursor-pointer"
                  onClick={() => setShowPassword((prevState) => !prevState)}
                />
              )}
            </div>
            <select
              id="companyName"
              value={companyName}
              onChange={onChange}
              className="mb-6 w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition ease-in-out"
            >
              <option value="">Select Company</option>
              {state.companies.map((company) => (
                <option
                  key={company.id}
                  value={company.companyName}
                  disabled={companyName && company.companyName !== companyName} // Disable if company is selected and not the current one
                >
                  {company.companyName}
                </option>
              ))}
            </select>

            <div className="flex justify-between whitespace-nowrap text-sm sm:text-lg">
            <p className="mb-6">
      Don't have an account?
      <button
        type="button"
        className="text-red-600 hover:text-red-700 transition duration-200 ease-in-out ml-1 underline"
        onClick={() => {
          const password = prompt("Enter authorization password to proceed:");
          if (password === "deancoonz28@john") {
            navigate("/company-sign-up"); // Redirect if password is correct
          } else {
            alert("Wrong authorization password. Access denied.");
          }
        }}
      >
        Register
      </button>
    </p>
              <p>
                <Link
                  to="/forgot-password"
                  className="text-blue-600 hover:text-blue-800 transition duration-200 ease-in-out"
                >
                  Forgot password?
                </Link>
              </p>
            </div>
            <button
              className="w-full bg-blue-600 text-white px-7 py-3 text-sm font-medium uppercase rounded shadow-md hover:bg-blue-700 transition duration-150 ease-in-out hover:shadow-lg active:bg-blue-800"
              type="submit"
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
