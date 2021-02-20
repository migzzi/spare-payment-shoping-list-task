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
		return res.json({
			success: true,
			data: newProd
		});
	} catch (errors) {
		console.error('Caught promise rejection (validation failed). Errors: ', errors);
		return res.json({
			success: false,
			errors
		});
	}
});
