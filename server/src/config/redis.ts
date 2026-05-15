import { createClient } from 'redis';

const client = createClient();

client.on('error', (err) => console.log('Redis client error', err));

export async function connectRedis(): Promise<void> {
	try {
		if (!client.isOpen) {
			await client.connect();
		}
		console.log('Redis connected');
	} catch (err: unknown) {
		console.error('Failed to connect to Redis. Is it running on localhost:6379?');
		console.error(err);
		process.exit(1);
	}
}

export function registerRedisShutdown(): void {
	process.on('SIGINT', async () => {
		try {
			if (client.isOpen) {
				await client.quit();
			}
		} finally {
			process.exit(0);
		}
	});
}

export default client;
