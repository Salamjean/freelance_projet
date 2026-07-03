import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Définir le préfixe global pour les routes de l'API
  app.setGlobalPrefix('api');

  // Augmenter la limite de taille des requêtes pour accepter les images en base64
  const express = require('express');
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Activer CORS pour permettre la communication avec le frontend
  app.enableCors({
    origin: '*', // En production, spécifiez l'URL de votre frontend
    credentials: true,
  });

  // Validation globale des DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Supprime les propriétés non déclarées dans le DTO
      transform: true, // Transforme automatiquement les payloads aux types déclarés
    }),
  );


  // Configuration de Swagger pour la documentation de l'API
  const config = new DocumentBuilder()
    .setTitle('Plateforme Freelance API')
    .setDescription('Documentation de l\'API REST pour la plateforme de mise en relation clients/freelances')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env['PORT'] || 3000;
  await app.listen(port);
  console.log(`🚀 Le serveur backend a démarré sur : http://localhost:${port}`);
  console.log(`📄 La documentation API (Swagger) est disponible sur : http://localhost:${port}/api-docs`);
}
bootstrap();
// reload-trigger-8

