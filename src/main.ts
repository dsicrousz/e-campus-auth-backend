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

  const config = app.get(ConfigService);

  // Activer CORS pour les requêtes cross-origin
  app.enableCors({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    origin: config.get('BETTER_AUTH_URL'),
    credentials: true,
  });

  const port = config.get('PORT') as number;
  await app.listen(port);
  logger.log(`🚀 Auth Service démarré sur le port ${port}`);
}

bootstrap().catch((err) => console.error('Erreur au démarrage:', err));
