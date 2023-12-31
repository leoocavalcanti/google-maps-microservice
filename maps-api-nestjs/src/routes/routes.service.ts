import { Inject, Injectable } from '@nestjs/common';
import { CreateRouteDto } from './dto/create-route.dto';
import { PrismaService } from '../prisma/prisma/prisma.service';
import { DirectionsService } from '../maps/directions/directions.service';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class RoutesService {
    private readonly include = {
        source: true,
        destination: true,
    };

    constructor(
        private readonly prismaService: PrismaService,
        private readonly directionsService: DirectionsService,
        @Inject('KAFKA_SERVICE')
        private readonly kafkaService: ClientKafka, // @InjectQueue('kafka-producer') private kafkaProducerQueue: Queue,
    ) {}

    async create(createRouteDto: CreateRouteDto) {
        const { available_travel_modes, geocoded_waypoints, routes, request } =
            await this.directionsService.getDirections(
                createRouteDto.sourceId,
                createRouteDto.destinationId,
            );

        const legs = routes[0].legs[0];

        const routeCreated = await this.prismaService.route.create({
            data: {
                name: createRouteDto.name,
                source: {
                    create: {
                        name: legs.start_address,
                        location: {
                            create: {
                                lat: legs.start_location.lat,
                                lng: legs.end_location.lng,
                            },
                        },
                    },
                },
                destination: {
                    create: {
                        name: legs.end_address,
                        location: {
                            create: {
                                lat: legs.end_location.lat,
                                lng: legs.end_location.lng,
                            },
                        },
                    },
                },
                distance: legs.distance.value,
                duration: legs.duration.value,
                directions: JSON.stringify({
                    available_travel_modes,
                    geocoded_waypoints,
                    routes,
                    request,
                }),
            },
            include: this.include,
        });
        await this.kafkaService.emit('route', {
            event: 'RouteCreated',
            id: routeCreated.id,
            name: routeCreated.name,
            distance: routeCreated.distance,
        });
        // await this.kafkaProducerQueue.add({
        //     event: 'RouteCreated',
        //     id: routeCreated.id,
        //     name: routeCreated.name,
        //     distance: legs.distance.value,
        // });
        return routeCreated;
    }

    async findAll() {
        return await this.prismaService.route.findMany({
            include: this.include,
        });
    }

    async findOne(id: string) {
        return await this.prismaService.route.findUniqueOrThrow({
            where: { id },
            include: this.include,
        });
    }

    remove(id: number) {
        return `This action removes a #${id} route`;
    }
}
