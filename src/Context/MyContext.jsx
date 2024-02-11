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
  };

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

  const [state, setState] = useState(initialState);

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

  const contextValue = {
    state,
    addToCart,
    removeFromCart,
    clearCart,
    increaseQuantity,
    decreaseQuantity,
  };

  return <MyContext.Provider value={contextValue}>{children}</MyContext.Provider>;
};
