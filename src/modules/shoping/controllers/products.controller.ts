import { validateOrReject } from 'class-validator';
import { Router } from 'express';
import db, { getNextId } from '../../../db';
import products from '../../../db/products';
import { getPropertiesFromRequest, transfereObject } from '../../../utils/object';
import { CreateProductDto } from '../dtos/product.dto';
import { Product } from '../models/product.entity';

export const ProductsRouter: Router = Router();

ProductsRouter.get('/products', (req, res) => {
	return res.json({
		products: db.products,
		total: products.length
	});
});

ProductsRouter.post('/products', async (req, res) => {
	//Now extract the modifiable properties from request.
	let newData = getPropertiesFromRequest<CreateProductDto>(['name', 'price', 'quantity'], req.body);
	let newProd = new Product(getNextId('products'), newData);

	try {
		await validateOrReject(newProd);
		db.products.push(newProd);
		return res.status(201).json({
			success: true,
			data: newProd,
			message: 'Product added successfully'
		});
	} catch (errors) {
		console.error('Caught promise rejection (validation failed). Errors: ', errors);
		return res.status(400).json({
			success: false,
			errors
		});
	}
});

ProductsRouter.put('/product/:id', async (req, res) => {
	//Find the product first to construct the domain enitity.
	let prodToUpdate = db.products.find(r => r.id === parseInt(req.params.id));

	if (!prodToUpdate)
		return res.status(400).json({
			success: false,
			message: `Product with id #${req.params.id} was not found.`
		});
	//Now extract the modifiable properties from request.
	let newData = getPropertiesFromRequest<CreateProductDto>(['name', 'price', 'quantity'], req.body);
	let newProd = new Product(prodToUpdate.id, {
		...prodToUpdate,
		...newData
	});

	try {
		await validateOrReject(newProd);
	} catch (errors) {
		return res.status(400).json({
			success: false,
			errors
		});
	}
	//actually update the product
	transfereObject(prodToUpdate, newData);

	return res.json({
		success: true,
		data: newProd,
		message: 'Product is updated successfully'
	});
});

ProductsRouter.delete('/product/:id', (req, res) => {
	let prodToDelete = db.products.findIndex(r => r.id === parseInt(req.params.id));

	if (prodToDelete < 0)
		return res.status(400).json({
			success: false,
			message: `Product with id #${req.params.id} was not found.`
		});

	// Delete the product
	db.products.splice(prodToDelete, 1);

	// Now lets delete any refrence to it in the shoping list
	// TODO this should be done as a side effect. Maybe use an event emitter to keep this portion decoupled from the product deletion logic.
	let shopingListItemToDelete = db.shopingList.findIndex(r => r.product_id === parseInt(req.params.id));
	if (shopingListItemToDelete > -1) db.shopingList.splice(shopingListItemToDelete, 1);

	// Delete the product

	return res.json({
		success: true,
		message: 'Product is deleted successfully'
	});
});
