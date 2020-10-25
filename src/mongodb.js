const mongodb = require('mongodb');
const mongoose = require('mongoose');

require('dotenv').config();

const connectDb = () => {
  return mongoose.connect(process.env.MONGODB_URL,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
  });
};


async function loadCollection(collectionName, dbName) {
  try {
    const dbInstance = await mongodb.MongoClient.connect(dbURL, {
      useNewUrlParser: true, useUnifiedTopology: true,
    });
    return dbInstance.db(dbName).collection(collectionName);
  } catch (err){
    throw new Error(`cant connect to db: ${err}`);
  }
}

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

const User = mongoose.model('User', userSchema);

async function getCollectionNames(dbName) {
  try {
    const dbInstance = await mongodb.MongoClient.connect(dbURL, {
      useNewUrlParser: true, useUnifiedTopology: true,
    });
    return dbInstance.db(dbName).listCollections({}).toArray();
  } catch (err){
    throw new Error(`cant connect to db: ${err}`);
  }
}

module.exports = {
  connectDb,
  User,
  loadCollection,
  getCollectionNames,
}
