// import { useState, useEffect } from "react";
// import { db } from "../firebase";
// import { doc, setDoc } from "firebase/firestore";
// import { toast } from "react-toastify";
// import { useNavigate } from 'react-router';
// import { useMyContext } from '../Context/MyContext';
// import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

// const CompanySignUp = () => {
//   const [showPassword, setShowPassword] = useState(false); 
//   const { updateSelectedCompany, selectedCompany } = useMyContext();
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     companyName: "",
//     email: "",
//     password: "",
//     address: "", 
//     phoneNumber: "", 
//   });

//   const [companyUpdated, setCompanyUpdated] = useState(false);

//   const { companyName, email, password, address, phoneNumber } = formData;

//   const onChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.id]: e.target.value,
//     });
//   };

//   const handleSignUp = async (e) => {
//     e.preventDefault();
//     try {
//       const auth = getAuth();
//       const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//       const user = userCredential.user;

//       // Generate registration date
//       const registrationDate = new Date().toISOString(); // ISO format (e.g., 2024-11-12T12:00:00Z)

//       await setDoc(doc(db, "companies", user.uid), {
//         companyName,
//         email,
//         address,
//         phoneNumber,
//         registrationDate, // Add the registration date field
//       });

//       updateSelectedCompany(companyName, user.uid);
//       setCompanyUpdated(true);

//       toast.success("Sign up was successful");
//       navigate("/sign-up");
//     } catch (error) {
//       toast.error("Something went wrong with the registration");
//     }
//   };

//   useEffect(() => {
//     if (companyUpdated && selectedCompany) {
//       navigate("/sign-up");
//     }
//   }, [companyUpdated, selectedCompany, navigate]);

//   const toggleShowPassword = () => {
//     setShowPassword((prevState) => !prevState);
//   };

//   const handleClose = () => {
//     navigate("/ ");
//   };

//   return (
//     <section className="flex justify-center items-center h-screen px-4 sm:px-6 lg:px-8">
//       <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md relative">

//         {/* Close Icon */}
//         <button 
//           onClick={handleClose}
//           className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
//           aria-label="Close"
//         >
//           &times;
//         </button>

//         <h1 className="text-3xl text-center mt-6 font-bold">Company Sign Up</h1>
//         <form onSubmit={handleSignUp} className="mt-8">
//           <input
//             type="text"
//             id="companyName"
//             value={companyName}
//             onChange={onChange}
//             placeholder="Company Name"
//             className="mb-6 w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition ease-in-out"
//           />

//           <input
//             type="email"
//             id="email"
//             value={email}
//             onChange={onChange}
//             placeholder="Email Address"
//             className="mb-6 w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition ease-in-out"
//           />

//           <div className="relative mb-6">
//             <input
//               type={showPassword ? "text" : "password"}
//               id="password"
//               value={password}
//               onChange={onChange}
//               placeholder="Password"
//               className="w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition ease-in-out"
//             />
//             <button
//               type="button"
//               onClick={toggleShowPassword}
//               className="absolute right-3 top-2 text-gray-600"
//             >
//               {showPassword ? "Hide" : "Show"}
//             </button>
//           </div>

//           <input
//             type="text"
//             id="address"
//             value={address}
//             onChange={onChange}
//             placeholder="Company Address"
//             className="mb-6 w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition ease-in-out"
//           />
//           <input
//             type="text"
//             id="phoneNumber"
//             value={phoneNumber}
//             onChange={onChange}
//             placeholder="Company Phone Number"
//             className="mb-6 w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition ease-in-out"
//           />

//           <button
//             className="w-full bg-blue-600 text-white px-7 py-3 text-sm font-medium uppercase rounded shadow-md hover:bg-blue-700 transition duration-150 ease-in-out hover:shadow-lg active:bg-blue-800"
//             type="submit"
//           >
//             Sign Up
//           </button>
//         </form>
//       </div>
//     </section>
//   );
// };

// export default CompanySignUp;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useMyContext } from "../Context/MyContext";
import { toast } from "react-toastify";
import Spinner from "../components/Spinner";

const ConfirmDialog = ({ onConfirm, onCancel }) => (
  <div>
    <p>Are you sure you want to delete this company?</p>
    <div className="flex justify-around mt-4">
      <button
        onClick={onConfirm}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        Yes
      </button>
      <button
        onClick={onCancel}
        className="bg-gray-300 text-black px-4 py-2 rounded"
      >
        No
      </button>
    </div>
  </div>
);

const InputField = ({ id, type, value, onChange, placeholder }) => (
  <input
    type={type}
    id={id}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className="mb-6 w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition ease-in-out"
  />
);

