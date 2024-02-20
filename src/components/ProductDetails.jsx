// ProductDetails.js
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import ProductHistory from './ProductHistory'; // Import the new component

const ProductDetails = () => {
  const { productId } = useParams();

  return (
    <div>
      <h2>Product Details</h2>
      <p>Product ID: {productId}</p>

      {/* Add a link to the product history */}
      <Link to={`/product-history/${productId}`}>View Product History</Link>

      {/* Include the ProductHistory component as a route */}
      <ProductHistory productId={productId} />
    </div>
  );
};

export default ProductDetails;
