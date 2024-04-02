const bcrypt = require("bcrypt");

const hashPassword = (password) => {
  return bcrypt.hashSync(password, 12);
};

const compareSync = (password, resPassword) => {
  return bcrypt.compareSync(password, resPassword);
};

module.exports = {
  hashPassword,
  compareSync,
};
