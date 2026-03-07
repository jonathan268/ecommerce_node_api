const Joi = require("joi");

exports.registerSchema = Joi.object({
  email: Joi.string()
    .min(6)
    .max(60)
    .required()
    .email({
      tlds: { allow: ["com", "net"] },
    }),

  password: Joi.string()
    .required()
    .pattern(new RegExp("/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/")),
});

exports.loginSchema = Joi.object({
  email: Joi.string()
    .min(6)
    .max(60)
    .required()
    .email({
      tlds: { allow: ["com", "net"] },
    }),

  password: Joi.string()
    .required()
    .pattern(new RegExp("/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/")),
});

exports.addProductSchema = Joi.object({
  name: Joi.string().min(6).max(600).required(),

  description: Joi.string().min(6).max(600).required(),

  stock: Joi.number().min(1).max(10000000).required(),
});
