const Joi = require("joi");

const user = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(5).required(),
  cPassword: Joi.string().min(5).required(),
});

module.exports = user;
