
import InventoryPage from '../pages/InventoryPage';



const AdminComponent = () => {
    // Access the context

  
    
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