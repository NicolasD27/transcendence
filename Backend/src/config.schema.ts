import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  FORTYTWO_CLIENT_ID: Joi.string().required(),
  FORTYTWO_CLIENT_SECRET: Joi.string().required(),
  DB_TYPE: Joi.string().required(),
  POSTGRES_HOST: Joi.string().required(),
  POSTGRES_PORT: Joi.string().required(),
  POSTGRES_USERNAME: Joi.string().required(),
  POSTGRES_PASSWORD: Joi.string().required(),
});
