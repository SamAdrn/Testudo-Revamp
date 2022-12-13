// ==================== Importing Modules ====================

const fetch = (...args) =>
    import("node-fetch").then(({ default: fetch }) => fetch(...args));

// Include express framework to utilize network features
const express = require("express");

// Include node:path module to work with files and directory paths
const path = require("path");

// Include body-parser to parse URL encoded data
const bodyParser = require("body-parser");

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
const { json } = require("body-parser");

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
            for (let course of json) {
                const urlSect = `https://api.umd.io/v1/courses/sections?course_id=${course.course_id}&per_page=100`;
                let sections;

                await fetch(urlSect)
                    .then((responseSect) => responseSect.json())
                    .then((jsonSect) => (sections = jsonSect));

                res.render("courses", {
                    courses: processCourse(course, sections),
                });
            }
        })
        .catch((error) => res.render("error", {url: url, error: error}));
});

// ==================== Functions ====================

function processCourse(course, sections) {
    let str =
        '<div class="card p-2">' +
        '<div class="card-body row g-0">' +
        '<div class="col-2">' +
        `<h2>${course.course_id}</h2>` +
        (course.relationships.formerly
            ? `<i class="text-muted d-block my-3">Formerly:<br>${course.relationships.formerly}</i>`
            : "") +
        (course.relationships.also_offered_as
            ? `<i class="text-muted d-block my-3">Also Offered As:<br>${course.relationships.also_offered_as}</i>`
            : "") +
        "</div>" +
        '<div class="col-8 pe-5 ps-5">' +
        `<h3 class="card-title mb-4">${course.name}</h3>` +
        "<hr>" +
        `<p><strong>Grading Method:</strong> ${course.grading_method.join(
            ", "
        )}</p>` +
        (course.relationships.credit_granted_for
            ? `<p><strong>Credit Granted For:</strong> ${course.relationships.credit_granted_for}</p>`
            : "") +
        (course.relationships.prereqs
            ? `<p><strong>Pre-requisites:</strong> ${course.relationships.prereqs}</p>`
            : "") +
        (course.relationships.coreqs
            ? `<p><strong>Co-requisites:</strong> ${course.relationships.coreqs}</p>`
            : "") +
        (course.relationships.restrictions
            ? `<p><strong>Restrictions:</strong> ${course.relationships.restrictions}</p>`
            : "") +
        (course.relationships.additional_info
            ? `<p><strong>Additional Info:</strong> ${course.relationships.additional_info}</p>`
            : "") +
        "</div>" +
        '<div class="col-2">' +
        '<div class="row mb-2">' +
        `<h5><strong>Credits:</strong> ${course.credits}</h5>` +
        "</div>" +
        (course.gen_ed.length === 0
            ? ""
            : '<div class="row my-2">' +
              `<h5><strong>Gen-Ed:</strong> ${course.gen_ed.join(", ")}</h5>` +
              "</div>") +
        (course.core.length === 0
            ? ""
            : '<div class="row my-2">' +
              `<h5><strong>Core:</strong> ${course.core.join(", ")}</h5>` +
              "</div>") +
        "</div>" +
        "</div>" +
        '<div class="row p-2">' +
        '<div class="col-2">' +
        "<h4>Course Description</h4>" +
        "</div>" +
        '<div class="col-10 pe-5 ps-5">' +
        `<p>${course.description}</p>` +
        "</div>" +
        "</div>" +
        '<div class="accordion" id="course-accordion">' +
        '<div class="accordion-item">' +
        '<h2 class="accordion-header" id="sections">' +
        '<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-sect" aria-expanded="false" aria-controls="flush-sect">' +
        '<h5 class="m-0">Sections</h5>' +
        "</button>" +
        "</h2>" +
        '<div id="flush-sect" class="accordion-collapse collapse" aria-labelledby="sections" data-bs-parent="#course-accordion">' +
        '<div class="accordion-body">';

    let i = 0;

    for (let section of sections) {
        i += 1;
        str +=
            '<div class="row g-0 p-3 ' +
            (section.open_seats < 1 ? "section-full" : "section-open") +
            '"' +
            (i % 2 === 0 ? 'style="background-color: #F8F9FA;"' : "") +
            ">" +
            '<div class="col-1">' +
            `<h6>${section.number}</h6>` +
            "</div>" +
            '<div class="col-5">' +
            `<h4>${section.instructors.join(", ")}</h4>` +
            `<h6>Seats Available: ${section.open_seats}/${section.seats}` +
            (section.open_seats < 1
                ? ` (${section.waitlist} in Waitlist)`
                : "") +
            "</h6>" +
            "</div>" +
            '<div class="col-6">';

        section.meetings.forEach((meeting) => {
            str +=
                '<div class="row">' +
                '<strong class="m-0 col-3">' +
                (meeting.classtype === "" ? "Lecture" : "Discussion") +
                ": </strong>" +
                '<p class="m-0 col-9">' +
                `${meeting.building} ${meeting.room} (${meeting.days}: ${meeting.start_time} - ${meeting.end_time})</p>` +
                "</div>";
        });

        str += "</div></div>";
    }

    str += "</div></div></div></div>";

    return str;
}
