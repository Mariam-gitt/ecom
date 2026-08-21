import { useCart } from "../context/CartContext";
import CheckoutForm from "../components/CheckoutForm";

// CheckoutPage now reads the cart itself, so it can show an order
// summary alongside the form — CheckoutForm stays focused on just the
// name/email fields, this page handles showing what's being bought.
export default function CheckoutPage() {
  const { cart } = useCart();
  const totalPrice = cart
    .reduce((sum, item) => sum + item.price * item.qty, 0)
    .toFixed(2);

  return (
    <main className="max-w-4xl mx-auto px-6 py-8 grid sm:grid-cols-2 gap-8">
      <div>
        <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-4">
          Order summary
        </h2>
        {cart.length === 0 ? (
          <p className="text-sm text-neutral-400">Your cart is empty.</p>
        ) : (
          <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl divide-y divide-neutral-100 dark:divide-neutral-700">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3">
                <img src={item.image} alt={item.title} className="w-10 h-10 object-contain" />
                <div className="flex-1">
                  <p className="text-sm dark:text-white line-clamp-1">{item.title}</p>
                  <p className="text-xs text-neutral-400">Qty: {item.qty}</p>
                </div>
                <p className="text-sm dark:text-white">${(item.price * item.qty).toFixed(2)}</p>
              </div>
            ))}
            <div className="flex items-center justify-between p-3 font-medium">
              <span className="dark:text-white">Total</span>
              <span className="dark:text-white">${totalPrice}</span>
            </div>
          </div>
        )}
      </div>

      {/* CheckoutForm itself is UNCHANGED — but we're passing it the
          cart and total as props now, so it can clear the cart on
          success and show the right amount in its confirmation. */}
      <CheckoutForm cart={cart} totalPrice={totalPrice} />
    </main>
  );
}
