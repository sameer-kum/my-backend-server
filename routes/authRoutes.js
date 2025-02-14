const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const router = express.Router();

// Register User
router.post("/register", async (req, res) => {
    try {

        console.log("Received Request Body:", req.body);

        const { name, userName, phoneNo, email, password, gender, maritalStatus, dateOfBirth, timeOfBirth, placeOfBirth, profilePhotoPath, language  } = req.body;

        // Check for missing fields
        const missingFields = [];
        if (!name) missingFields.push("Name");
        if (!userName) missingFields.push("UserName"); 
        if (!phoneNo) missingFields.push("PhoneNo");
        if (!email) missingFields.push("Email");
        if (!password) missingFields.push("Password");
        if (!gender) missingFields.push("Gender");
        if (!maritalStatus) missingFields.push("MaritalStatus");
        if (!dateOfBirth) missingFields.push("DateOfBirth");
        if (!timeOfBirth) missingFields.push("BirthTime");
        if (!placeOfBirth) missingFields.push("BirthPlace");

        if (missingFields.length > 0) {
            return res.status(400).json({ message: `Required fields are missing: ${missingFields.join(", ")}` });
        }

        // Check if email already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists with this email" });
        }

        // Check if username already exists
        user = await User.findOne({ userName });
        if (user) {
            return res.status(400).json({ message: "Username is already taken " });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        user = new User({
            name,
            userName,
            phoneNo, 
            email,    
            password: hashedPassword,
            gender,
            maritalStatus,
            dateOfBirth,
            timeOfBirth,
            placeOfBirth,
            profilePhotoPath,
            language 
        });

        // Save the user after checking for duplicate username
        await user.save();

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        // Return success message, token, and user info
        res.status(201).json({
            msg: "User registered successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                userName: user.userName,
                phoneNo: user.phoneNo,
                email: user.email,
                gender: user.gender,
                maritalStatus: user.maritalStatus,
                dateOfBirth: user.dateOfBirth,
                timeOfBirth: user.timeOfBirth,
                placeOfBirth: user.placeOfBirth,
                profilePhotoPath: user.profilePhotoPath,
                language: user.language
            }
        });

    } catch (error) {
        // Catch and log any MongoDB errors or unexpected errors
        console.error(error);

        // Check for MongoDB duplicate key error (error code 11000)
        if (error.code === 11000) {
            return res.status(400).json({ message: "Duplicate field value entered" });
        }

        // For any other error, return 500 Server Error
        res.status(500).json({ message: "Internal Server Error" });
    }
});


// Login User
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Log to ensure the email and password are present
        console.log('Email:', email);
        console.log('Password:', password);

        // Check if email or password is missing
        if (!email || !password) {
            return res.status(400).json({ msg: 'Please provide both email and password' });
        }

        // Check if user exists
        let user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

        // Validate Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

        // Generate JWT Token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Respond with the token and user info
        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (err) {
        // Log the error details to the console for debugging
        console.error('Login error:', err);

        // Send a generic error response
        res.status(500).send('Server Error');
    }
});




module.exports = router;
