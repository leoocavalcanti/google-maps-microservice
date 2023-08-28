import { Process, Processor } from '@nestjs/bull';
import { RoutesDriverService } from './routes-driver/routes-driver.service';
import { Job } from 'bull';

@Processor('new-points')
export class NewPointsJob {
    constructor(private readonly routesDriverService: RoutesDriverService) {}

    @Process()
    async handle(job: Job<{ route_id: string; lat: number; lng: number }>) {
        const payload: any = {
            routeId: job.data.route_id,
            lat: job.data.lat,
            lng: job.data.lng,
        };
        const response = await this.routesDriverService.createOrUpdate(payload);
        console.log(response);
        return {};
    }
}
