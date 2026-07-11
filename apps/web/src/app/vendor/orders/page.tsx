import { auth } from "@clerk/nextjs/server";
import { OrderStatusSelector } from "@/components/OrderStatusSelector";

export default async function VendorOrdersPage() {
  let orders = [];

  try {
    const { getToken } = await auth();
    const token = await getToken();
    const res = await fetch('http://localhost:4000/api/vendor/orders', { 
      cache: 'no-store',
      headers: { ...(token && { Authorization: `Bearer ${token}` }) }
    });
    if (res.ok) {
      orders = await res.json();
    }
  } catch (error) {
    console.error("Failed to fetch vendor orders");
  }



  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Orders</h1>
        <p className="text-gray-400">View and manage your recent sales.</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm text-left text-gray-400">
            <thead className="text-xs text-gray-400 uppercase bg-black/40 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-medium rounded-tl-xl">Order ID</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Items</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Total</th>
                <th className="px-6 py-4 font-medium text-right rounded-tr-xl">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No orders found yet. When a customer checks out, it will appear here.
                  </td>
                </tr>
              )}
              {orders.map((order: any) => (
                <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">
                    {order.id.split('-')[0]}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-white font-medium">{order.customerName}</div>
                    <div className="text-xs text-gray-500">{order.customerEmail}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {order.items.map((item: any, i: number) => (
                        <div key={i} className="text-xs">
                          <span className="text-gray-300">{item.quantity}x</span> {item.name}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {new Date(order.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 font-medium text-white">
                    ${order.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <OrderStatusSelector orderId={order.id} initialStatus={order.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
