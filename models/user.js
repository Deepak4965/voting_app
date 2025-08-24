const mongoose = require('mongoose')
const bcrypt=require('bcrypt')

//Define the user Schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    age: {
        type: Number
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    mobile: {
        type: String
    },
    address: {
        type: String,
        required: true,
    },
    addharCardNumber: {
        type: Number,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["voter", "admin"],
        default: "voter"
    },
    isVoted: {
        type: Boolean,
        default: false
    }

})
userSchema.pre('save', async function (next) {
    const Person = this;

    //Hash the password only if it has been modified (or is now)
    if (!Person.isModified('password')) return next() // true-->false do not skip and reverse false-->true->skip to not hashing
    try {
        //hash paaword generation
        const salt = await bcrypt.genSalt(10);

        //hash password
        const hashpassword = await bcrypt.hash(Person.password, salt);

        //Override the plain password with the hashed one
        Person.password = hashpassword;
        next();
    } catch (err) {
        return next(err)
    }
})

userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        //Use bcrypt to compare the provided password with hashed password
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        return isMatch;
    } catch (err) {
        throw err;
    }
}

const User = mongoose.model("User", userSchema)
module.exports = User