export default function CompanySignUp() {
  const { state, updateSelectedCompany } = useMyContext();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    password: "",
    address: "",
    phoneNumber: "",
  });
  const [companyUpdated, setCompanyUpdated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const { companyName, email, password, address, phoneNumber } = formData;

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "companies", user.uid), {
        companyName,
        email,
        address,
        phoneNumber,
        registrationDate: new Date().toISOString(),
      });

      updateSelectedCompany(companyName, user.uid);
      setCompanyUpdated(true);
      toast.success("Sign up was successful");
    } catch (error) {
      toast.error("Something went wrong with the registration");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (companyId) => {
    toast.info(
      ({ closeToast }) => (
        <ConfirmDialog
          onConfirm={async () => {
            try {
              await deleteDoc(doc(db, "companies", companyId));
              toast.success("Company deleted successfully");
              closeToast();
            } catch {
              toast.error("Failed to delete company. Please try again later.");
            }
          }}
          onCancel={closeToast}
        />
      ),
      { position: toast.POSITION.TOP_CENTER, autoClose: false }
    );
  };

  useEffect(() => {
    if (companyUpdated) navigate("/sign-up");
  }, [companyUpdated, navigate]);

  const toggleShowPassword = () => setShowPassword((prev) => !prev);

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ companyName: "", email: "", password: "", address: "", phoneNumber: "" });
  };

  if (loading) return <Spinner />;

  return (
    <>
      <div className="flex justify-between items-center m-4">
        <button onClick={() => window.location.reload()} className="p-2 bg-gray-200 rounded">
          Reload
        </button>
        <h1 className="flex-1 text-center text-xl font-bold">COMPANIES</h1>
        <button onClick={() => navigate("/")} className="p-2 bg-gray-200 rounded">
          Back
        </button>
      </div>

      {isModalOpen && (
        <section className="flex justify-center items-center h-screen px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md relative">
            <button onClick={closeModal} className="absolute top-4 right-4 text-gray-600 hover:text-gray-900">
              &times;
            </button>
            <h1 className="text-3xl text-center mt-6 font-bold">Company Sign Up</h1>
            <form onSubmit={handleSignUp} className="mt-8">
              <InputField id="companyName" type="text" value={companyName} onChange={handleChange} placeholder="Company Name" />
              <InputField id="email" type="email" value={email} onChange={handleChange} placeholder="Email Address" />
              <div className="relative mb-6">
                <InputField
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={handleChange}
                  placeholder="Password"
                />
                <button type="button" onClick={toggleShowPassword} className="absolute right-3 top-2 text-gray-600">
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <InputField id="address" type="text" value={address} onChange={handleChange} placeholder="Company Address" />
              <InputField id="phoneNumber" type="text" value={phoneNumber} onChange={handleChange} placeholder="Company Phone Number" />
              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-7 py-3 text-sm font-medium uppercase rounded shadow-md hover:bg-blue-700 transition duration-150 ease-in-out"
              >
                Sign Up
              </button>
            </form>
          </div>
        </section>
      )}

{!isModalOpen && (
  <div className="overflow-x-auto">
    <table className="min-w-full bg-white border">
      <thead>
        <tr>
          <th className="px-4 py-2 border">S/N</th>
          <th className="px-4 py-2 border">Company Name</th>
          <th className="px-4 py-2 border">Email</th>
          <th className="px-4 py-2 border">Address</th>
          <th className="px-4 py-2 border">Phone Number</th>
          <th className="px-4 py-2 border">Registration Date</th>
          <th className="px-4 py-2 border">Actions</th>
        </tr>
      </thead>
      <tbody>
        {state.companies.map((company, index) => (
          <tr key={company.id}>
            <td className="border px-4 py-2">{index + 1}</td>
            <td className="border px-4 py-2">{company.companyName}</td>
            <td className="border px-4 py-2">{company.email}</td>
            <td className="border px-4 py-2">{company.address}</td>
            <td className="border px-4 py-2">{company.phoneNumber}</td>
            <td className="border px-4 py-2">{company.registrationDate}</td>
            <td className="border px-4 py-2 flex space-x-2">
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-yellow-500 text-white px-2 py-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(company.id)}
                className="bg-red-500 text-white px-2 py-1 rounded"
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    <div className="flex justify-center p-2 mb-12 space-x-4">
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-blue-600 text-white px-7 py-3 text-sm font-medium rounded shadow-md hover:bg-blue-700 transition duration-150 ease-in-out hover:shadow-lg active:bg-blue-800"
      >
        Add Company
      </button>

      <button
        onClick={() => console.log("printing")}
        className="bg-green-600 text-white px-7 py-3 text-sm font-medium uppercase rounded shadow-md hover:bg-green-700 transition duration-150 ease-in-out hover:shadow-lg active:bg-green-800"
      >
        Print Companies
      </button>

      <button
        onClick={() => navigate('/')}
        className="bg-red-600 text-white px-7 py-3 text-sm font-medium uppercase rounded shadow-md hover:bg-red-700 transition duration-150 ease-in-out hover:shadow-lg active:bg-red-800"
      >
        Go to Sign In
      </button>
    </div>
  </div>
)}


      {/* <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-12 right-4 bg-blue-600 text-white px-4 py-2 rounded-full shadow hover:bg-blue-700"
      >
        Add Company
      </button> */}

    </>
  );
}
