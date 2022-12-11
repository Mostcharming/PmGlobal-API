const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: [true, 'Please tell us your name!'],
  },
  lastname: {
    type: String,
    required: [true, 'Please tell us your name!'],
  },
  gender: {
    type: String,
    enum: ['M', 'F'],
    required: [true, 'Please input either M or F'],
  },
  date_of_birth: {
    type: Date,
    required: [true, 'Please input date'],
  },

  dateCreatedAt: Date,
  dateUpdatedAt: Date,
});

const User = mongoose.model('User', userSchema);

module.exports = User;
