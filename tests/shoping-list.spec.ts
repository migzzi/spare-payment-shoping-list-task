import request from 'supertest';
import app from '../src/app';
import db, { getNextId } from '../src/db';

// const clearShopingList = async () => {
// 	//Clearing the database
// 	for (let item of db.shopingList) await request(app).put(`/api/shoping-list/item/${item.id}/remove`);
// 	console.log('items', db.shopingList);

// 	// db.shopingList.forEach(async item => {
// 	// });
// };

const clearShopingList = () => {
	//Clearing the database
	db.shopingList.splice(0, db.shopingList.length);
};

describe('Getting the shoping list', () => {
	it('Should return all products', async () => {
		let shopingList = db.shopingList;
		let resp = await request(app).get('/api/shoping-list');
		expect(resp.status).toBe(200);
		expect(resp.body).toHaveProperty('shopingList');
		expect(resp.body).toHaveProperty('total');
		expect(resp.body.shopingList.length).toEqual(shopingList.length);
	});
});

describe('Adding new item to shoping list', () => {
	beforeEach(clearShopingList);
	afterEach(clearShopingList);

	it('Should add an item successfully', async () => {
		let productIdToAdd = 1;
		let productToAdd = db.products.find(p => p.id === productIdToAdd);
		let oldStock = productToAdd.quantity;

		let resp = await request(app).put('/api/shoping-list/item/add').send({
			product_id: productIdToAdd,
			quantity: 1
		});
		expect(resp.status).toBe(200);
		// Check if stock has been decreased by 1.
		expect(productToAdd.quantity).toEqual(oldStock - 1);

		//Test response body shape
		expect(resp.body).toHaveProperty('success');
		expect(resp.body).toHaveProperty('message');
		//Test expected response body
		expect(resp.body.success).toBe(true);
		expect(db.shopingList.length).toEqual(1);
	});

	it('Add a non existant product should fail', async () => {
		let productIdToAdd = getNextId('products') + 100;
		let resp = await request(app).put(`/api/shoping-list/item/add`).send({
			product_id: productIdToAdd,
			quantity: 1
		});
		expect(resp.status).toBe(400);
		//Test response body shape
		expect(resp.body).toHaveProperty('success');
		expect(resp.body).toHaveProperty('message');
		//T
		expect(resp.body.success).toBe(false);
	});

	it('Adding an item that has been already added before with quantity more than the old one', async () => {
		let productIdToAdd = 1;
		let productToAdd = db.products.find(p => p.id === productIdToAdd);
		let oldStock = productToAdd.quantity;

		let resp = await request(app).put('/api/shoping-list/item/add').send({
			product_id: productIdToAdd,
			quantity: 1
		});
		resp = await request(app).put('/api/shoping-list/item/add').send({
			product_id: productIdToAdd,
			quantity: 3
		});

		expect(resp.status).toBe(200);
		expect(productToAdd.quantity).toEqual(oldStock - 3);

		//Test response body shape
		expect(resp.body).toHaveProperty('success');
		expect(resp.body).toHaveProperty('message');
		//Test expected response body
		expect(resp.body.success).toBe(true);
		expect(db.shopingList.length).toEqual(1);
		expect(db.shopingList[0].quantity).toEqual(3);
	});

	it('Adding an item that has been already added before with quantity less than the old one', async () => {
		let productIdToAdd = 1;
		let productToAdd = db.products.find(p => p.id === productIdToAdd);
		let oldStock = productToAdd.quantity;
		console.log(oldStock);

		let resp = await request(app).put('/api/shoping-list/item/add').send({
			product_id: productIdToAdd,
			quantity: 3
		});
		resp = await request(app).put('/api/shoping-list/item/add').send({
			product_id: productIdToAdd,
			quantity: 1
		});

		expect(resp.status).toBe(200);
		expect(productToAdd.quantity).toEqual(oldStock - 1);

		//Test response body shape
		expect(resp.body).toHaveProperty('success');
		expect(resp.body).toHaveProperty('message');
		//Test expected response body
		expect(resp.body.success).toBe(true);
	});

	it('Trying to add an item with quantity more than available in stock should fail', async () => {
		let productIdToAdd = 1,
			productToAdd = db.products.find(p => p.id === 1);
		let resp = await request(app)
			.put(`/api/shoping-list/item/add`)
			.send({
				product_id: productIdToAdd,
				// Request for quantity more than avaible.
				quantity: productToAdd.quantity * 10
			});
		expect(resp.status).toBe(400);
		//Test response body shape
		expect(resp.body).toHaveProperty('success');
		expect(resp.body).toHaveProperty('message');
		//T
		expect(resp.body.success).toBe(false);
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
			shopingList = db.shopingList,
			itemIdToRemove = 1,
			itemToRemove = db.shopingList.find(i => i.id === itemIdToRemove),
			product = products.find(p => p.id === itemToRemove.product_id),
			productOldQty = product.quantity;

		let resp = await request(app).put(`/api/shoping-list/item/${itemIdToRemove}/remove`);
		expect(resp.status).toBe(200);

		expect(resp.body).toHaveProperty('success');
		expect(resp.body).toHaveProperty('message');

		expect(product.quantity).toEqual(productOldQty + itemToRemove.quantity);
		expect(shopingList.length).toEqual(1);
		expect(shopingList.findIndex(i => i.id === itemIdToRemove)).toEqual(-1);
	});

	it('Trying to remove non existant item should fail', async () => {
		let shopingList = db.shopingList,
			oldShopingListSize = shopingList.length,
			itemIdToRemove = getNextId('shopingList') + 100;

		let resp = await request(app).put(`/api/shoping-list/item/${itemIdToRemove}/remove`);
		expect(resp.status).toBe(404);

		expect(resp.body).toHaveProperty('success');
		expect(resp.body).toHaveProperty('message');

		expect(shopingList.length).toEqual(oldShopingListSize);
		expect(resp.body.success).toBe(false);
		expect(shopingList.length).toEqual(2);
	});
});
