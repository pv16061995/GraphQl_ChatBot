const mongoose = require("mongoose");
const moment = require("moment");
const DATETIMEFORMAT = "DD-MMM-YYYY, h:mm:ss A";

const messageSchema = new mongoose.Schema({
  message: {
    type: String,
    trim: true,
    lowercase: true,
    required: true
  },
  from_user_id:{
    type:String,
    trim:true,
    required:true
  },
  group_id:{
    type:String,
    trim:true,
    required:true
  },
  is_deleted: { type: Boolean, default: false },
  created_date: {
    type: Date,
    default: moment.utc().format(DATETIMEFORMAT)
  }
});

module.exports = mongoose.model("message", messageSchema);
