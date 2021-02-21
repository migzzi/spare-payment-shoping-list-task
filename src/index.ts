import app from './app';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.APP_PORT || 8888;

app.listen(PORT, () => {
	console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});
