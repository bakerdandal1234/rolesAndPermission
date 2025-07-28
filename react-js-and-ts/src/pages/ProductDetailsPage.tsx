import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../lib/axios';
import type { Book } from '../types/book';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

import useCartStore from '../store/cartStore';

function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Book | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);
  const addToCart = useCartStore((state) => state.addToCart);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axiosInstance.get(`api/books/${id}`);
        setProduct(response.data);
        setSelectedImage(response.data.image);
        console.log("Product details:", response.data);
        console.log("Product stock:", response.data.stock);
      } catch (err) {
        setError('Failed to fetch product details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  if (!product) {
    return <div className="text-center py-10">Product not found.</div>;
  }

 console.log("product", product);
  return (
    <div className="container mx-auto p-4 md:p-8 bg-white dark:bg-gray-800 shadow-lg rounded-lg mt-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
        {/* Product Image */}
        <div>
          <div className="flex justify-center items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
            <img
              src={product.image}
              alt={product.title}
              className="max-w-full h-auto rounded-lg object-contain"
              style={{ maxHeight: '500px' }}
            />
          </div>
        </div>

        {/* Product Details */}
        <div className="flex flex-col justify-between h-full">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
              {product.title}
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-4">
              by <span className="font-semibold">{product.author}</span>
            </p>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              {product.summary}
            </p>
            <p className="text-5xl font-bold text-indigo-600 dark:text-indigo-400 mb-6">
              ${product.price.toFixed(2)}
            </p>
          </div>

          {/* Quantity and Add to Cart */}
          <div className="flex flex-col space-y-6">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 text-lg font-bold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                -
              </Button>
              <Input
                type="number"
                value={quantity}
                readOnly
                className="w-20 text-center text-xl font-semibold border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
              <Button
                onClick={() => {
                  if (quantity < (product.stock || 0)) {
                    setQuantity(quantity + 1);
                  } else {
                    alert(`Max stock is ${product.stock || 0}. You cannot add more.`);
                  }
                }}
                className="px-4 py-2 text-lg font-bold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                +
              </Button>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                ({product.stock} in stock)
              </span>
            </div>
            <Button
              onClick={() => {
                addToCart(product, quantity);
                navigate('/cart');
              }}
              className="w-full py-3 text-xl font-semibold bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-md"
              size="lg"
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailsPage;


