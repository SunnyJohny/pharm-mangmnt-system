import { useState } from "react";
import { AiFillEyeInvisible, AiFillEye } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, getAuth } from "firebase/auth";
import { db } from "../firebase";
import { toast } from "react-toastify";
import { useMyContext } from '../Context/MyContext';

export default function SignIn() {
  const { state, setState } = useMyContext(); // Access the context state
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { email, password } = formData;
  const navigate = useNavigate();
  function onChange(e) {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  }
 
  
  

  async function onSubmit(e) {
    e.preventDefault();
    const { email, password } = formData; // Assuming you have formData state defined
  
    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
  
      if (userCredential.user) {
  
        console.log(userCredential.user);
  
        // Fetch additional user data from Firestore
        const userData = await getUserData(userCredential.user.uid);
        console.log("User data:", userData);
  
        // Update the context state with the fetched user data
        if (userData) {
          setState(prevState => ({
            ...prevState,
            user: userData,
          }));
        }
  
        // Conditional rendering based on user data
        if (state.user) {
        toast.success("Correct user credentials");

          if (state.user.role === 'admin') {
            navigate("/admin");
          } else {
            navigate("/posscreen");
          }
        } else {
          // Handle the case where user data is not yet available (optional: loading indicator)
          // toast.warning("Please Try Again");
        }
      }
    } catch (error) {
      toast.error("Bad user credentials");
      console.log(error);
    }
  }
  


  async function getUserData(userId) {
    try {
      // Get the document reference for the user document in the "users" collection
      const userDocRef = db.collection("users").doc(userId);
      const userDocSnapshot = await userDocRef.get();

      if (userDocSnapshot.exists()) {
        // Return user data
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


  

  return (
    <section>
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
            <div className="flex justify-between whitespace-nowrap text-sm sm:text-lg">
              <p className="mb-6">
                Don't have a account?
                <Link
                  to="/company-sign-up"
                  className="text-red-600 hover:text-red-700 transition duration-200 ease-in-out ml-1"
                >
                  Register
                </Link>
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