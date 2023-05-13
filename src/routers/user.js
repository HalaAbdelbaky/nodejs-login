const express = require("express");
const User = require("../models/user");

const router = express.Router();

// post Request

router.post("/users", (req, res) => {
  const user = new User(req.body);

  user
    .save()
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// get Request

router.get("/users", (req, res) => {
  User.find({})
    .then((users) => {
      res.status(200).send(users);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

// get by id Request

router.get("/users/:id", (req, res) => {
  const _id = req.params.id;

  User.findById(_id)
    .then((user) => {
      if (!user) {
        return res.status(404).send("Unable to find this user");
      }
      res.status(200).send(user);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

// patch Request

router.patch("/users/:id", async (req, res) => {
  try {
    const updatedData = Object.keys(req.body);
    const _id = req.params.id;

    const user = await User.findById(_id);

    if (!user) {
      return res.status(404).send("NO userData is found");
    }
    updatedData.forEach((ele) => (user[ele] = req.body[ele]));

    await user.save();
    res.status(200).send(user);
  } catch (err) {
    res.status(400).send(err);
  }
});

// delete request

router.delete("/users/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    const user = await User.findByIdAndDelete(_id);

    if (!user) {
      return res.status(404).send("unable to find userData");
    }
    res.status(200).send(user);
  } catch (err) {
    res.status(500).send(err);
  }
});

// login

router.post("/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateToken();
    res.status(200).send({ user ,token });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// ///////////////////////////
router.post("/users", async (req, res) => {
  try {
    const user = new User(req.body);
    const token = await user.generateToken();
    await user.save();
    res.status(200).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});


// ///////////////////////
// logout


router.patch("/logout/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    const user = await User.findById(_id);
    user.tokens = [];
    await user.save();
    res.status(200).send({ message: "User logged out successfully" });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});
module.exports = router;
