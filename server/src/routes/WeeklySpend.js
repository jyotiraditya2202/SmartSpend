const express     = require('express');
const mongoose    = require('mongoose');
const router      = express.Router();
const WeeklyRecord= require('../models/WeeklyRecord');
const User        = require('../models/User');
const SpendData   = require('../models/SpendData');
const DateUtils   = require('../Utils/DateUtils');
const auth        = require('../middleware/auth');

const spendCategories = [
  "Groceries","Entertainment","Utilities","Transportation",
  "Dining Out","Shopping","Health","Other"
];

// --- reusable insert functtion ---

async function insert(userId){
    try{
    const user   = await User.findById(userId);

    if (!user) {
        return { success: false, error: 'User not found' };
    }

    const today       = new Date();
    const StartOfWeek = DateUtils.getStartOfWeek(today);
    const EndOfWeek   = DateUtils.getEndOfWeek(today);

    // Only insert if not exists
    const exists = await WeeklyRecord.exists({
    user_id: userId,
    StartDate: StartOfWeek
    });
    if (exists) {
        return { success: true, msg: 'Weekly record already exists' };
    }

    const rec = new WeeklyRecord
    ({
        user_id:    userId,
        StartDate:  StartOfWeek,
        EndDate:    EndOfWeek,
        budget:     user.budget
    });

    await rec.save();
    return { success: true, msg: 'Weekly record inserted successfully' };
    }
    catch(err){
        return { success: false, msg: err };
    }
    
}

// ---  reusable sync function ---
async function sync(userId){
    try{    
        const user = await User.findOne({_id: userId});

        if(!user){
            return { success: false, msg: 'user not exist !!' };
        }
        const today = new Date();

        const StartOfWeek = DateUtils.getStartOfWeek(today);
        const EndOfWeek = DateUtils.getEndOfWeek(today);

        const spendByCategory = await SpendData.aggregate([
            {
            $match: {
                user_id: new mongoose.Types.ObjectId(userId),
                date: {
                $gte: StartOfWeek,
                $lte: EndOfWeek
                }
            }
            },
            {
            $group: {
                _id: "$category",
                total: { $sum: "$spend" }
            }
            }
        ]);

        // Initialize all categories with 0
        const categoryTotals = {};
        spendCategories.forEach(cat => {
            categoryTotals[cat] = 0;
        });

        // Fill in actual totals
        spendByCategory.forEach(item => {
            if (item._id && categoryTotals.hasOwnProperty(item._id)) {
            categoryTotals[item._id] = item.total;
            }
        });

        const totalSpend = Object.values(categoryTotals).reduce((acc, val) => acc + val, 0);

        const updateObject = {
        budget: user.budget,
        totalSpend: totalSpend,
        };

        spendCategories.forEach(category => {
        updateObject[`categories.${category}`] = categoryTotals[category];
        });

        const updatedRecord = await WeeklyRecord.findOneAndUpdate(
        {
            user_id: userId,
            StartDate: StartOfWeek
        },
        {
            $set: updateObject
        },
        {
            new: true
        }
        );

        if(!updatedRecord){
            const response = await insert(userId);

            if (response.success) {

            reUpdateRecord = await WeeklyRecord.findOneAndUpdate(
                        { user_id: userId, StartDate: StartOfWeek },
                        { $set: updateObject },
                        { new: true }
                    );

            return { success: true, msg: 'Succefully inserted and synced the weekly record!!' };
            
            } else {

            return { success: false, msg: 'Error while inserting and syncing the weekly record!!' };
            }
        
        }
        return { success: true, msg: 'Succefully synced the weekly record !!' };

    }
    catch(err){
        return { success: false, msg: "Internal sync function error!!" };
    }

}

// @route   POST /api/WeeklySpend/sync
// @desc    it will update the Weekly record 
router.post('/sync', auth, async (req, res) => {
    try {

        const userId = req.user.user.id;
        const response = await sync(userId);

        if(response.success){
            return res.status(200).json({ msg: response.msg });
        }
        else{
            return res.status(500).json({ msg: response.msg });
        }
    
    } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "week can not be updated!!" });
    }
});

// @route   POST /api/WeeklySpend/fetchdata
// @desc    used for fetch all data of the Weekly spend of the user

router.post('/fetchdata', auth, async (req, res) => {
    try {

        const userId = req.user.user.id;

        const user = await User.findOne({_id: userId});

        if(!user){
            return res.status(404).json({error: 'user not found while fetching budget'});
        }

        // --- selecting all from the month data ---
        const weeklyData = await WeeklyRecord.find({ user_id: userId })
            .sort({ StartDate: 1 }); 

            console.log(weeklyData);
            res.status(200).json(weeklyData);

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "month can not be fetched!!" });
    }
    });


module.exports = router;
