import CheckoutForm from "../components/CheckoutForm";

// CheckoutPage handles the "/checkout" route. CheckoutForm itself is
// completely unchanged — it never knew or cared about routing, since it
// never used context or navigation. That's exactly why moving it here
// was a simple cut-and-paste, no internal changes needed.
export default function CheckoutPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-8">
      <CheckoutForm />
    </main>
  );
}
