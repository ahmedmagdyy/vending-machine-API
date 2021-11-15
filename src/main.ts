import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      skipMissingProperties: false,
      forbidUnknownValues: false,
    }),
  );
  const port = process.env.PORT || 4000;
  app.listen(port, () =>
    console.log(`the app running on http://localhost:${port}`),
  );
}
bootstrap();
