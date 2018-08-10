var express = require("express");
var bodyParser = require("body-parser");
var exphbs = require("express-handlebars");
var logger = require("morgan");
var mongoose = require("mongoose");
var methodOverride = require('method-override');
// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));
app.use(methodOverride("_method"));

// Connect Handlebars to our Express app
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB 
//TODO: Find out how to connect with this method AND use { useNewUrlParser: true }
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

// Routes

var summary;
var readMe = "  Read More…\n\t\t";
console.log(readMe.length);
var scrapeURL = "https://www.smashingmagazine.com/articles/";
var URL = "https://www.smashingmagazine.com/";

// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  axios.get(scrapeURL).then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $("article.article--post").each(function(i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.headline = $(element).find("h1.article--post__title").text();
      summary = $(element).find("div.article--post__content").children("p").text();
      console.log(summary.length);
      summary = summary.slice(0, summary.length - 15);
      summary = summary.replace(/\n/g, '');
      var sliceDate = summary.indexOf(20)+6;
      summary = summary.slice(sliceDate).trim();
      console.log(summary);
      result.summary = summary;

      result.link = URL + $(element).find("h1.article--post__title").children("a").attr("href");
      

      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, send it to the client
          return res.json(err);
        });
    });

    console.log("Scrape Complete!");
    res.redirect("/");
  });
});

app.get("/scraper", function(req, res) {
  // First, we grab the body of the html with request
  axios.get(URL + "page/2/").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $("article.article--post").each(function(i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.headline = $(element).find("h1.article--post__title").text();
      summary = $(element).find("div.article--post__content").children("p").text();
      console.log(summary.length);
      summary = summary.slice(0, summary.length - 15);
      summary = summary.replace(/\n/g, '');
      var sliceDate = summary.indexOf(20)+6;
      summary = summary.slice(sliceDate).trim();
      console.log(summary);
      result.summary = summary;

      result.link = URL + $(element).find("h1.article--post__title").children("a").attr("href");
      

      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, send it to the client
          return res.json(err);
        });
    });

    console.log("Scrape Complete!");
    res.redirect("/");
  });
});

// SEE BELOW FOR VIRTUAL OFFICE HOURS EXAMPLE WITH HANDLEBARS
// GET all the articles from the DB that favorite is set to false
// and render them to the index.handlebars page
app.get("/", function(req, res) {
  db.Article.find({ favorite: false })
    .then(function(data){
      // res.json(data);
      res.render("index", {article: data});
    }).catch(function(err){
      res.status(404).send(err);
    });
});

// GET all the articles that favorite is set to true
// and render them to the favorite.handlebars page
app.get("/favorites", function(req, res) {
  db.Article.find({ favorite: true})
    .then(function(data){
      // res.json(data);
      res.render("favorite", {article: data});
    }).catch(function(err){
      res.status(404).send(err);
    });
});

app.post("/article/:id", function(req, res) {
    // Create a new comment and pass the req.body to the entry
    db.Comment.create(req.body)
      .then(function(dbComment) {
        // If a Comment was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Comment
        // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
        // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
        return db.Article.findOneAndUpdate({ _id: req.params.id }, { $set: { comment: dbComment._id } }, { new: true });
      })
      .then(function(dbArticle) {
        // If we were able to successfully update an Article, send it back to the client
        // res.json(dbArticle);
        res.render("index", {article: dbArticle});
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

// Route for grabbing a specific Article by id, populate it with it's comment
app.get("/articles/:id", function(req, res) {
  // TODO
  // Finish the route so it finds one article using the req.params.id,
  // and run the populate method with "comment",
  // then responds with the article with the comment included
  db.Article.findOne({ _id: req.params.id }).populate( "comment" ).then(function(dbArticle) {
    // res.json(dbArticle);
    res.render("index", {article: dbArticle});
  }).catch(function(err) {
    // If an error occurs, send it back to the client
    res.json(err);
  });
});

// PUT (UPDATE) a article by its _id 
// Will set the article favorite to whatever the value 
// of the req.body.favorite boolean is
app.put("/api/article/:id", function(req, res){
  db.Article.findByIdAndUpdate(req.params.id, { $set:  {favorite: req.body.favorite} }, {new: true})
    .then(function(dbArticle){
      // res.json(dbArticle);
      res.render("index", {article: dbArticle});
    }).catch(function(err){
      res.status(400).send(err);
    });
});
// return db.Article.findOneAndUpdate({ _id: req.params.id }, { $set: { comment: dbComment._id } }, { new: true });
// // TODO - UPDATE THIS TO MAKE IT A COMMENT CREATOR
// // POST a new article to the mongo database
// app.post("/api/article", function(req, res){
//   db.Article.create(req.body)
//     .then(function(){
//       // res.json(dbArticle);
//       res.redirect("/");
//     }).catch(function(err){
//       res.status(400).send(err);
//     });
// });

// Start the server
app.listen(PORT, function() {
  console.log("App running on: http://localhost:" + PORT + "!");
});