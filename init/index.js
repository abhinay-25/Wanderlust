if(process.env.NODE_ENV != "production") {
    require('dotenv').config();
}

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");

const dbUrl = process.env.ATLASDB_URL;

main().then(() => {
    console.log("connected to DB");
}).catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect(dbUrl);
}

const initDB = async () => {
    try {
        // First clear existing data
        await Listing.deleteMany({});
        await User.deleteMany({});

        // Create a default user
        const defaultUser = new User({
            email: "admin@wanderlust.com",
            username: "admin_user"
        });

        const registeredUser = await User.register(defaultUser, "wanderlust123");
        console.log("Default user created");

        // Add listings with the new user's ID
        initData.data = initData.data.map((obj) => ({...obj, owner: registeredUser._id}));
        await Listing.insertMany(initData.data);
        console.log("data was initialized successfully");
    } catch (err) {
        console.log("Error initializing data:");
        console.log(err);
    }
}

initDB().then(() => {
    mongoose.connection.close();
    console.log("Database connection closed.");
});