const mongoose = require("mongoose");
//Unique validator to prevent duplicate db entries
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;


const CommentSchema = new Schema({
    title: String,
    body: String
});

//Prevent duplicate comments in DB
CommentSchema.plugin(uniqueValidator);

const Comment = mongoose.model("Comment", CommentSchema);

module.exports = Comment;