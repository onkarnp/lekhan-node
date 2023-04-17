const bcrypt = require('bcryptjs');
const { genSaltSync, hashSync,} = require("bcryptjs");

const password = "sumit";
const salt = genSaltSync(10);

epass = hashSync(password,salt);

console.log(epass);