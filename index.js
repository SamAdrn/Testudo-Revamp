// ==================== Importing Modules ====================

const fetch = (...args) =>
    import("node-fetch").then(({ default: fetch }) => fetch(...args));

// Include express framework to utilize network features
const express = require("express");

// Include node:path module to work with files and directory paths
const path = require("path");

// Include body-parser to parse URL encoded data
const bodyParser = require("body-parser");

// Include serve-favicon middleware
const favicon = require("serve-favicon");

// Import credentials environment file
require("dotenv").config({ path: path.resolve(__dirname, "credentials/.env") });

// ==================== Setting up Express ====================

// Create an Express application
const app = express();

// Set up Express to access the templates folder
app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");

// Set up Express to access public folder for CSS stylesheets
app.use(express.static("public"));

// Set up Express to use body parser
app.use(bodyParser.urlencoded({ extended: false }));

// Add a favicon (STILL NOT WORKING)
app.use(favicon(path.join(__dirname, "public", "media", "favicon.ico")));

// Initialize command line
process.stdin.setEncoding("utf8");

// Store port number
const portNumber = 3000;

// Start the server
app.listen(portNumber);
console.log(`Web server started and running at http://localhost:${portNumber}`);

// ==================== Setting up MongoDB ====================

// Include the MongoDB driver for Node.js
const { MongoClient, ServerApiVersion } = require("mongodb");

/* Object to store details related to our databse */
const mongo = {
    user: process.env.MONGO_DB_USERNAME,
    pass: process.env.MONGO_DB_PASSWORD,
    dbName: process.env.MONGO_DB_NAME,
    collection: process.env.MONGO_COLLECTION,
};

// Establish a connection to our database
const uri =
    `mongodb+srv://${mongo.user}:${mongo.pass}` +
    `@cluster0.ykceako.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});

// ==================== Web Server Processing ====================

// Show index.ejs in GET request to root page
app.get("/", (req, res) => {
    res.render("index");
});

// Perform search for POST request to /search
app.post("/search", async (req, res) => {
    const url = `https://api.umd.io/v1/courses/${req.body.course}`;

    await fetch(url)
        .then((response) => response.json())
        .then(async function (json) {
            let sectionsArr = [];

            for (let course of json) {
                const urlSect = `https://api.umd.io/v1/courses/sections?course_id=${course.course_id}&per_page=100`;

                await fetch(urlSect)
                    .then((responseSect) => responseSect.json())
                    .then((jsonSect) => sectionsArr.push(jsonSect));
            }
            res.render("courses", {
                courses: json,
                sections: sectionsArr,
            });
        })
        .catch((error) => res.render("error", { url: url, error: error }));
});

// Handle adding course sections to favorites
app.post("/fav", async (req, res) => {
    const cse = req.body.id.split("-");

    try {
        await client.connect();

        if (req.body.act === "add") {
            // Add to Favorites
            await client
                .db(mongo.dbName)
                .collection(mongo.collection)
                .insertOne({ course: cse[0], section: cse[1] });
        } else {
            // Remove from Favorites
            await client
                .db(mongo.dbName)
                .collection(mongo.collection)
                .deleteOne({ course: cse[0], section: cse[1] });
        }
    } catch (e) {
        console.log(e);
    } finally {
        await client.close();
    }

    res.end();
});

app.get("/favorites", async (req, res) => {
    let result, favArr = [];

    try {
        await client.connect();

        const cursor = client
            .db(mongo.dbName)
            .collection(mongo.collection)
            .find();

        result = await cursor.toArray();
    } catch (e) {
        console.log(e);
    } finally {
        await client.close();
    }

    await Promise.all(result.map(async (cse) => {
        const url = `https://api.umd.io/v1/courses/sections/${cse.course}-${cse.section}`;
        await fetch(url)
            .then((response) => response.json())
            .then((json) => favArr.push(json[0]))
            .catch((error) => res.render("error", { url: url, error: error }));
    }))

    console.log("DONE===========");
    console.log(favArr);

    res.render("favorites", {courses: favArr});
});

// ==================== Functions ====================
