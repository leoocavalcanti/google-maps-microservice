import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ForbiddenException, Logger } from '@nestjs/common';

async function bootstrap() {
    const logger = new Logger(AppModule.name);

    const whitelist = [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://localhost:8000',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'http://127.0.0.1:3002',
        'http://10.0.2.2:3000',
    ];

    const app = await NestFactory.create(AppModule, {
        cors: {
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
            origin: function (origin, callback) {
                if (!origin) {
                    callback(null, true);
                    return;
                }
                if (
                    whitelist.includes(origin) || // Checks your whitelist
                    !!origin.match(/dominio.com.br$/) // Overall check for your domain
                ) {
                    callback(null, true);
                } else {
                    logger.warn(`Origin: ${origin} not allowed by CORS`);
                    callback(new ForbiddenException('Not allowed by CORS'), false);
                }
            },
        },
    });
    await app.listen(3000);
}
bootstrap();
