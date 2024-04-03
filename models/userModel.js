const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  id: {
    type: Number,
  },
  customerid: {
    type: String,
  },
  email: {
    type: String,
    required: [true, "Please Enter Your Email"],
    unique: true,
    validate: [validator.isEmail, "Please Enter a valid Email"],
  },
  password: {
    type: String,
    required: [true, "Please Enter Your Password"],

  },
  isactive: {
    type: Number,
    default: 0
  },
  Isverified: {
    type: Number,
    default: 0
  },
  activationcode: {
    type: String,
  },
  register_date: {
    type: Date,
    default: Date.now,
  },
  cl_id: {
    type: Number
  },

  resetPasswordToken: String,
  resetPasswordExpire: Date,
}, { collection: 'customer' });

const SALT_BYTES = 24;
const PBKDF2_ITERATIONS = 1000;
const ITERATION_INDEX = 1;
const SALT_INDEX = 2;
const PBKDF2_INDEX = 3;
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  // Generate a new salt for this user
  const salt = crypto.randomBytes(SALT_BYTES);

  // Hash the password using PBKDF2
  try {
    const hash = await pbkdf2(this.password, salt, PBKDF2_ITERATIONS, 64); // 64 bytes hash (sha512)

    // Store the hash and salt in the database
    this.password = `sha1:${PBKDF2_ITERATIONS}:${salt.toString('base64')}:${hash.toString('base64')}`;

    return next();
  } catch (err) {
    return next(err);
  }
});

// JWT TOKEN
userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Compare Password
// Constants from the C# code

function slowEquals(a, b) {
  let diff = a.length ^ b.length;
  for (let i = 0; i < a.length && i < b.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

function pbkdf2(password, salt, iterations, outputBytes) {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, iterations, outputBytes, 'sha1', (err, derivedKey) => {
      if (err) {
        reject(err);
      } else {
        resolve(derivedKey);
      }
    });
  });
}

function validatePassword(password, goodHash) {
  return new Promise(async (resolve, reject) => {
    // Extract the parameters from the hash
    const delimiter = ':';
    const split = goodHash.split(delimiter);
    const iterations = parseInt(split[ITERATION_INDEX]);
    const salt = Buffer.from(split[SALT_INDEX], 'base64');
    const hash = Buffer.from(split[PBKDF2_INDEX], 'base64');

    try {
      const testHash = await pbkdf2(password, salt, iterations, hash.length);
      resolve(slowEquals(hash, testHash));
    } catch (err) {
      reject(err);
    }
  });
}

userSchema.methods.comparePassword = async function (password) {
  try {
    const isValid = await validatePassword(password, this.password);

    if (isValid) {
      // console.log('Password is valid');
      return true;
    } else {
      // console.log('Password is invalid');
      return false;
    }
  } catch (err) {
    // console.error('Error comparing passwords:', err);
    return false;
  }
};


// Generating Password Reset Token
userSchema.methods.getResetPasswordToken = function () {
  // Generating Token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hashing and adding resetPasswordToken to userSchema
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model("User", userSchema);
