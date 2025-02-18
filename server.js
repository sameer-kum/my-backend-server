require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const User = require('./models/User');  // Import the User model
const authRoutes = require('./routes/authRoutes'); // Import auth routes
const authMiddleware = require('./middleware/authMiddleware'); // Import auth middleware
const bcrypt = require('bcryptjs');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("Error connecting to MongoDB: ", err));

// Set up Multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Add Authentication Routes
app.use('/api/auth', authRoutes);

// Get User profile
app.get('/api/user/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// Update User Profile
app.put("/api/user/updateProfile", authMiddleware, async (req, res) => {
  try {

      const userId = req.user.userId; // Get user ID from token

      const { name, userName, phoneNo, gender, maritalStatus, dateOfBirth, timeOfBirth, placeOfBirth, profilePhotoPath, language, password } = req.body;

      // Check if username is being updated and already taken
      if (userName) {
          const existingUser = await User.findOne({ userName, _id: { $ne: userId } });
          if (existingUser) {
              return res.status(400).json({ message: "Username is already taken" });
          }
      }

      let updateData = { name, userName, phoneNo, gender, maritalStatus, dateOfBirth, timeOfBirth, placeOfBirth, profilePhotoPath, language };

      // If password is provided, hash it before updating
      if (password) {
          const salt = await bcrypt.genSalt(10);
          updateData.password = await bcrypt.hash(password, salt);
      }

      // Update user profile
      const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true, select: "-password" });

      res.json({ message: "Profile updated successfully", user: updatedUser });

  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
  }
});

// delete User Account
app.delete('/api/user/delete', authMiddleware, async (req, res) => {
  try {
      const userId = req.user.userId; // Extract user ID from JWT token

      // Find and delete user
      const user = await User.findByIdAndDelete(userId);
      console.log("Received USERID:", userId);
      if (!user) {
          return res.status(404).json({ message: "User not found sorry" });
      }

      res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Server error" });
  }
});

// Start server
app.listen(port,'0.0.0.0',  () => {
  console.log(`Server running at http://localhost:${port}`);
});