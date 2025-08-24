const express = require("express")
const router = express.Router()
const User = require('../models/user')
const { jwtMiddleware, generateToken } = require('../jwt')

//singup route
router.post('/signup', async (req, res) => {
    try {
        const data = req.body // Assuming the request body contains the person data

        //Create a new Person document using the Mongosse model
        const newUser = new User(data);

        //Save the new person to the daatbase
        const response = await newUser.save();
        console.log("data saved");

        const payloade = {
            id: response.id, 
        }
        console.log(JSON.stringify(payloade));
        const token = generateToken(payloade)
        console.log("Token is : ", token);

        res.status(200).json({ response: response, token: token })
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

//Login route
router.post('/login', async (req, res) => {
    try {
        //Extract addharCardNumber and password from request body
        const { addharCardNumber, password } = req.body;

        //find the user by addharCardNumber
        const user = await User.findOne({ addharCardNumber: addharCardNumber })

        //If user data not exist or passwoed does not match,return error
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ Error: "Invalid username or password" })
        }

        //generate Token
        const payload = {
            id: user.id,
        }
        const token = generateToken(payload);

        //rerurn token as response
        res.json({ token })

    } catch (error) {
        console.log(error);
        res.status(500).json({ Error: "Internal server Error " })
    }
})

//profile route
router.get('/profile', jwtMiddleware, async (req, res) => {
    try {
        const userData = req.userPayload;
        const userId = userData.id;
        const user = await User.findById(userId)
        res.status(200).json({ user })
    } catch (error) {
        console.log(error);
        res.status(500).json({ Error: "Internal server error" })
    }
})

//profile and password route
router.put('/profile/password', jwtMiddleware, async (req, res) => {
    try {
        const userId = req.userPayload.id;//Extract the work type from the URL parameter
        const { currentPassword, newPassword } = req.body; //Extract current and new password from request body

        //Find the user by userID
        const user = await User.findById(userId)

        //If passwoed does not match,return error
        if (!(await user.comparePassword(currentPassword))) {
            return res.status(401).json({ Error: "Invalid username or password" })
        }

        //update the user's password
        user.password = newPassword;
        await user.save();

        console.log("Password Updated");
        res.status(200).json({ message: "Password Updated" })
    } catch (error) {
        console.log(error);
        res.status(500).json({ Error: "Internal server error" })
    }
})

module.exports = router;