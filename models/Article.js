const mongoose = require("mongoose");
//Unique validator to prevent duplicate db entries
const uniqueValidator = require("mongoose-unique-validator");

//Save ref to Scheme constructor
const Schema = mongoose.Schema;

//Create a new UserSchema object using the Schema constructor
const ArticleSchema = new Schema({
    title: {
        type: String,
        unique: true,
        required: true
    },
    link: {
        type: String,
        unique: true
    },
    summary: {
        type: String,
        required: true
    },
    isSaved: {
        type: Boolean,
        default: false
    },
    //an object that stores a comment id. the ref property links the ObjectId to the Comment model, 
    //which allows us to populate the Article with an associated Comment
    comments: [
        {
        type: Schema.Types.ObjectId,
        ref: "Comment"
    }
    ]
});

//Prevent duplicate articles in DB
ArticleSchema.plugin(uniqueValidator);

//This creates our mongo from the schema above using mongoose's model method
const Article = mongoose.model("Article", ArticleSchema);

//Export the Article model
module.exports = Article;