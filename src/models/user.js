const mongoose = require("mongoose");
const validator = require("validator");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 8,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Email is invalid and uncorrect");
      }
    },
  },
  age: {
    type: Number,
    default: 18,
    validate(val) {
      if (val <= 0) {
        throw new Error("age must be a positive number");
      }
    },
  },
  city: {
    type: String,
  },
  tokens: [
    {
      type: String,
      required: true,
    }]
});

userSchema.pre("save", async function () {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcryptjs.hash(user.password, 10);
  }
});




// login

userSchema.statics.findByCredentials = async (em, pass) => {
  const user = await User.findOne({ email: em });
  if (!user) {
    throw new Error("unable to find login");
  }

  const isMatch = await bcryptjs.compare(pass, user.password);

  if (!isMatch) {
    throw new Error("unable to login");
  }

  return user;
};


// //////////////////////

userSchema.methods.generateToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, "islam500");
  user.tokens = user.tokens.concat(token);
  await user.save();
  return token;
};

//////////////////////////////////////////////////////////////////////////////////////////
//  hide private data

userSchema.methods.toJSON = function () {
  const user = this;

  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;
  return userObject;
};


const User = mongoose.model("User", userSchema);
module.exports = User;
