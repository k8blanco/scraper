const express = require("express");
const exphbs = require("express-handlebars");
const mongoose = require("mongoose");
const logger = require("morgan");
require("dotenv").config();

//Scraping Tools
const axios = require("axios");
const cheerio = require("cheerio");

//Require all models
let db = require("./models");

//Set Port
const PORT = process.env.PORT || 3000;

//Initialize Express
const app = express();

//Middleware
  
//Use morgan logger for logging requests
app.use(logger("dev"));
//Parse request body as JSON
app.use(express.urlencoded({ extended: true}));
app.use(express.json());
//Make public a static folder
app.use(express.static("public"));

//Handlebars
app.engine(
    "handlebars",
    exphbs({
        defaultLayout: "main"
    })
);
app.set("view engine", "handlebars");

//!! If needed, html/api route links go here !!
//require("./routs/apiRoutes.js")(app);
//require("./routes/htmlRoutes.js")(app);

//Testing
const syncOptions = { force: false };
//If running a test, set synOptions.force to true
//clearing the testdb
if (process.env.NODE_ENV === "test") {
    syncOptions.force = true;
};

//Connect to the Mongo DB
mongoose.connect("mongodb://localhost/scraperdb", { useNewUrlParser: true });

//Routes

//Main Route
app.get("/", function(req, res) {
    res.render("index");
});

//GET route for scraping the website
app.get("/scrape", function(req, res) {
    axios.get("https://www.mcsweeneys.net").then(function(response) {
        const $ = cheerio.load(response.data);

        //(i: iterator, element: the current element)
        //for each item in class "hed"
        $(".hed").each(function(i, element) { 

            //Save an empty result object
            const result = {};

            //Add the text and href of every link, and save them as properties of the object
            result.title = $(this)
                .children("p")
                .text()
            result.link = $(this)
                .parent("a")
                .attr("href");
         
                //Create a new Article using the 'result' object built from scraping
                db.Article.create(result)
                    .then(function(dbArticle) {
                        //View the added result in the console
                        console.log(dbArticle);
                    })
                    .catch(function(err) {
                        //If an error occurred, log it
                        console.log(err);
                    });
            });

            //Send a message to the client
            res.send("Scrape Complete");
    });
});

//Route for getting all Articles from the db
app.get("/articles", function(req, res) {
    //Grab every document in the articles collection
    db.Article.find({})
        .then(function(dbArticle) {
            //if we were able to successfully find articles, send them back to the client
            res.json(dbArticle);
        })
});

//add route for grabbing a specific article by id and populate it with it's comment
app.get("/articles/:id", function(req, res) {
    //using the id passed in the id parameter, prepare a query that finds the matching one
    db.Article.findOne({ _id: req.params.id })
    //..and populate all of the comments associated with it
    .populate("comment")
    .then(function(dbArticle) {
        //if we were able to successfully find an article with the given id, send it back to the client
        res.json(dbArticle);
    })
    .catch(function(err) {
        res.json(err);
    });
});
//add route for saving/updating an article's associated comments
app.post("/articles/:id", function(req, res) {
    db.Comment.create(req.body)
        .then(function(dbComment) {
            return db.Article.findOneAndUpdate({ _id: req.paramas.id}, { comment: dbComment._id}, { new: true});
        })
        .then(function(dbArticle) {
            res.json(dbArticle);
        })
        .catch(function(err) {
            res.json(err)
        });
});

//Start the server
app.listen(PORT, function() {
    console.log("App running on port " + PORT);
});