import { Logger, ValidationError, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { ApplicationModule } from './app.module';
import { SERVER_PORT } from './configs/constants.config';
import { ValidationException } from './exceptions/validation.exception';


async function bootstrap() {
  // Metric Configuration
  const app = await NestFactory.create<NestFastifyApplication>(ApplicationModule);

  app.enableShutdownHooks();
  app.useGlobalPipes(
    new ValidationPipe({
      skipMissingProperties: false,
      transform: true,
      exceptionFactory: (errors: ValidationError[]) => {
        return new ValidationException(errors);
      },
    }),
  );

  app.enableCors();

  // app.use(LoggerMiddleware);
  app.useLogger(new Logger('Nest'));

  await app.listen(SERVER_PORT, '0.0.0.0');

  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
