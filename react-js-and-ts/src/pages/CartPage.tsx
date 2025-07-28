import React from 'react';
import useCartStore from '../store/cartStore';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';

function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCartStore();

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="container mx-auto p-4 md:p-8 text-center dark:text-white">
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-lg mb-6">Looks like you haven't added anything to your cart yet.</p>
        <Link to="/home">
          <Button className="px-6 py-3 text-lg">Start Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 bg-white dark:bg-gray-800 shadow-lg rounded-lg mt-10 dark:text-white">
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8 text-center">Your Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {cart.map((item) => (
            <div key={item._id} className="flex items-center border-b border-gray-200 dark:border-gray-700 pb-4">
              <img
                src={item.image}
                alt={item.title}
                className="w-24 h-24 object-cover rounded-md mr-6"
              />
              <div className="flex-grow">
                <h2 className="text-xl font-semibold">{item.title}</h2>
                <p className="text-gray-600 dark:text-gray-400">by {item.author}</p>
                <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">${item.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  onClick={() => updateQuantity(item._id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="px-3 py-1 text-base"
                >
                  -
                </Button>
                <span className="text-lg font-medium">{item.quantity}</span>
                <Button
                  onClick={() => {
                    if (item.quantity < (item.stock || Infinity)) {
                      updateQuantity(item._id, item.quantity + 1);
                    } else {
                      alert(`Max stock is ${item.stock || 0}. You cannot add more.`);
                    }
                  }}
                  className="px-3 py-1 text-base"
                >
                  +
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => removeFromCart(item._id)}
                  className="px-3 py-1 text-base"
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1 bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Order Summary</h2>
          <div className="flex justify-between text-lg mb-3">
            <span>Total Items:</span>
            <span className="font-semibold">{totalItems}</span>
          </div>
          <div className="flex justify-between text-xl font-bold mb-6">
            <span>Total Price:</span>
            <span className="text-indigo-600 dark:text-indigo-400">${totalPrice.toFixed(2)}</span>
          </div>
          <Button className="w-full py-3 text-lg font-semibold bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
            Proceed to Checkout
          </Button>
          <Button
            variant="outline"
            onClick={clearCart}
            className="w-full py-3 text-lg font-semibold mt-4 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
          >
            Clear Cart
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CartPage;
