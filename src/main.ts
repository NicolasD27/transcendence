import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as session from 'express-session';
import * as passport from 'passport';
import { HttpExceptionFilter } from './filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  const port = +process.env.APP_PORT || 3000
  app.useGlobalFilters(new HttpExceptionFilter);
  app.setGlobalPrefix('api')
  console.log('Port running on: ', port)

  const options = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('Trancendence')
    .setDescription('Trancendence documentation')
    .setVersion('1.0')
    .build()
    
  const document = SwaggerModule.createDocument(app, options)
  SwaggerModule.setup('api', app, document)

  app.enableCors()

  app.use(
    session({ resave: false, saveUninitialized: false, secret: '!Paris' }),
  );
  app.use(passport.initialize());
  app.use(passport.session());

  await app.listen(port);
}
bootstrap();
