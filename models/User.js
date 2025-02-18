const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  
  name: { type: String, required: true },
  userName: { type: String, required: true, unique: true },
  phoneNo: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  gender: { type: String, required: true },
  maritalStatus: { type: String, required: true },
  dateOfBirth: { type: String, required: true },
  timeOfBirth: { type: String, required: true },
  placeOfBirth: { type: String, required: true },
  profilePhotoPath: { type: String },
  language: {
    type: String,
    enum: ['English', 'Hindi', 'French', 'Spanish'],
    default: 'English'
}
});

const User = mongoose.model('User', userSchema);

module.exports = User;
