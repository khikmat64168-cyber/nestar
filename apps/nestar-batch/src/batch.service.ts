import { Injectable } from '@nestjs/common';

@Injectable()
export class BatchService {
	getHello(): string {
		return 'Welcome to Nestar Batch server !';
	}

	public async batchRollback(): Promise<void> {}

	public async batchProperties(): Promise<void> {}

	public async batchAgents(): Promise<void> {}
}
