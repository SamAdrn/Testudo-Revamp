// ==================== Importing Modules ====================

const fetch = (...args) =>
    import("node-fetch").then(({ default: fetch }) => fetch(...args));

// Include express framework to utilize network features
const express = require("express");

// Include node:path module to work with files and directory paths
const path = require("path");
//
const fs = require("fs");

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
    coursesDB: process.env.MONGO_DB_COURSES,
    favoritesCol: process.env.MONGO_FAVORITES,
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
    // Get Favorite Courses
    let result;
    try {
        await client.connect();

        const cursor = client
            .db(mongo.dbName)
            .collection(mongo.favoritesCol)
            .find({ course: req.body.course });

        result = await cursor.toArray();
    } catch (e) {
        console.log(e);
    } finally {
        await client.close();
    }

    // Retrieve courses from API and render them onto courses.ejs
    const url = `https://api.umd.io/v1/courses/${req.body.course}`;
    await fetch(url)
        .then((response) => response.json())
        .then(async function (json) {
            let sectionsArr = [],
                i = 0;

            for (let course of json) {
                const urlSect =
                    "https://api.umd.io/v1/courses/sections?" +
                    `course_id=${course.course_id}&per_page=100&sort=section_id`;

                await fetch(urlSect)
                    .then((responseSect) => responseSect.json())
                    .then((jsonSect) => sectionsArr.push(jsonSect));

                sectionsArr[i++].sort((x, y) =>
                    x.number.localeCompare(y.number)
                );
            }

            res.render("courses", {
                courses: json,
                sections: sectionsArr,
                favorites: result,
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
                .collection(mongo.favoritesCol)
                .insertOne({
                    course: cse[0],
                    section: cse[1],
                    department: cse[0].slice(0, 4),
                });
        } else {
            // Remove from Favorites
            await client
                .db(mongo.dbName)
                .collection(mongo.favoritesCol)
                .deleteOne({ course: cse[0], section: cse[1] });
        }
    } catch (e) {
        console.log(e);
    } finally {
        await client.close();
    }

    res.end();
});

// Handle GET Request to /favorites
app.get("/favorites", async (req, res) => {
    console.log(req.socket.remoteAddress);

    let result,
        favArr = [];

    // Obtain all favorite courses
    try {
        await client.connect();

        const cursor = client
            .db(mongo.dbName)
            .collection(mongo.favoritesCol)
            .find();

        result = await cursor.toArray();
    } catch (e) {
        console.log(e);
    } finally {
        await client.close();
    }

    // Convert all favorite courses to course objects through the API
    await Promise.all(
        result.map(async (cse) => {
            const url =
                "https://api.umd.io/v1/courses/sections/" +
                `${cse.course}-${cse.section}`;
            await fetch(url)
                .then((response) => response.json())
                .then((json) => favArr.push(json[0]))
                .catch((error) =>
                    res.render("error", { url: url, error: error })
                );
        })
    );

    // Sort favorite courses by DEPT -> COURSE_ID -> SECTION
    favArr.sort((x, y) => {
        let dept = x.course.slice(0, 4).localeCompare(y.course.slice(0, 4));
        let cse =
            dept === 0
                ? x.course.slice(4).localeCompare(y.course.slice(4))
                : dept;
        return cse === 0 ? x.number.localeCompare(y.number) : cse;
    });

    // Render favorite courses
    res.render("favorites", { courses: favArr });
});

// ==================== Functions ====================

// Execute every 24 hours
// setInterval(function () {
queryDatabaseForCourses();
// }, 1000 * 60 * 60 * 24);

function queryDatabaseForCourses() {
    // get all course code and name from api and store in local json file
    const url = "https://api.umd.io/v1/courses/list";
    fetch(url)
        .then((response) => response.json())
        .then(async function (json) {
            try {
                await client.connect();
                
                // delete courses_for_partialsearch.json file
                fs.unlinkSync('courses_for_partialsearch.json');
                arr = [];
                for (let course of json) {
                    map = {};
                    map["course_id"] = course.course_id;
                    map["name"] = course.name;
                    arr.push(map);
                }
                // create courses_for_partialsearch.json file
                fs.writeFileSync('courses_for_partialsearch.json', JSON.stringify(arr));   

                await client
                    .db(mongo.dbName)
                    .collection(mongo.coursesDB)
                    .insertMany(json);
            } catch (e) {
                console.log(e);
            } finally {
                await client.close();
            }
        })
        .catch((error) => console.log(error));
}
