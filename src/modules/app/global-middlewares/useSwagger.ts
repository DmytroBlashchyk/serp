import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const useSwagger = (app: INestApplication) => {
  const config = new DocumentBuilder()
    .setTitle('Serpnest')
    .setDescription('Serpnest API reference')
    .setVersion('1.0')
    .addApiKey()
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup(
    process.env.API_DOCUMENTATION_INCLUSION == 'true'
      ? 'v1/documentation'
      : 'swagger',
    app,
    document,
  );
};
