// import React from 'react';

// const ExpenseInvoiceModal = ({ expenseInfo, onClose }) => {
//   if (!expenseInfo) {
//     return null; // Return null if expenseInfo is not provided
//   }

//   const { receiptFile } = expenseInfo;

//   const handlePrint = () => {
//     window.print();
//     console.log('printing...');
//   };

//   return (
//     <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
//       <div className="bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full">
//         <div className="modal">
//           <div className="modal-content">
//             <span className="close" onClick={onClose}>&times;</span>
//             {/* Display the receipt image */}
//             <img src={receiptFile} alt="Receipt" style={{ maxWidth: '100%', maxHeight: '70vh' }} />
//             <div className="flex justify-between mt-4">
//               <button className="bg-blue-500 text-white px-4 py-2 rounded-md" onClick={handlePrint}>
//                 Print
//               </button>
//               <button className="bg-red-500 text-white px-4 py-2 rounded-md" onClick={onClose}>
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ExpenseInvoiceModal;





import React, { useEffect, useState } from 'react';
import { useMyContext } from '../Context/MyContext';

const ExpenseInvoiceModal = ({ expenseInfo, onClose }) => {
  const { state } = useMyContext();
  const [selectedExpense, setSelectedExpense] = useState(null);

  useEffect(() => {
    setSelectedExpense(expenseInfo);
    console.log(expenseInfo);
  }, [expenseInfo]);

  if (!selectedExpense) {
    return null; // Add a check and handle case where selectedExpense is null
  }
  

  const {
    id,
    receiptFile
  } = selectedExpense;

  // Add checks for properties that might be undefined
  const expenseId = id || 'N/A';
  const receiptImg= receiptFile|| 'N/A';
 
  

  const handlePrint = () => {
    window.print();
    console.log('printing...');
  };

  return (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full">
            <div className="modal">
              <div className="modal-content">
                <span className="close" onClick={onClose}>&times;</span>
                {/* Display the receipt image */}
                <img src={receiptFile} alt="Receipt" style={{ maxWidth: '100%', maxHeight: '70vh' }} />
                <hr className="my-4" />
          <p className="text-center">Expense Id: <strong>{id}</strong></p>
          <hr className="my-4" />
                <div className="flex justify-between mt-4">
                  <button className="bg-blue-500 text-white px-4 py-2 rounded-md" onClick={handlePrint}>
                    Print
                  </button>
                  <button className="bg-red-500 text-white px-4 py-2 rounded-md" onClick={onClose}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
};

export default ExpenseInvoiceModal;
