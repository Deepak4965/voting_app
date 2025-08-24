const jwt = require('jsonwebtoken');
require('dotenv').config();
// Middleware Function
const jwtMiddleware = (req, res, next) => {

    //first check request headers the authorization or not
    const authorization = req.headers.authorization;
    if (!authorization) return res.status(401).json({ error: "Token not Found" });

    const token = req.headers.authorization.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        req.userPayload = decode;
        next();
    } catch (error) {
        console.log(error);
        res.status(401).json({ error: "Invalid token" });
    }
};

// Function to generate JWT token
const generateToken = (userData) => {
    return jwt.sign(userData, process.env.JWT_SECRET);//
};

module.exports = { jwtMiddleware, generateToken };
