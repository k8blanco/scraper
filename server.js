const express = require("express");
const exphbs = require("express-handlebars");
const mongoose = require("mongoose");
//Unique validator to prevent duplicate db entries
const uniqueValidator = require("mongoose-unique-validator");
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
app.use(express.urlencoded({
    extended: true
}));
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

//Testing
const syncOptions = {
    force: false
};
//If running a test, set synOptions.force to true
//clearing the testdb
if (process.env.NODE_ENV === "test") {
    syncOptions.force = true;
};

//Connect to the Mongo DB
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.connect(MONGODB_URI);

//Routes

//turn these all into arrow functions where possible

//Main Route
app.get("/", (req, res) => {
    db.Article.find({})
        .then(function (dbArticle) {
            let hbsobj = {
                article: dbArticle
            };
            res.render("index", hbsobj)
        })
        .catch(function (err) {
            res.json(err);
        })
});

//Main Saved Route
app.get("/saved", (req, res) => {
    db.Article.find({ isSaved: true })
        .then(function (savedArticles) {
            let hbsobj = {
                articles: savedArticles
            };
            console.log(hbsobj);
            res.render("saved", hbsobj);
        })
        .catch(function (err) {
            res.json(err);
        });
});

//GET route for scraping the website
app.get("/scrape", function (req, res) {

    axios.get("https://www.theonion.com").then(function (response) {
        const $ = cheerio.load(response.data);

        //(i: iterator, element: the current element)
        //for each item in class "asset"
        $("article header").each(function (i, element) {

            //Save an empty result object
            const scrapeResult = {};

            //Add the text and href of every link, and save them as properties of the object
            scrapeResult.title = $(this)
                .children("h1")
                .children("a")
                .text()
            scrapeResult.link = $(this)
                .children("h1")
                .children("a")
                .attr("href")

            //Add the text of a short summary as property of the object
            scrapeResult.summary = $(this)
                .siblings()
                .children(".entry-summary, p")
                .text();

            //Create a new Article using the 'result' object built from scraping
            db.Article.create(scrapeResult)
                .then((dbArticle) => console.log(dbArticle))
                .catch((err) => console.log(err));
        });

        res.redirect("/")
    });
});

//GET route for getting article and populating it  with its comments
app.get("/articles/:id", function (req, res) {
    console.log("grabbing comments for this article with id: " + req.params.id);

    //find the article with this id in the DB
    db.Article.findOne({
            _id: req.params.id
        })
        //find all of the comments associated with it
        .populate("comments")
        //turn it into a handlebars object for easy reference
        .then(function (dbArticleComments) {
            console.log("dbArticleComments: ", dbArticleComments);

            //if able to successfully find and associate all comments with article, send it back to client
            res.reload();
            console.log("dbArticleComments JSON: ", dbArticleComments);

        })
        .catch(function (err) {
            res.json(err);
        });
});

//GET for clearing DB (dev only)
app.get("/clear", function (req, res) {
    db.Article.deleteMany({})
        .then(function () {
            res.redirect("back");
        })
        .catch(function (err) {
            res.json(err);
        })
});

//POST route for saving a new Comment and associating it with an article
app.post("/articles/:id", function (req, res) {
    console.log("Saving comment to DB");
    db.Comment.create(req.body)
        .then(function (dbComment) {
            return db.Article.findOneAndUpdate({
                _id: req.params.id
            }, {
                $push: {
                    comments: dbComment._id
                }
            }, {
                new: true
            });
        })
        .then(function (dbComment) {
            res.json(dbComment);
        })
        .catch(function (err) {
            res.json(err)
        });
});

//PUT route for saving/favoriting an article
app.put("/saved/:id", function(req, res) {
    console.log("You saved this article!" + req.params.id);

    //find the article with this id in the db and update it
    db.Article.findOneAndUpdate({
            _id: req.params.id
        }, {
            isSaved: true
        })
        .then(function() {
            console.log("Article added to Saved")
            res.redirect("saved");
        })
        .catch(function (err) {
            res.json(err)
        });
});

//PUT route for removing a saved article
app.put("/removesaved/:id", function(req, res) {
    console.log("removing article from saved: " + req.params.id)
    db.Article.findOneAndUpdate({ _id: req.params.id }, { isSaved: false })
        .then(function() {
            console.log("Article removed from Saved")
        })
        .catch(function(err) {
            res.json(err)
        });
    });


//PUT for deleting comments
app.put("/removecomment:id", function (req, res) {
    console.log("deleting comment with this id: " + req.params.id)
    db.Comment.deleteOne({
            _id: req.params.id
        })
        .then(function () {
            console.log("Comment Removed!")
            res.redirect("back");
        })
        .catch(function (err) {
            res.json(err)
        });
});

//PUT for deleting article (dev only)
app.put("/removearticle/:id", function (req, res) {
    console.log("trying to delete: " + req.params.id);

    db.Article.deleteOne({
            _id: req.params.id
        })
        .then(function () {
            console.log("Article Removed!")
        })
        .catch(function (err) {
            res.json(err)
        });

    res.json();

});


//Start the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT);
});