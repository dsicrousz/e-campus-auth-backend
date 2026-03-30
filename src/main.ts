import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Activer la validation globale des DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      disableErrorMessages: process.env.NODE_ENV === 'production',
    }),
  );

  // Activer CORS pour les requêtes cross-origin
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  });

  const config = app.get(ConfigService);

  const port = config.get('PORT') as number;
  await app.listen(port);
  logger.log(`🚀 Auth Service démarré sur le port ${port}`);
}

bootstrap().catch((err) => console.error('Erreur au démarrage:', err));
