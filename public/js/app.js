$(document).ready(function () {
    $('.modal').modal();


    //comments

    //ability to delete comments left on articles

    //all stored comments should be visible 
    //Displaying All Comments
    $(document).on("click", "#commentBtn", function () {
        const thisId = $(this).attr("data-id");
        console.log("displaying comments for article id: " + thisId);

        //Make an ajax call for this article & its comments
        $.ajax({
            method: "GET",
            url: "/articles/" + thisId,
        })
        //Populate the article & comment information to the page
        .then(function(data) {
            console.log(data);
            console.log(data.comment);
            // renderComments(data);
        });
    });

    //users should be able to leave comments on the articles displayed and revisit them later
    //comments should be saved to db and associated w/ their articles
    //Save New Comment 
    $(document).on("click", "#saveCommentBtn", function () {
        const thisId = $(this).attr("data-id");
        console.log("saving comment to article with this id: " + thisId);

        const comment = {
            title: $("#titleField").val().trim(),
            body: $("#bodyField").val().trim()
        }
        //Make an ajax call for the article
        $.ajax({
                method: "POST",
                url: "/articles/" + thisId,
                data: comment
            })
            .then(function (data) {
                console.log(data);
                $("#titleField").val("");
                $("#bodyField").val("")
            });
    });


});

//!! turn this into arrow function !!
// function populateComments(data) {

// }

//!! turn this into arrow function !!
// function renderComments(data) {
//     let commentsToRender = [];
//     let currentComment;

//     if (!data.comments.length) {
//         currentComment = $("<li class='list-group-item'>No comments for this article yet. Be the first!</li>");
//         commentsToRender.push(currentComment);
//     } else {
//         //turn this into a forEach
//         for (var i = 0; i < data.comments.length; i++) {
//             currentComment = $("<li class='list-group-item comment'>")
//                 .text(data.comments[i].commentText)
//                 .append($("<button class='btn comment-delete'>X</button>"));
//             currentComment.children("button").data("_id", data.comments[i].id);
//             commentsToRender.push(currentComment);
//         }
//     }
//     $("#commentBody").append(commentsToRender);
// }