import request from 'supertest';
import app from '../src/app';
import db, { getNextId } from '../src/db';

const clearShopingList = () => {
	//Clearing the database
	db.shopingList.splice(0, db.shopingList.length);
};

describe('Getting all products', () => {
	it('Should return all products', async () => {
		let products = db.products;
		let resp = await request(app).get('/api/products');
		expect(resp.status).toBe(200);
		expect(resp.body).toHaveProperty('products');
		expect(resp.body).toHaveProperty('total');
		expect(resp.body.products.length).toEqual(products.length);
		expect(resp.body.total).toEqual(products.length);
	});
});

describe('Adding new product', () => {
	afterEach(clearShopingList);

	it('Should add product successfully', async () => {
		let resp = await request(app).post('/api/products').send({
			name: 'Cola',
			price: 22,
			quantity: 100
		});
		expect(resp.status).toBe(201);
		//Test response body shape
		expect(resp.body).toHaveProperty('success');
		expect(resp.body).toHaveProperty('data');
		expect(resp.body).toHaveProperty('message');
		expect(resp.body.data).toHaveProperty('id');
		//Test expected response body
		expect(resp.body.success).toBe(true);
		expect(resp.body.data.id).toEqual(getNextId('products') - 1);
	});

	it("Shouldn't accept the given data", async () => {
		let resp = await request(app).post('/api/products').send({
			name: 'Cola',
			price: -22,
			quantity: 100
		});
		expect(resp.status).toBe(400);
		//Test response body shape
		expect(resp.body).toHaveProperty('success');
		expect(resp.body).toHaveProperty('errors');
		//T
		expect(resp.body.success).toBe(false);
		expect(resp.body.errors.length).toEqual(1);
	});
});

describe('Updating a product', () => {
	beforeEach(() => {
		db.shopingList.push(
			{
				id: 1,
				product_id: 1,
				quantity: 2
			},
			{
				id: 2,
				product_id: 2,
				quantity: 3
			}
		);
	});
	afterEach(clearShopingList);

	it('Should update product successfully, and updates will reflect on shoping list', async () => {
		let productIdToUpdate = 1,
			productToUpdate = db.products.find(p => p.id === productIdToUpdate);
		let oldTotal = (await request(app).get('/api/shoping-list')).body.total;
		let resp = await request(app)
			.put(`/api/product/${productIdToUpdate}`)
			.send({
				name: 'Cola',
				// Change the old price, e.g. half of it
				price: productToUpdate.price * 0.5
			});
		let newTotal = (await request(app).get('/api/shoping-list')).body.total;
		expect(resp.status).toBe(200);
		//Test response body shape
		expect(resp.body).toHaveProperty('success');
		expect(resp.body).toHaveProperty('data');
		expect(resp.body).toHaveProperty('message');
		//Test expected response body
		expect(resp.body.success).toBe(true);
		expect(productToUpdate.name).toEqual('Cola');
		expect(oldTotal).not.toEqual(newTotal);
	});

	it('Update a non existant product', async () => {
		let productIdToUpdate = getNextId('products') + 100;
		let resp = await request(app).put(`/api/product/${productIdToUpdate}`).send({
			name: 'Cola'
		});
		expect(resp.status).toBe(400);
		//Test response body shape
		expect(resp.body).toHaveProperty('success');
		expect(resp.body).toHaveProperty('message');
		//T
		expect(resp.body.success).toBe(false);
	});

	it('Update with invalid data should fail', async () => {
		let productIdToUpdate = 1;
		let resp = await request(app).put(`/api/product/${productIdToUpdate}`).send({
			name: 'Cola',
			quantity: -1
		});
		expect(resp.status).toBe(400);
		//Test response body shape
		expect(resp.body).toHaveProperty('success');
		expect(resp.body).toHaveProperty('errors');
		//T
		expect(resp.body.success).toBe(false);
		expect(resp.body.errors.length).toEqual(1);
		expect(resp.body.errors[0].property).toEqual('quantity');
		expect(resp.body.errors[0].constraints).toHaveProperty('min');
	});
});

describe('Removing a product', () => {
	beforeEach(() => {
		db.shopingList.push(
			{
				id: 1,
				product_id: 1,
				quantity: 2
			},
			{
				id: 2,
				product_id: 2,
				quantity: 3
			}
		);
	});

	afterEach(clearShopingList);

	it('Should remove the product and remove it form the shoping list', async () => {
		let products = db.products,
			oldProductsCount = products.length,
			shopingList = db.shopingList,
			productToRemove = 1;

		let resp = await request(app).delete(`/api/product/${productToRemove}`);
		expect(resp.status).toBe(200);

		expect(resp.body).toHaveProperty('success');
		expect(resp.body).toHaveProperty('message');

		expect(products.length).toEqual(oldProductsCount - 1);
		expect(shopingList.length).toEqual(1);
		expect(shopingList.findIndex(i => i.product_id === productToRemove)).toEqual(-1);
	});

	it('Trying to remove non existant product should fail', async () => {
		let products = db.products,
			oldProductsCount = products.length,
			shopingList = db.shopingList,
			productToRemove = getNextId('products') + 100;

		let resp = await request(app).delete(`/api/product/${productToRemove}`);
		expect(resp.status).toBe(400);

		expect(resp.body).toHaveProperty('success');
		expect(resp.body).toHaveProperty('message');

		expect(products.length).toEqual(oldProductsCount);
		expect(resp.body.success).toBe(false);
		expect(shopingList.length).toEqual(2);
	});
});
