import express from "express";
import bodyParser from "body-parser";
import { ProductsRouter, ShopingListRouter } from "./modules/shoping";
const app: express.Application = express();
const PORT: number = 8888;

app.use(bodyParser.json());
app.use("/api", ProductsRouter);
app.use("/api", ShopingListRouter);

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});
