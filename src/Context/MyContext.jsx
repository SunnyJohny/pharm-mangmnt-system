import React, { createContext, useContext, useState, useEffect } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth'; // Import Firebase auth methods

const MyContext = createContext();

export const useMyContext = () => {
  return useContext(MyContext);
};

export const MyContextProvider = ({ children }) => {
  const initialState = {
 
    products: [],
    sales: [], // New array for sales data
    expenses: [], // New array for expenses data
    cart: [],
    inventoryData: [],
    productTotals: new Map(),
    overallTotalQuantity: 0,
    productTotalsMap: new Map(),
    overallTotalProductQuantity: 0,
    firstRestockedTimeMap: new Map(), // Map to store the first restocked time for each product
  };


  const [state, setState] = useState(initialState);












  const fetchExpenses = async () => {
    try {
      const expensesCollection = collection(getFirestore(), 'expenses');
      const expensesSnapshot = await getDocs(expensesCollection);
      const expensesData = expensesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setState((prevState) => ({ ...prevState, expenses: expensesData }));
      console.log('Fetching expenses...', expensesData);
    } catch (error) {
      console.error('Error fetching expenses:', error.message);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);


  const fetchProductsAndCalculateSumOfSales = async () => {
    try {
      const productsCollection = collection(getFirestore(), 'products');
      const productsSnapshot = await getDocs(productsCollection);

      let overallTotalProductQuantity = 0;
      const productTotalsMap = new Map();

      productsSnapshot.forEach((doc) => {
        const { name, quantitySold } = doc.data();

        // Assuming quantitySold is an array of objects with a 'quantity' property
        if (Array.isArray(quantitySold)) {
          const productTotal = quantitySold.reduce((sum, entry) => {
            const quantityValue = parseInt(entry.quantitySold, 10);

            // Check if quantityValue is a valid number
            if (!isNaN(quantityValue)) {
              return sum + quantityValue;
            } else {
              console.error(`Invalid quantity value for ${name}: ${entry.quantitySold}`);
              return sum; // Exclude invalid values from the sum
            }
          }, 0);

          productTotalsMap.set(name, productTotal);

          overallTotalProductQuantity += productTotal;
        }
      });

      // console.log('Product-wise Totals:');
      // productTotalsMap.forEach((total, productName) => {
      //   console.log(`${productName}: ${total}`);
      // });

      // console.log(`Overall Total Quantity: ${overallTotalProductQuantity}`);

      setState((prevState) => ({
        ...prevState,
        productTotalsMap: productTotalsMap,
        overallTotalProductQuantity: overallTotalProductQuantity,
      }));
    } catch (error) {
      console.error('Error fetching products:', error.message);
    }
  };

  useEffect(() => {
    fetchProductsAndCalculateSumOfSales();
  }, []);

  useEffect(() => {
    const fetchRestockedTimeData = async () => {
      try {
        const productsCollection = collection(getFirestore(), 'products');
        const productsSnapshot = await getDocs(productsCollection);

        let overallTotalQuantity = 0;
        const productTotalsMap = new Map();
        const firstRestockedTimeMap = new Map();

        productsSnapshot.forEach((doc) => {
          const { name, quantityRestocked } = doc.data();


          if (Array.isArray(quantityRestocked) && quantityRestocked.length > 0) {
            // Assuming each entry in quantityRestocked has a 'time' property
            const firstRestockedTime = quantityRestocked[0].time;
            firstRestockedTimeMap.set(name, firstRestockedTime);
            console.log(`First restocked time for ${name}: ${firstRestockedTime}`);
          }

          if (Array.isArray(quantityRestocked)) {
            const productTotal = quantityRestocked.reduce((sum, entry) => {
              const quantityValue = parseInt(entry.quantity, 10);

              if (!isNaN(quantityValue)) {
                return sum + quantityValue;
              } else {
                console.error(`Invalid quantity value for ${name}: ${entry.quantity}`);
                return sum;
              }
            }, 0);

            productTotalsMap.set(name, productTotal);
            overallTotalQuantity += productTotal;
          }
        });

        // console.log('Product-wise Totals:');
        // productTotalsMap.forEach((total, productName) => {
        //   console.log(`${productName}: ${total}`);
        // });

        // console.log(`Overall Total Quantity: ${overallTotalQuantity}`);

        setState((prevState) => ({
          ...prevState,
          productTotals: productTotalsMap,
          overallTotalQuantity: overallTotalQuantity,
          firstRestockedTimeMap: firstRestockedTimeMap,
        }));
      } catch (error) {
        console.error('Error fetching products:', error.message);
      }
    };

    fetchRestockedTimeData();
  }, []);




  // Code outside the useEffect
  // useEffect(() => {
  //   // Code outside the useEffect
  //   if (state.firstRestockedTimeMap) {
  //     state.firstRestockedTimeMap.forEach((firstRestockedTime, name) => {
  //       console.log(`First restocked time for ${name}: ${firstRestockedTime}`);
  //     });
  //   }
  // }, [state.firstRestockedTimeMap]);



  const fetchSalesData = async () => {
    const db = getFirestore();
    const salesCollection = collection(db, 'sales'); // Adjust the collection name if needed
    const salesSnapshot = await getDocs(salesCollection);
    const salesData = salesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return salesData;
  };



  useEffect(() => {
    const fetchSales = async () => {
      try {
        const salesData = await fetchSalesData();
        setState((prevState) => ({ ...prevState, sales: salesData }));
        console.log('fetching sales...', salesData);
      } catch (error) {
        console.error('Error fetching sales:', error);
      }
    };

    fetchSales();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      const db = getFirestore();
      const productsCollection = collection(db, 'products');

      try {
        const productsSnapshot = await getDocs(productsCollection);
        const products = productsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        // console.error('fetching products...', products);
        setState((prevState) => ({ ...prevState, products }));
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);




  useEffect(() => {
    const filterProducts = async () => {
      try {
        // Hardcoded date range and keyword for testing
        const startDate = new Date('2024-03-01');
        const endDate = new Date('2024-03-15');
        const keyword = 'zzz';

        // Filter products by keyword
        const filteredProducts = searchByKeyword(keyword);

        // Filter sales data by date range
        const filteredSales = searchByDate(state.sales, startDate, endDate);

        console.log('Filtered Products:', filteredProducts);
        console.log('Filtered Sales:', filteredSales);
      } catch (error) {
        console.error('Error filtering products:', error.message);
      }
    };

    filterProducts();
  }, [state.products, state.sales]);




  
  // Function to fetch users from Firestore
 
  // Modify the fetchUsers function to filter users by ID and log additional user data
  const fetchUsers = async (userId) => {
    try {
      const usersCollection = collection(getFirestore(), 'users'); // Assuming 'users' is the collection name
      const usersSnapshot = await getDocs(usersCollection);
      const usersData = usersSnapshot.docs
        .filter(doc => doc.id === userId) // Filter users by ID
        .map(doc => {
          const userData = { id: doc.id, ...doc.data() };
          console.log('Filtered user:', userData); // Log filtered user to console
          return userData;
        });
  
      setState(prevState => ({
        ...prevState,
        user: {
          ...prevState.user,
          ...usersData[0], // Assuming only one user is returned
        }
      }));
    } catch (error) {
      console.error('Error fetching users:', error.message);
    }
  };
  
  // useEffect hook to fetch users when component mounts
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setState(prevState => ({
          ...prevState,
          user: {
            ...prevState.user,
            userID: user.uid
          }
        }));
        fetchUsers(user.uid); // Pass the user's ID to fetchUsers
      } else {
        setState(prevState => ({
          ...prevState,
          user: {
            ...prevState.user,
            userID: ''
          }
        }));
      }
    });

    return () => unsubscribe();
  }, []);

 
  // useEffect hook to fetch users when component mounts
  useEffect(() => {
    fetchUsers();
  }, []);




  const addToCart = (productId) => {
    const productToAdd = state.products.find((product) => product.id === productId);

    if (productToAdd) {
      const existingCartItem = state.cart.find((item) => item.id === productId);
      if (existingCartItem) {
        const updatedCart = state.cart.map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
        );
        setState({ ...state, cart: updatedCart });
      } else {
        const updatedCart = [...state.cart, { ...productToAdd, quantity: 1 }];
        setState({ ...state, cart: updatedCart });
      }
    }
  };

  const removeFromCart = (productId) => {
    const updatedCart = state.cart.filter((item) => item.id !== productId);
    setState({ ...state, cart: updatedCart });
  };

  const clearCart = () => {
    setState({ ...state, cart: [] });
  };

  const increaseQuantity = (productId) => {
    const updatedCart = state.cart.map((item) =>
      item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
    );
    setState({ ...state, cart: updatedCart });
  };

  const decreaseQuantity = (productId) => {
    const existingCartItem = state.cart.find((item) => item.id === productId);
    if (existingCartItem && existingCartItem.quantity > 1) {
      const updatedCart = state.cart.map((item) =>
        item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
      );
      setState({ ...state, cart: updatedCart });
    } else {
      removeFromCart(productId);
    }
  };


  const searchByKeyword = (expenses, keyword) => {
    if (!expenses || !Array.isArray(expenses)) {
      return [];
    }

    return expenses.filter((expense) => {
      return Object.values(expense).some((value) =>
        value.toLowerCase().includes(keyword.toLowerCase())
      );
    });
  };


  const searchByDate = (items, startDate, endDate) => {
    console.log('Start Date:', startDate);
    console.log('End Date:', endDate);

    if (!startDate || !endDate) {
      return items;
    }

    return items.filter((item) => {
      const saleDate = new Date(item.date); // Assuming item.date is already a Date object or a parsable date string
      return saleDate >= startDate && saleDate <= endDate;
    });
  };






  const contextValue = {
    state,
     fetchUsers,
    searchByKeyword,
    searchByDate,
    addToCart,
    removeFromCart,
    clearCart,
    increaseQuantity,
    decreaseQuantity,
   
  };




  return <MyContext.Provider value={contextValue}>{children}</MyContext.Provider>;
};

