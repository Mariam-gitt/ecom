import { useState, useEffect } from "react";
import { api } from "../lib/api";

// A custom hook is just a normal function that starts with "use" and
// calls other hooks inside it. This one wraps the "fetch a list, track
// loading/error" pattern so any component can call useProducts() and
// get real data without repeating this logic itself.
//
// CHANGED: this used to call fakestoreapi.com directly from the
// browser. Now it calls OUR OWN backend (via the api helper), which
// itself caches fakestoreapi's data server-side. Same three-state
// pattern as before — only the URL moved.
export function useProducts() {
  // Three separate pieces of state, because a fetch has three distinct
  // moments in time: "still waiting", "succeeded with data", and
  // "failed". Trying to represent all three with just one variable
  // gets messy fast.
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true); // true until the fetch finishes
  const [error, setError] = useState(null); // stays null unless something goes wrong

  useEffect(() => {
    let cancelled = false; // guards against setting state after unmount

    api
      .getProducts()
      .then((data) => {
        if (cancelled) return;
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []); // empty deps: fetch once, when this hook is first used

  // Returning an object (not an array like useState) so callers can
  // destructure by NAME instead of by position — clearer to read at
  // the call site: const { products, loading, error } = useProducts();
  return { products, loading, error };
}

// A second custom hook, for fetching ONE product by id — used on the
// product detail page. Same three-state pattern, just a different URL
// and it re-fetches whenever "id" changes (e.g. navigating from one
// product's detail page directly to another's).
export function useProduct(id) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    // Reset to "loading" every time id changes, so old data doesn't
    // flash on screen while the new product is being fetched.
    setLoading(true);
    setError(null);

    api
      .getProduct(id)
      .then((data) => {
        if (cancelled) return;
        setProduct(data);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]); // re-run whenever the id in the URL changes

  return { product, loading, error };
}
