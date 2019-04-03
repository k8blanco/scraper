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

//!! If needed, html/api route links go here !!
//require("./routs/apiRoutes.js")(app);
//require("./routes/htmlRoutes.js")(app);

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

        //Send a message to the client
        res.redirect("/")
    });
});

//add route for saving a new Comment and associating it with an article
app.post("/articles/:id", function (req, res) {
    console.log("Saving comment to DB");
    db.Comment.create(req.body)
        .then(function (dbComment) {
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { $push: { comments: dbComment._id } }, { new: true });
        })
        .then(function (dbComment) {
            // console.log("dbComment: ", dbComment);
            // let hbsobj = {
            //     comment: dbComment
            // };
            // res.render("index", hbsobj);
            res.json(dbComment);
        })
        .catch(function (err) {
            res.json(err)
        });
});

//add route for getting article and populating it  with its comments
app.get("/articles/:id", function (req, res) {
    console.log("grabbing comments for this article with id: " + req.params.id);
    //find the article with this id in the DB
    db.Article.findOne({ _id: req.params.id })
        //find all of the comments associated with it
        .populate("comments")
        //turn it into a handlebars object for easy reference
        .then(function(dbArticleComments) {
            console.log("dbArticleComments: ", dbArticleComments);
            
            // let commentsTitle;
            // let commentsBody;

            // for (var i = 0; i < dbArticleComments.comments.length; i++) {
            //     commentsTitle = dbArticleComments.comments[i].title;
            //     commentsBody = dbArticleComments.comments[i].body;
            //     console.log("loop:", commentsTitle, commentsBody);
            // }

            // console.log("outside loop:", commentsTitle, commentsBody);

            // let hbsCommentObj = {
            //     commentsTitle,
            //     commentsBody
            // };

            // console.log("hbsCommentobj:", hbsCommentObj);
          
            // res.render("index", hbsCommentObj);
            //if able to successfully find and associate all comments with article, send it back to client
            res.json(dbArticleComments);

        })
        .catch(function (err) {
            res.json(err);
        });
});



//Start the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT);
});