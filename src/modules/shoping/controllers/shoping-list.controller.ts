import { Router } from 'express';
import db, { getNextId } from '../../../db';
import { transfereObject } from '../../../utils/object';

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

ShopingListRouter.put('/shoping-list/item/add', (req, res) => {
	let productId = parseInt(req.body.product_id),
		productToAdd = db.products.find(p => p.id === productId),
		requestedQty = parseInt(req.body.quantity);

	// Case of invalid product
	if (!productToAdd)
		return res.json({
			success: false,
			message: `No product with id #${productId} was found.`
		});
	// Case of not enough quantity in stock
	if (productToAdd.quantity < requestedQty)
		return res.json({
			success: false,
			message: 'No enough quantity available in stock.'
		});

	// The case when adding a product that has already been added before.
	// The requirements didn't specify how to handle such case so I'will just imporvicse
	// and will update the quantity of the already selected item.
	let item = db.shopingList.find(item => item.product_id === productToAdd.id);
	if (item) {
		transfereObject(item, { quantity: requestedQty });
		// If item already exists then just deduct/add the difference between old and new quantities.
		transfereObject(productToAdd, { quantity: productToAdd.quantity - (requestedQty - item.quantity) });
		return res.json({
			success: true,
			message: "Updated selected item's quantity."
		});
	}

	// Deduct the requested quantity from the stock.
	transfereObject(productToAdd, { quantity: productToAdd.quantity - requestedQty });

	db.shopingList.push({
		id: getNextId('shopingList'),
		product_id: productId,
		quantity: requestedQty
	});

	return res.json({
		success: true,
		message: 'Item added successfully.'
	});
});

ShopingListRouter.put('/shoping-list/item/:id/remove', (req, res) => {
	let itemId = parseInt(req.params.id),
		item = db.shopingList.find(item => item.id === itemId);
	// If invalid item id
	if (!item) {
		return res.json({
			success: false,
			message: `No item with id #${itemId} was found.`
		});
	}
	let productToRemove = db.products.find(p => p.id === item.product_id);
	// This case shouldn't be possible if an item was added correctly
	// but I'm just being a little deffensive (Because always expect the unexpected, right?).
	if (!productToRemove)
		return res.json({
			success: false,
			message: `No product with id #${productToRemove.id} was found.`
		});

	// Return the requested quantity to the stock.
	transfereObject(productToRemove, { quantity: productToRemove.quantity + item.quantity });

	let itemIndex = db.shopingList.findIndex(item => item.id === itemId);
	db.shopingList.splice(itemIndex, 1);

	return res.json({
		success: true,
		message: 'Item removed successfully.'
	});
});
