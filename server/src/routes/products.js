import { Router } from "express";
import { readCollection } from "../services/jsonStore.js";

export const productsRouter = Router();

// GET /api/products
// GET /api/products?category=electronics
//
// Filtering/sorting for the MAIN product list stays server-side-ready
// here (query params), even though today the frontend still does its
// own filtering client-side on the full list. Exposing it as query
// params now means the frontend can move to "ask the server for
// exactly what I need" later without this route needing to change.
productsRouter.get("/", (req, res) => {
  const products = readCollection("products", []);
  const { category } = req.query;

  const result = category && category !== "all"
    ? products.filter((p) => p.category === category)
    : products;

  res.json(result);
});

// GET /api/products/categories
// A dedicated route for just the category list, since the frontend
// needs this for its <select> dropdown without wanting the full
// product payload every time.
productsRouter.get("/categories", (req, res) => {
  const products = readCollection("products", []);
  const categories = [...new Set(products.map((p) => p.category))];
  res.json(categories);
});

// GET /api/products/:id
productsRouter.get("/:id", (req, res) => {
  const products = readCollection("products", []);
  // Route params always arrive as strings — product ids from the
  // seeded catalog are numbers, so we compare loosely (==) or convert
  // explicitly. Being explicit here (Number(...)) avoids the classic
  // "1" !== 1 bug.
  const product = products.find((p) => p.id === Number(req.params.id));

  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }
  res.json(product);
});
