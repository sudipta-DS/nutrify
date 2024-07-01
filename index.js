const express = require("express");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

// importing models
const userModel = require("./models/userModel");
const foodModel = require("./models/foodModel");
const trackingModel = require("./models/trackingModel");

// importing verifyToken
const verifyToken = require("./verifyToken");

mongoose
  .connect("mongodb://localhost:27017/nutrify")
  .then(() => {
    console.log("Database connected successfully.");
  })
  .catch((error) => {
    console.log(error);
  });

const app = express();

app.use(express.json());

// register endpoint
app.post("/register", (req, res) => {
  let user = req.body;

  bcrypt.genSalt(10, (err, salt) => {
    if (!err) {
      bcrypt.hash(user.password, salt, async (error, hpass) => {
        if (!error) {
          user.password = hpass;
        }
        try {
          let doc = await userModel.create(user);
          return res
            .status(201)
            .send({ message: "user registered successfully." });
        } catch (err) {
          console.log(err);
          return res
            .status(500)
            .send({ message: "something problem happened" });
        }
      });
    }
  });
});

// login endpoint
app.post("/login", async (req, res) => {
  let userCred = req.body;
  try {
    const user = await userModel.findOne({ email: userCred.email });
    if (user !== null) {
      // bcrypt.genSalt(10, (error, salt) => {
      //   bcrypt.hash(userCred.password, salt, (error, hashpassword) => {
      //     userCred.password = hashpassword;
      //   });
      // });

      bcrypt.compare(userCred.password, user.password, (error, success) => {
        if (success) {
          jwt.sign({ email: userCred.email }, "nutrifyApp", (error, token) => {
            if (!error) {
              res.send({ message: "login successful", token: token });
            } else {
              console.log(error);
            }
          });
        } else {
          console.log(error, success);
          res.status(403).send({ message: "wrong password" });
        }
      });
    } else {
      res.status(404).send({ message: "user not found" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "something problem happened" });
  }
});

// endpoint for fetching all data

app.get("/foods", verifyToken, async (req, res) => {
  try {
    const foods = await foodModel.find();
    res.send(foods);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "something problem happened" });
  }
});

// endpoint for finding food by name

app.get("/foods/:name", verifyToken, async (req, res) => {
  try {
    const foods = await foodModel.find({
      name: { $regex: req.params.name, $options: "i" },
    });
    if (foods.length !== 0) {
      res.send(foods);
    } else {
      res.status(404).send({
        message: "no food found.",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "something problem happened" });
  }
});

// endpoint for tracking foods

app.post("/track", verifyToken, async (req, res) => {
  const trackData = req.body;

  try {
    const data = await trackingModel.create(trackData);
    res.status(201).send({ message: "food added successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "there is some problem" });
  }
});

// endpoint for tracking food by person

app.get("/track/:userId/:", verifyToken, async (req, res) => {
  try {
    const userID = req.params.userId;
    const foodsEaten = await trackingModel
      .find({ userId: userID })
      .populate("userId")
      .populate("foodId");

    res.status(201).send(foodsEaten);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "there is some problem" });
  }
});

// endpoint for posting foods

// app.post("/foods", async (req, res) => {
//   try {
//     const foodDetails = req.body;
//     const food = await foodModel.create(foodDetails);
//     res.status(201).send({ message: "food created successfully." });
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({ message: "something wrong happened." });
//   }
// });

app.listen(8000, () => {
  console.log("Server connected successfully.");
});
