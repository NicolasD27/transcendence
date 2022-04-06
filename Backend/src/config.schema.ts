import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  FORTYTWO_CLIENT_ID: Joi.string().required(),
  FORTYTWO_CLIENT_SECRET: Joi.string().required(),
  DB_TYPE: Joi.string().required(),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.string().required(),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
});
