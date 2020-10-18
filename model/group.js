const mongoose = require("mongoose");
const moment = require("moment");
const DATETIMEFORMAT = "DD-MMM-YYYY, h:mm:ss A";

const groupSchema = new mongoose.Schema({
  group_name: {
    type: String,
    trim: true,
    lowercase: true,
    required: true
  },
  user_ids:{
  	type:Array, default: [], index: true
  },
  is_active: { type: Boolean, default: true },
  is_deleted: { type: Boolean, default: false },
  created_date: {
    type: Date,
    default: moment.utc().format(DATETIMEFORMAT)
  },
  last_updated: {  type: Date,
    default: moment.utc().format(DATETIMEFORMAT) }
});

module.exports = mongoose.model("group", groupSchema);
