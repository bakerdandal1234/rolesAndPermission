import React, { useEffect } from 'react';
import { useOrderStore } from '../store/orderStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Link } from 'react-router-dom';

function OrderHistoryPage() {
  const { orders, loading, error, fetchMyOrders } = useOrderStore();

  useEffect(() => {
    fetchMyOrders();
  }, [fetchMyOrders]);

  if (loading) return <div className="text-center py-8 dark:text-white">Loading orders...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;

  if (orders.length === 0) {
    return (
      <div className="container mx-auto p-4 md:p-8 text-center dark:text-white">
        <h1 className="text-3xl font-bold mb-4">No Orders Found</h1>
        <p className="text-lg mb-6">You haven't placed any orders yet.</p>
        <Link to="/home">
          <button className="px-6 py-3 text-lg bg-blue-600 text-white rounded-md hover:bg-blue-700">Start Shopping</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 bg-white dark:bg-gray-800 shadow-lg rounded-lg mt-10 dark:text-white">
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8 text-center">My Order History</h1>

      <div className="space-y-6">
        {orders.map(order => (
          <Card key={order._id} className="dark:bg-gray-700 dark:border-gray-600">
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle className="text-xl font-bold dark:text-white">Order ID: {order._id}</CardTitle>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                order.status === 'delivered' ? 'bg-green-200 text-green-800' :
                order.status === 'shipped' ? 'bg-blue-200 text-blue-800' :
                order.status === 'cancelled' ? 'bg-red-200 text-red-800' :
                'bg-yellow-200 text-yellow-800'
              }`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 mb-2">Order Date: {new Date(order.createdAt).toLocaleDateString()}</p>
              <p className="text-lg font-semibold mb-4">Total Amount: ${order.totalAmount.toFixed(2)}</p>

              <h3 className="text-lg font-bold mb-2 dark:text-white">Items:</h3>
              <ul className="list-disc list-inside space-y-1 mb-4">
                {order.items.map(item => (
                  <li key={item.book._id} className="flex justify-between items-center">
                    <div className="flex items-center">
                      {item.image && <img src={item.image} alt={item.book.title} className="w-12 h-12 object-cover rounded-md mr-3" />}
                      <span>{item.book.title} x {item.quantity}</span>
                    </div>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>

              <h3 className="text-lg font-bold mb-2 dark:text-white">Shipping Address:</h3>
              <p className="text-gray-400">{order.shippingAddress.address}, {order.shippingAddress.city}</p>
              <p className="text-gray-400">{order.shippingAddress.postalCode}, {order.shippingAddress.country}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default OrderHistoryPage;
