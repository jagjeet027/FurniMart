const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true, // Removes extra spaces
    },
    mobile: {
      type: String, 
      match: [/^\d{10}$/, "Please provide a valid 10-digit mobile number"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    phone: {
      type:Number,
      required:true

    }
  },
  { timestamps: true });


const Admin = mongoose.model("Admin", AdminSchema);

module.exports = Admin;
