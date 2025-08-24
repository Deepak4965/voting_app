const express = require("express")
const router = express.Router()
const Candidate = require('../models/candidate')
const User = require('../models/user')
const { jwtMiddleware, generateToken } = require('../jwt')
const { route } = require("./userRoutes")

const checkAdminRole = async (userID) => {
    try {
        const user = await User.findById(userID)
        if (user.role == "admin")
            return true;
    } catch (error) {
        return false
    }
}

//POSt route to add a candidate
router.post('/', jwtMiddleware, async (req, res) => {

    try {
        if (!checkAdminRole(req.userPayload.id)) {
            return res.status(403).json({ message: "User does not have admin role" })
        }
        const data = req.body // Assuming the request body contains the candidate data

        //Create a new Person document using the Mongosse model
        const newCandidate = new Candidate(data);

        //Save the new person to the daatbase
        const response = await newCandidate.save();
        console.log("data saved");

        res.status(200).json({ response: response })
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

//profile and password route
router.put('/:candidateID', jwtMiddleware, async (req, res) => {
    try {
        if (!checkAdminRole(req.userPayload.id)) {
            return res.status(403).json({ message: "User does not have admin role" })
        }
        const CandidateID = req.params.candidateID// Extract the id from the URL parameter
        const updatedPCandidateData = req.body //Updated data for the person

        const response = await User.findByIdAndUpdate(CandidateID, updatedPCandidateData, {
            new: true, //Return the updated doucment
            runValidators: true,// Run Mongoose Validation
        })
        if (!response) {
            return res.status(404).json({ error: "Candidate not found" })
        }
        console.log("candidate data updated");
        res.status(200).json(response)
    } catch (error) {
        console.log(error);
        res.status(500).json({ Error: "Internal server error" })
    }
})

router.delete('/:candidateID', jwtMiddleware, async (req, res) => {
    try {
        if (!checkAdminRole(req.userPayload.id)) {
            return res.status(403).json({ message: "User has not admin role" })
        }
        const CandidateID = req.params.candidateID// Extract the id from the URL parameter


        const response = await User.findByIdAndUpdate(CandidateID)

        if (!response) {
            return res.status(404).json({ error: "Candidate not found" })
        }
        console.log("candidate data updated");
        res.status(200).json(response)
    } catch (error) {
        console.log(error);
        res.status(500).json({ Error: "Internal server error" })
    }
})

//let's start voting
router.post('/vote/:candidateID', jwtMiddleware, async (req, res) => {
    // no admin can vote 
    //user can only vote once

    candidateID = req.params.candidateID
    userId = req.userPayload.id;

    try {
        //find the candidate document with the specified candidateID
        const candidate = await Candidate.findById(candidateID);
        if (!candidate) {
            return res.status(404).json({ message: "Candidate not found" })
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "user not found" })
        }
        if (user.isVoted) {
            return res.status(400).json({ message: "You have already voted" })
        }
        if (user.role == 'admin') {
            return res.status(404).json({ message: "admin is not allowed" })
        }
        candidate.votes.push({ user: userId })
        candidate.votedCount++;
        await candidate.save()

        //update the user documents
        user.isVoted = true
        await user.save();

        res.status(200).json({ message: "vote recorded successfully" })
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ Error: "Internal server error" })
    }
})

//vote count
router.get('/vote/count', async (req, res) => {
    try {
        //find all candidate and sort them by votecount in descending order
        const candidates = await Candidate.find().sort({ votedCount: -1 });


        //Map the candidate to only return their name and voteCount
        const voteRecord = candidates.map((data) => {
            return {
                party: data.party,
                count: data.votedCount
            }
        })
        return res.status(200).json(voteRecord)
    } catch (error) {
        console.log(error);
        res.status(500).json({ Error: "Internal server error" })
    }
})


// Get List of all candidates with only name and party fields
router.get('/', async (req, res) => {
    try {
        // Find all candidates and select only the name and party fields, excluding _id
        const candidates = await Candidate.find({}, 'name party -_id')

        // Return the list of candidates
        res.status(200).json(candidates)
    } catch (err) {
        console.log(err);
        res.status(500).json({ Error: "Internal server error" })
    }
})

module.exports = router;