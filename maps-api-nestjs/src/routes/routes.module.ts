import { Module } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { RoutesController } from './routes.controller';
import { MapsModule } from '../maps/maps.module';
import { RoutesDriverService } from './routes-driver/routes-driver.service';
import { RoutesGateway } from './routes/routes.gateway';
import { BullModule } from '@nestjs/bull';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NewPointsJob } from './new-points.job';
import { RouteKafkaProducerJob } from './route-kafka-producer.job';

@Module({
    imports: [
        MapsModule,
        BullModule.registerQueue({ name: 'new-points' }, { name: 'kafka-producer' }),
        ClientsModule.registerAsync([
            {
                name: 'KAFKA_SERVICE',
                useFactory: () => ({
                    transport: Transport.KAFKA,
                    options: {
                        client: {
                            clientId: 'nest',
                            brokers: ['localhost:9094'],
                        },
                    },
                }),
            },
        ]),
    ],
    controllers: [RoutesController],
    providers: [
        RoutesService,
        RoutesDriverService,
        RoutesGateway,
        NewPointsJob,
        RouteKafkaProducerJob,
    ],
})
export class RoutesModule {}
