const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: String,
    email: String,
    password: String,
    dateOfBirth: Date,
    address: {
      type: String,
      default: "",
    },
    zipCode: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    regNu: {
      type: String,
      default: "",
    },
    notificationSettings: {
      receiveSMSActive: {
        type: Boolean,
        default: false,
      },
      receiveNotificationsActive: {
        type: Boolean,
        default: false,
      },
      receiveSMSExpiring: {
        type: Boolean,
        default: false,
      },
      receiveNotificationsExpiring: {
        type: Boolean,
        default: false,
      },
      receiveEmailReceipts: {
        type: Boolean,
        default: false,
      },
      receiveNotificationsMarketing: {
        type: Boolean,
        default: false,
      },
      activeParkingHours: {
        type: Number,
        default: 15,
      },
      expiringSoonHours: {
        type: Number,
        default: 15,
      },
    },
    preferenceSettings: {
      darkMode: {
        type: Boolean,
        default: false,
      },
      language: {
        type: String,
        default: "danish",
      },
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
