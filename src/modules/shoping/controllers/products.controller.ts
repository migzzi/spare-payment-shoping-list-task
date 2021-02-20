import { Router } from "express";
import db, { getNextId } from "../../../db";
import products from "../../../db/products";

export const ProductsRouter: Router = Router();

ProductsRouter.get("/products", (req, res) => {
  return res.json({
    products: db.products,
    total: products.length,
  });
});
