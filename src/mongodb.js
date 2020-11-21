const mongoose = require('mongoose');
const schemaName = {
  USER: "users",
  EVENT: "events",
  PERSON: "persons",
}
const gender = {
  MALE: "M",
  FEMALE: "W",
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
    },
    comments: {
      type: String,
    },
  } },
  { timestamps: true },
);

const personSchema = new mongoose.Schema(
  { person: {
      firstname: {
        type: String,
        required: true,
      },
      lastname: {
        type: String,
        required: true,
      },
      age: {
        type: Number,
        required: true,
      },
      street: {
        type: String,
        required: true,
      },
      street_number: {
        type: Number,
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
      },
      phone: {
        type: Number,
      },
      emergency_phone: {
        type: Number,
      },
      event: {
        type: Array,
        required: true,
      },
      gender: {
        type: gender,
        required: true,
      },
      class:{
        type: String,
      },
      comments:{
        type: String,
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
