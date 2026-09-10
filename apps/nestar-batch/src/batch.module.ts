import { Module } from '@nestjs/common';
import { BatchController } from './batch.controller';
import { BatchService } from './batch.service';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from './database/database.module';
@Module({
	imports: [ConfigModule.forRoot(), ScheduleModule.forRoot(), DatabaseModule],
	controllers: [BatchController],
	providers: [BatchService],
})
export class BatchModule {}
