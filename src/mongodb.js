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
    },
    role:{
      type: String,
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

const personSchema = new mongoose.Schema(
  { person: {
      name: {
        type: String,
        required: true,
      },
      age: {
        type: Number,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      postcode: {
        type: Number,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      phone: {
        type: Number,
        required: true,
      },
      event: {
        type: String,
        required: true,
      },
      gender: {
        type: String,
        required: true,
      },
    } },
  { timestamps: true },
);

const User = mongoose.model(schemaName.USER, userSchema);
const Event = mongoose.model(schemaName.EVENT, eventSchema);
const Person = mongoose.model(schemaName.PERSON, personSchema);

module.exports = {
  connectDb,
  User,
  Event,
  Person,
  schemaName
}
