const Joi = require("joi");

const user = Joi.object({
  displayName: Joi.string().min(3).max(30).required(),
  email: Joi.string()
    .email({ tlds: { allow: ["com", "vn", "sg"] } })
    .required(),
  password: Joi.string().min(5).required(),
  confirmPassword: Joi.string().valid(Joi.ref("password")),
});

module.exports = user;
