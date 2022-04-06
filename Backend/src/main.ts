import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as session from 'express-session';
import * as passport from 'passport';
import { join } from 'path';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import * as cookieParser from 'cookie-parser';
// somewhere in your initialization file

async function bootstrap() {

	const app = await NestFactory.create<NestExpressApplication>(AppModule)
	const port = +process.env.APP_PORT || 8000
	app.useGlobalFilters(new HttpExceptionFilter);
	app.setGlobalPrefix('api')
	app.use(cookieParser());
	console.log('Port running on: ', port)

	const options = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('Trancendence')
    .setDescription('Trancendence documentation')
    .setVersion('1.0')
    .build()
    
	const document = SwaggerModule.createDocument(app, options)
	SwaggerModule.setup('api', app, document)
	const sessionMiddleware = session({ resave: false, saveUninitialized: false, secret: '!Paris' })
	app.enableCors()

	app.use(sessionMiddleware);
	app.use(passport.initialize());
	app.use(passport.session());
	app.useStaticAssets(join(__dirname, '..', 'views'));

	await app.listen(port);
}
bootstrap();
