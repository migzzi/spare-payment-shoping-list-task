import express from 'express';
import bodyParser from 'body-parser';
import { ProductsRouter, ShopingListRouter } from './modules/shoping';
const app: express.Application = express();

app.use(bodyParser.json());
app.use('/api', ProductsRouter);
app.use('/api', ShopingListRouter);

export default app;
