import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import { useOrderStore } from '../store/orderStore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import PaymentForm from '../components/PaymentForm';

function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, fetchCart, total, clearCart } = useCartStore();
  const { createOrder, loading: orderLoading, error: orderError } = useOrderStore();

  const [shippingAddress, setShippingAddress] = useState({
    address: '',
    city: '',
    postalCode: '',
    country: '',
  });

  const handlePaymentSuccess = (paymentMethodId: string) => {
    handlePlaceOrder(paymentMethodId);
  };

  const handlePaymentError = (error: string) => {
    alert(`Payment error: ${error}`);
  };

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async (stripePaymentMethodId: string) => {
    if (cart.length === 0) {
      alert('Your cart is empty. Please add items before checking out.');
      return;
    }

    if (!shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.country) {
      alert('Please fill in all shipping address fields.');
      return;
    }

    const orderData = {
      shippingAddress,
      paymentMethod: 'Stripe', // Hardcode as Stripe for now
      stripePaymentMethodId, // Pass the Stripe PaymentMethod ID to the backend
    };

    const order = await createOrder(orderData);
    if (order) {
      alert('Order placed successfully!');
      clearCart(); // Clear cart after successful order
      navigate(`/order-history`); // Navigate to order history or order confirmation page
    } else {
      alert(`Failed to place order: ${orderError || 'Unknown error'}`);
    }
  };

  if (cart.length === 0 && !orderLoading) {
    return (
      <div className="container mx-auto p-4 md:p-8 text-center dark:text-white">
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-lg mb-6">Please add items to your cart before proceeding to checkout.</p>
        <Button onClick={() => navigate('/home')} className="px-6 py-3 text-lg">Go to Home</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 bg-white dark:bg-gray-800 shadow-lg rounded-lg mt-10 dark:text-white">
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8 text-center">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Shipping Address */}
        <Card className="dark:bg-gray-700 dark:border-gray-600">
          <CardHeader><CardTitle className="text-2xl font-bold dark:text-white">Shipping Address</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input name="address" placeholder="Address" value={shippingAddress.address} onChange={handleShippingChange} required />
            <Input name="city" placeholder="City" value={shippingAddress.city} onChange={handleShippingChange} required />
            <Input name="postalCode" placeholder="Postal Code" value={shippingAddress.postalCode} onChange={handleShippingChange} required />
            <Input name="country" placeholder="Country" value={shippingAddress.country} onChange={handleShippingChange} required />
          </CardContent>
        </Card>

        {/* Order Summary and Payment */}
        <Card className="dark:bg-gray-700 dark:border-gray-600">
          <CardHeader><CardTitle className="text-2xl font-bold dark:text-white">Order Summary</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              {cart.map(item => (
                <div key={item.book._id} className="flex justify-between items-center mb-2">
                  <span>{item.book.title} x {item.quantity}</span>
                  <span>${(item.book.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-600 pt-4 flex justify-between text-xl font-bold">
              <span>Total:</span>
              <span>${total().toFixed(2)}</span>
            </div>

            <h3 className="text-xl font-bold mt-6 mb-3 dark:text-white">Payment Details</h3>
            <PaymentForm
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
              totalAmount={total()}
            />
            {orderError && <p className="text-red-500 text-center mt-2">{orderError}</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default CheckoutPage;