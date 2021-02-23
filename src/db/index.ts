import products from './products';

const db: {
	[prop: string]: any[];
} = {
	products,
	shopingList: []
};

export default db;

export function getNextId(tableName: string): number {
	let table = db[tableName];
	if (!table) throw new Error(`Table ${tableName} not found in database.`);
	return Math.max(...table.map(r => r.id)) + 1;
}
