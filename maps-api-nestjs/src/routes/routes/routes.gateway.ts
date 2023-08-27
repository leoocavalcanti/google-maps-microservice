import { InjectQueue } from '@nestjs/bull';
import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Queue } from 'bull';
import { Socket } from 'socket.io';

@WebSocketGateway({
    cors: {
        origin: 'http://localhost:3001',
    },
})
export class RoutesGateway {
    constructor(@InjectQueue('new-points') private newPointsQueue: Queue) {}

    @SubscribeMessage('new-points')
    async handleMessage(client: Socket, payload: { route_id: string; lat: number; lng: number }) {
        // const payloadType = {
        //     routeId: payload.route_id,
        //     lat: payload.lat,
        //     lng: payload.lng,
        // };
        client.broadcast.emit(`admin-new-points`, payload);
        client.broadcast.emit(`new-points/${payload.route_id}`, payload);
        await this.newPointsQueue.add(payload);
    }
}
