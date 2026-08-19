import { useState, useEffect } from "react";

// A custom hook is just a normal function that starts with "use" and
// calls other hooks inside it. This one wraps the "fetch a list, track
// loading/error" pattern so any component can call useProducts() and
// get real data without repeating this logic itself.
export function useProducts() {
  // Three separate pieces of state, because a fetch has three distinct
  // moments in time: "still waiting", "succeeded with data", and
  // "failed". Trying to represent all three with just one variable
  // gets messy fast.
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true); // true until the fetch finishes
  const [error, setError] = useState(null); // stays null unless something goes wrong

  useEffect(() => {
    // fetch() is the browser's built-in way to make an HTTP request. It
    // returns a Promise — a value that isn't ready yet, but will
    // "resolve" later with the real response.
    fetch("https://fakestoreapi.com/products")
      .then((res) => {
        // res.ok is false for error status codes (404, 500, etc). fetch
        // does NOT automatically treat those as errors — we have to
        // check manually and throw ourselves if something's wrong.
        if (!res.ok) throw new Error("Failed to load products");
        // .json() reads the response body and parses it from raw text
        // into a real JavaScript array/object. This ALSO returns a
        // Promise, which is why we chain another .then() below.
        return res.json();
      })
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      // .catch() runs if EITHER the fetch itself fails (no internet) OR
      // one of the .then() blocks above threw an error.
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
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
    // Reset to "loading" every time id changes, so old data doesn't
    // flash on screen while the new product is being fetched.
    setLoading(true);
    setError(null);

    fetch(`https://fakestoreapi.com/products/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Product not found");
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]); // re-run whenever the id in the URL changes

  return { product, loading, error };
}
