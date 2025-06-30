const bcrypt = require('bcryptjs');

exports.comparePassword = async (plain, hashed) => {
  return await bcrypt.compare(plain, hashed);
};
