const mongoose = require('mongoose');
const schemaName = {
  USER: "users",
  EVENT: "events",
  PERSON: "persons",
}
require('dotenv').config();

const connectDb = () => {
  return mongoose.connect(process.env.MONGODB_URL,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
  });
};

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
    },
    password:{
      type: String,
      required: true,
    }
  },
  { timestamps: true },
);

const eventSchema = new mongoose.Schema(
  { event: {
    name: {
      type: String,
      unique: true,
      required: true,
    },
    eventDate:{
      type: Date,
      required: true,
    },
    place: {
      type: String,
      required: true,
    },
    participants: {
      type: Array,
      required: true
    }
  } },
  { timestamps: true },
);

const User = mongoose.model(schemaName.USER, userSchema);
const Event = mongoose.model(schemaName.EVENT, eventSchema);

module.exports = {
  connectDb,
  User,
  Event,
  schemaName
}
