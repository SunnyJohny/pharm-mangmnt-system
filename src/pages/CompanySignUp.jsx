// import { useState } from "react";
// import { auth, db } from "../firebase";
// // import {
// //   getAuth,
// //   createUserWithEmailAndPassword,
// //   updateProfile,
// // } from "firebase/auth";

// const CompanySignUp = () => {
//   const [companyName, setCompanyName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [address, setAddress] = useState("");
//   const [error, setError] = useState(null);

//   const handleSignUp = async (e) => {
//     e.preventDefault();
//     try {
//       const { user } = await auth.createUserWithEmailAndPassword(email, password);
//       await db.collection("companies").doc(user.uid).set({
//         companyName,
//         email,
//         address,
//         // Add more fields as needed
//       });
//       // await user.sendEmailVerification();
//     } catch (error) {
//       setError(error.message);
//       console.log(error);
//     }
//   };
  
  

//   return (
//     <div className="flex items-center justify-center min-h-screen">
//       <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
//         <h2 className="text-2xl font-semibold mb-4">Company Sign Up</h2>
//         {error && <div className="text-red-500 mb-4">{error}</div>}
//         <form onSubmit={handleSignUp}>
//           <div className="mb-4">
//             <label className="block text-gray-700 text-sm font-bold mb-2">Company Name</label>
//             <input
//               type="text"
//               value={companyName}
//               onChange={(e) => setCompanyName(e.target.value)}
//               className="border rounded-md w-full p-2"
//               required
//             />
//           </div>
//           <div className="mb-4">
//             <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
//             <input
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="border rounded-md w-full p-2"
//               required
//             />
//           </div>
//           <div className="mb-4">
//             <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
//             <input
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="border rounded-md w-full p-2"
//               required
//             />
//           </div>
//           <div className="mb-4">
//             <label className="block text-gray-700 text-sm font-bold mb-2">Address</label>
//             <input
//               type="text"
//               value={address}
//               onChange={(e) => setAddress(e.target.value)}
//               className="border rounded-md w-full p-2"
//               required
//             />
//           </div>
//           <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
//             Sign Up
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default CompanySignUp;




import { useState } from "react";
import { AiFillEyeInvisible, AiFillEye } from "react-icons/ai";
import { Link } from "react-router-dom";
import OAuth from "../components/OAuth";
// import { createUserWithEmailAndPassword } from "firebase/auth";
import { db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
const CompanySignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    password: "",
    address: "",
  });
  const { companyName, email, password, address } = formData;
  const navigate = useNavigate();

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
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      await setDoc(doc(db, "companies", user.uid), {
        companyName,
        email,
        address,
      });
      // navigate("/"); // Redirect to homepage after signup
      toast.success("Sign up was successful");
    } catch (error) {
      toast.error("Something went wrong with the registration");
    }
  };

  return (
    <section>
      <h1 className="text-3xl text-center mt-6 font-bold">Company Sign Up</h1>
      <div className="flex justify-center flex-wrap items-center px-6 py-12 max-w-6xl mx-auto">
        <div className="md:w-[67%] lg:w-[50%] mb-12 md:mb-6">
          {/* Your image */}
        </div>
        <div className="w-full md:w-[67%] lg:w-[40%] lg:ml-20">
          <form onSubmit={handleSignUp}>
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
              {/* Your show/hide password logic */}
            </div>
            <input
              type="text"
              id="address"
              value={address}
              onChange={onChange}
              placeholder="Address"
              className="mb-6 w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition ease-in-out"
            />
            {/* Your existing sign up button */}
            <button
              className="w-full bg-blue-600 text-white px-7 py-3 text-sm font-medium uppercase rounded shadow-md hover:bg-blue-700 transition duration-150 ease-in-out hover:shadow-lg active:bg-blue-800"
              type="submit"
            >
              Sign up
            </button>
            {/* Your existing OAuth component */}
            <OAuth />
          </form>
        </div>
      </div>
    </section>
  );
};

export default CompanySignUp;

