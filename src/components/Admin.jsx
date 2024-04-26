import React, { useEffect, useState } from 'react';
import { useMyContext } from '../Context/MyContext';
import InventoryPage from '../pages/InventoryPage';



const AdminComponent = () => {
    // Access the context
    const { state } = useMyContext();
  
    
      return (
        <div>
          {/* Admin-specific content */}
          <h1>Welcome, Admin!</h1>
          <InventoryPage />

          {/* Other admin-specific components */}
        </div>
      );
   
  };

  export default AdminComponent;