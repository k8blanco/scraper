const mongoose = require("mongoose");

//Save ref to Scheme constructor
const Schema = mongoose.Schema;

//Create a new UserSchema object using the Schema constructor
const ArticleSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    summary: {
        type: String,
        required: true
    },
    //an object that stores a comment id. the ref property links the ObjectId to the Comment model, 
    //which allows us to populate the Article with an associated Comment
    comment: {
        type: Schema.Types.ObjectId,
        ref: "Comment"
    }
});

//This creates our mongo from the schema above using mongoose's model method
const Article = mongoose.model("Article", ArticleSchema);

//Export the Article model
module.exports = Article;