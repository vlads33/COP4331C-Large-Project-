const express = require('express');
const cors = require('cors');
const connectDB = require("/root/database/database.js");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());


/*app.use("/api", (req, res, next) =>
{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PATCH, DELETE, OPTIONS'
    );
    next();
});

const MongoClient = require("mongodb").MongoClient;
require("dotenv").config();
const url = process.env.MONGODB_URI;
const client = new MongoClient(url);
client.connect();
*/

connectDB();

/*app.get("/api/test", async (req, res) => {
    console.log("GET Request Successful!");
    res.send("Hello World!\n");
});*/

var api = require("./api.js");
api.setApp(app, connectDB);

// Serve React build
app.use(express.static(path.join(__dirname, "/root/frontend/dist")));

// Catch-all route (for React Router)
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "/root/frontend/dist", "index.html"));
});

app.listen(5000, console.log("Server starting on port 5000")); // start Node + Express server on port 5000
