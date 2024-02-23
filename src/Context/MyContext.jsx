import React, { createContext, useContext, useState, useEffect } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const MyContext = createContext();

export const useMyContext = () => {
  return useContext(MyContext);
};

export const MyContextProvider = ({ children }) => {
  const initialState = {
    user: {
      name: 'John Sunday',
      position: 'Manager',
      userID: '12345',
    },
    products: [],
    sales: [], // New array for sales data
    cart: [],
    inventoryData: [],
    productTotals: new Map(),
    overallTotalQuantity: 0,
     productTotalsMap: new Map(),
    overallTotalProductQuantity: 0,
    firstRestockedTimeMap: new Map(), // Map to store the first restocked time for each product
  };


  const [state, setState] = useState(initialState);

  
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

      console.log('Product-wise Totals:');
      productTotalsMap.forEach((total, productName) => {
        console.log(`${productName}: ${total}`);
      });

      console.log(`Overall Total Quantity: ${overallTotalProductQuantity}`);

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
  
        console.log('Product-wise Totals:');
        productTotalsMap.forEach((total, productName) => {
          console.log(`${productName}: ${total}`);
        });
  
        console.log(`Overall Total Quantity: ${overallTotalQuantity}`);
  
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
  useEffect(() => {
    // Code outside the useEffect
    if (state.firstRestockedTimeMap) {
      state.firstRestockedTimeMap.forEach((firstRestockedTime, name) => {
        console.log(`First restocked time for ${name}: ${firstRestockedTime}`);
      });
    }
  }, [state.firstRestockedTimeMap]);

  
  
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
        console.error('fetching products...', products);
        setState((prevState) => ({ ...prevState, products }));
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
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


  
  const searchInventoryByKeyword = (keyword) => {
    // Implement your search logic here
    return state.products.filter((product) =>
      product.name.toLowerCase().includes(keyword.toLowerCase())
    );
  };

  const searchByDate = (startDate, endDate) => {
    // Implement your search logic here
    return state.products.filter((product) => {
      const productDate = new Date(product.date);
      return productDate >= startDate && productDate <= endDate;
    });
  };


  const contextValue = {
    state,
    searchInventoryByKeyword,
    searchByDate,
    addToCart,
    removeFromCart,
    clearCart,
    increaseQuantity,
    decreaseQuantity,
  };
 



  return <MyContext.Provider value={contextValue}>{children}</MyContext.Provider>;
};
