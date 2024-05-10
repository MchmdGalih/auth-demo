const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const session = require("express-session");
const app = express();
const User = require("./models/user");

mongoose
  .connect("mongodb://127.0.0.1:27017/authDemo", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("CONNECTED TO MONGODB");
  })
  .catch((err) => {
    console.log(err);
    console.log("COULD NOT CONNECT TO MONGODB");
  });

app.set("view engine", "ejs");
app.set("views", "views");

const sessionConfig = {
  secret: "thisismysecret",
};
app.use(express.urlencoded({ extended: true }));
app.use(session(sessionConfig));

app.get("/", (req, res) => {
  res.send("THIS IS HOMEPAGE");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/login", (req, res) => {
  res.render("login");
});

//! require middleware login.
const requireLogin = (req, res, next) => {
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  next();
};

//! route.
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  //! opsi pertama yg kedua liat di model user flownya.
  // const hashed = await bcrypt.hash(password, 12);
  // const user = new User({ username, password: hashed });

  //! opsi kedua
  const user = new User({ username, password });
  await user.save();
  req.session.user_id = user._id;
  res.redirect("/login");
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  //! opsi gampangnyaa pengecekan password saja.
  // const user = await User.findOne({ username });
  // const validatePassword = await bcrypt.compare(password, user.password);

  //! opsi pengecekan username & password, flownya di modelnya.
  const userMatch = await User.findByCredentials(username, password);
  if (userMatch) {
    req.session.user_id = userMatch._id;
    res.redirect("/secret");
  } else {
    res.redirect("/login");
  }
});

//! call middleware di route.
app.get("/secret", requireLogin, (req, res) => {
  res.render("secret");
});

app.get("/topSecret", requireLogin, (req, res) => {
  res.send("TOP SECRET PAGE with MIDDLEWARE!");
});

app.post("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

app.listen(3000, () => {
  console.log("SERVING YOUR API! ");
});
