import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Security middlewares
  app.use(helmet());
  app.use(cookieParser());

  // CORS configuration
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
  app.enableCors({
    origin: [frontendUrl, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger OpenAPI documentation
  const config = new DocumentBuilder()
    .setTitle('Olympido API')
    .setDescription(
      'Competitive Academic Olympiad & Contest Platform backend service specification. Supports live contests, automated grading, leaderboards, ratings, and social feed.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Input your JWT access token',
      },
      'bearer',
    )
    .addTag('Auth', 'Authentication, registration, email verification, and tokens')
    .addTag('Users', 'User profiles and student statistics')
    .addTag('Organizations', 'Institutional onboarding and teacher affiliations')
    .addTag('Contests', 'Contest creation, lifecycle, and student registration')
    .addTag('Questions', 'Problem set creation, reordering, and inspection')
    .addTag('Admin', 'Moderation queues for contests, organizations, and audit logs')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Olympido API Documentation',
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  logger.log(`🚀 Olympido Backend is running on: http://localhost:${port}/api/v1`);
  logger.log(`📚 Swagger documentation available at: http://localhost:${port}/api/docs`);
}

void bootstrap();
