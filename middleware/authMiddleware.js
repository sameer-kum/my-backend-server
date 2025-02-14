const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // Get the token from Authorization header (Bearer <token>)
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

    try {
        // Decode the token using the JWT_SECRET
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Attach the userId from the decoded token to the request object
        req.user = { userId: decoded.userId };

        next(); // Proceed to the next middleware or route handler
    } catch (err) {
        res.status(401).json({ msg: 'Invalid token' });
    }
};
