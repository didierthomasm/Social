const { connect, connection } = require('mongoose');

const connectionString = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/socialDB';

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

connect(connectionString, options).catch((error) => {
  console.error('Error on connecting to MongoDB:', error);
});

connection.once('open', () => {
  console.log('Connected to MongoDB');
});

connection.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});

connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

module.exports = connection;
