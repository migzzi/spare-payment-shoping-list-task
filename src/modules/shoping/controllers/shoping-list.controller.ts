import { Router } from 'express';
import db from '../../../db';

export const ShopingListRouter: Router = Router();

ShopingListRouter.get('/shoping-list', (req, res) => {
	let shopingList = db.shopingList.map(item => {
		let product = db.products.find(p => p.id === item.product_id);
		return {
			id: item.id,
			product: {
				id: product.id,
				name: product.name,
				price: product.price
			},
			quantity: item.quantity,
			total_price: product.price * item.quantity
		};
	});
	return res.json({
		shopingList,
		total: shopingList.reduce((total, item) => total + item.total_price, 0)
	});
});
