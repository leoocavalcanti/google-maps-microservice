import { Process, Processor } from '@nestjs/bull';
import { RoutesDriverService } from './routes-driver/routes-driver.service';
import { Job } from 'bull';

@Processor('new-points')
export class NewPointsConsumer {
    constructor(private readonly routesDriverService: RoutesDriverService) {}

    @Process()
    async handle(job: Job<{ route_id: string; lat: number; lng: number }>) {
        const response = await this.routesDriverService.createOrUpdate(job.data);
        console.log(response);
        return {};
    }
}
