const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;

// mongodb user model
const User = require("../models/User");

// Password hashing
const bcrypt = require("bcrypt");

// Middleware to verify the token
function verifyToken(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(403).json({
      status: "FAILED",
      message: "No token provided",
    });
  }

  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        status: "FAILED",
        message: "Failed to authenticate token",
      });
    }

    // Save user information in request for further use
    req.user = decoded;
    next();
  });
}

// Signup
router.post("/signup", (req, res) => {
  let { name, email, password, dateOfBirth } = req.body;
  name = name.trim();
  email = email.trim();
  password = password.trim();
  dateOfBirth = dateOfBirth.trim();

  if (name === "" || email === "" || password === "" || dateOfBirth === "") {
    res.json({
      status: "FAILED",
      message: "Empty input fields!",
    });
  } else if (!/^[a-zA-ZæøåÆØÅ ]*$/.test(name)) {
    res.json({
      status: "FAILED",
      message: "Invalid name entered!",
    });
  } else if (!/^[\wæøåÆØÅ.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    res.json({
      status: "FAILED",
      message: "Invalid email entered!",
    });
  } else if (!new Date(dateOfBirth).getTime()) {
    res.json({
      status: "FAILED",
      message: "Invalid date of birth entered",
    });
  } else if (password.length < 8) {
    res.json({
      status: "FAILED",
      message: "Password is too short!",
    });
  } else {
    // Check if email already exists
    User.find({ email })
      .then((result) => {
        if (result.length) {
          // A user already exists
          res.json({
            status: "FAILED",
            message: "User with the provided email already exists!",
          });
        } else {
          // Try to create new user

          // Password hashing
          const salt = bcrypt.genSaltSync(10);
          const hash = bcrypt.hashSync(password, salt);
          password = hash;

          const user = new User({
            name,
            email,
            password,
            dateOfBirth,
          });
          user
            .save()
            .then((result) => {
              const token = jwt.sign(
                { userId: result._id, email: result.email },
                jwtSecret
              ); // Generate token
              res.json({
                status: "SUCCESS",
                message: "Signup was successful!",
                data: {
                  token,
                  user: {
                    userId: result._id,
                    name: result.name,
                    email: result.email,
                    // other user details
                  },
                },
              });
            })
            .catch((err) => {
              console.log(err);
              res.json({
                status: "FAILED",
                message: "An error occurred while saving user account!",
              });
            });
        }
      })
      .catch((err) => {
        console.log(err);
        res.json({
          status: "FAILED",
          message: "An error occurred while checking for existing user!",
        });
      });
  }
});

// Signin
router.post("/signin", (req, res) => {
  let { email, password } = req.body;
  email = email.trim();
  password = password.trim();

  if (email === "" || password === "") {
    res.json({
      status: "FAILED",
      message: "Empty credentials supplied!",
    });
  } else {
    // Check if user exists
    User.find({ email })
      .then((data) => {
        if (data.length) {
          // User exists
          const hashedPassword = data[0].password;
          if (bcrypt.compareSync(password, hashedPassword)) {
            // Correct password
            const token = jwt.sign(
              { userId: data[0]._id, email: data[0].email },
              jwtSecret
            );
            res.json({
              status: "SUCCESS",
              message: "Signin successful!",
              data: {
                token,
                user: {
                  userId: data[0]._id,
                  name: data[0].name,
                  email: data[0].email,
                  // other user details
                },
              },
            });
          } else {
            res.json({
              status: "FAILED",
              message: "Invalid password entered!",
            });
          }
        } else {
          // User does not exist
          res.json({
            status: "FAILED",
            message: "Invalid credentials entered!",
          });
        }
      })
      .catch((err) => {
        console.log(err);
        res.json({
          status: "FAILED",
          message: "An error occurred while checking for existing user!",
        });
      });
  }
});

// Fetch user information
router.get("/profile/:userId", verifyToken, (req, res) => {
  const userId = req.params.userId;

  User.findById(userId)
    .then((user) => {
      if (!user) {
        res.json({
          status: "FAILED",
          message: "User not found",
        });
      } else {
        res.json({
          status: "SUCCESS",
          message: "User information retrieved successfully",
          data: user,
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.json({
        status: "FAILED",
        message: "An error occurred while fetching user information",
      });
    });
});

// Update user information
router.put("/update/:userId", verifyToken, (req, res) => {
  const userId = req.params.userId;
  const {
    name,
    email,
    dateOfBirth,
    password,
    address,
    zipCode,
    city,
    phone,
    regNu,
  } = req.body;

  // Validation checks
  if (!name || name.trim() === "") {
    res.json({
      status: "FAILED",
      message: "Name cannot be empty!",
    });
  } else if (!/^[a-zA-ZæøåÆØÅ ]*$/.test(name)) {
    res.json({
      status: "FAILED",
      message: "Invalid name entered!",
    });
  } else if (email && !/^[\wæøåÆØÅ.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    res.json({
      status: "FAILED",
      message: "Invalid email entered!",
    });
  } else if (dateOfBirth && !new Date(dateOfBirth).getTime()) {
    res.json({
      status: "FAILED",
      message: "Invalid date of birth entered",
    });
  } else if (password && password.trim() !== "" && password.length < 8) {
    res.json({
      status: "FAILED",
      message: "Password is too short!",
    });
  } else if (
    phone &&
    !/^\+?[0-9]+$/.test(phone) // Example phone validation, adjust as needed
  ) {
    res.json({
      status: "FAILED",
      message: "Invalid phone number!",
    });
  } else if (
    zipCode &&
    !/^\d{4}$/.test(zipCode) // Example zip code validation, adjust as needed
  ) {
    res.json({
      status: "FAILED",
      message: "Invalid zip code!",
    });
  } else {
    User.findById(userId)
      .then((user) => {
        if (!user) {
          res.json({
            status: "FAILED",
            message: "User not found",
          });
        } else {
          // Update user fields
          user.name = name || user.name;
          user.email = email || user.email;
          user.dateOfBirth = dateOfBirth || user.dateOfBirth;
          user.address = address || user.address;
          user.zipCode = zipCode || user.zipCode;
          user.city = city || user.city;
          user.phone = phone || user.phone;
          user.regNu = regNu || user.regNu;

          if (password) {
            // Update password if provided
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(password, salt);
            user.password = hash;
          }

          // Save updated user
          user
            .save()
            .then((result) => {
              res.json({
                status: "SUCCESS",
                message: "User information updated successfully",
                data: result,
              });
            })
            .catch((err) => {
              console.log(err);
              res.json({
                status: "FAILED",
                message:
                  "An error occurred while saving updated user information",
              });
            });
        }
      })
      .catch((err) => {
        console.log(err);
        res.json({
          status: "FAILED",
          message: "An error occurred while updating user information",
        });
      });
  }
});

// Delete user
router.delete("/delete/:userId", verifyToken, (req, res) => {
  const userId = req.params.userId;

  User.findByIdAndDelete(userId)
    .then(() => {
      res.json({
        status: "SUCCESS",
        message: "User deleted successfully",
      });
    })
    .catch((err) => {
      console.log(err);
      res.json({
        status: "FAILED",
        message: "An error occurred while deleting the user",
      });
    });
});

// Change password
router.post("/change-password", verifyToken, (req, res) => {
  const userId = req.user.userId; // Get the userId from the token
  const { currentPassword, newPassword } = req.body;

  User.findById(userId)
    .then((user) => {
      if (!user) {
        res.json({
          status: "FAILED",
          message: "User not found",
        });
      } else {
        const hashedPassword = user.password;

        if (bcrypt.compareSync(currentPassword, hashedPassword)) {
          const salt = bcrypt.genSaltSync(10);
          const hash = bcrypt.hashSync(newPassword, salt);

          user.password = hash;

          user
            .save()
            .then((result) => {
              res.json({
                status: "SUCCESS",
                message: "Password changed successfully",
              });
            })
            .catch((err) => {
              console.log(err);
              res.json({
                status: "FAILED",
                message: "An error occurred while saving updated password",
              });
            });
        } else {
          res.json({
            status: "FAILED",
            message: "Invalid current password",
          });
        }
      }
    })
    .catch((err) => {
      console.log(err);
      res.json({
        status: "FAILED",
        message: "An error occurred while changing the password",
      });
    });
});

module.exports = router;
