$(document).ready(function () {
    $('.modal').modal({
        onCloseEnd: function (modal) {
            $("#commentText").empty();
        }
    });


    //comments
    //toasts (on db clearing, delete comment, add comment)


    //ability to delete comments left on articles
    // $(document).on("click", ".btn.commentDelete", commentDelete);

    //all stored comments should be visible 
    //Displaying All Comments
    $(document).on("click", "#commentBtn", function () {
        // $("#commentText").empty();

        let thisId = $(this).attr("data-id");
        console.log("displaying comments for article id: " + thisId);

        //Make an ajax call for this article & its comments
        $.ajax({
                method: "GET",
                url: "/articles/" + thisId,
            })
            //Populate the article & comment information to the page
            .then(function(data) {
                console.log(data);
                console.log("article _id", thisId);

                if (data.comments) {
                    //loop through comments
                    for (var i = 0; i < data.comments.length; i++) {
                        console.log("comment title: " + data.comments[i].title);
                        console.log("comment body: " + data.comments[i].body);
                        console.log("comment id: " + data.comments[i]._id);

                        //assign data to variables
                        let commentTitle = data.comments[i].title;
                        let commentBody = data.comments[i].body;
                        let commentId = data.comments[i]._id;

                        //Constructs the comment list and appends comments/buttons to it
                        // currentComment = $("<li class='list-group-item comment'>")
                        //     .append(commentTitle + " says: " + commentBody)
                        //     .append($("<button class='btn commentDelete'>X</button>"));
                        // //Store the current comment ID on the button for easy deletion
                        // currentComment.children("button").data("_id", data.comments[i]._id);

                        //Constructs comment list
                        let currentComment = $("#commentText")
                            .append("<p class='name'>" + commentTitle + ": " + "</p>" + "<p class='body'>" + commentBody + "</p>" +
                            "<button class='btn commentDelete'>X</button>");
                        currentComment.children("button").data("_id", commentId);
                    };
                } else {
                    $("#commentText").text("No comments yet!  Be the first");
                }

            });
    });


    //users should be able to leave comments on the articles displayed and revisit them later
    //comments should be saved to db and associated w/ their articles
    //Save New Comment 
    $(document).on("click", "#saveCommentBtn", function () {
        let thisId = $(this).attr("data-id");
        console.log("saving comment to article with this id: " + thisId);

        const comment = {
            title: $("#titleField").val().trim(),
            body: $("#bodyField").val().trim()
        }
        //Make an ajax call to update the article
        $.ajax({
                method: "POST",
                url: "/articles/" + thisId,
                data: comment
            })
            .then(function (data) {
                // console.log(data);
                $("#titleField").val("");
                $("#bodyField").val("")
            });
    });

    //Delete article
    $(document).on("click", "#deleteBtn", function() {
        let thisId = $(this).attr("data-id");
        console.log("deleting article id: " + thisId);

        $.ajax({
            method: "PUT",
            url: "/removearticle/" + thisId,
        })
        .then(function() {
           console.log("article removed: " + thisId); 
        })
        location.reload();
    });

    //Save article
    $(document).on("click", "#saveBtn", function() {
        let thisId = $(this).attr("data-id");
        console.log("saving this article: " + thisId);

        $.ajax({
            method: "PUT",
            url: "/saved/" + thisId
        })
        .then(function(data) {
            console.log("article save complete!");
            //toast to say it was saved
        });
        location.reload();
    });

    //Remove article from saved
    $(document).on("click", "#unsaveBtn", function() {
        let thisId = $(this).attr("data-id");
        console.log("removing this article from saved: " + thisId);

        $.ajax({
            method: "PUT",
            url: "/removesaved/" + thisId
        })
        .then(function(data) {
            console.log("article unsaved!");
            //toast to say it was removed?? maybe. probably not
        })
        location.reload();
    });


});



//!! turn this into arrow function !!
// function renderComments(data) {
//     let commentsToRender = [];
//     let currentComment;

//     if (!data.comment.length) {
//         currentComment = $("<li class='list-group-item'>No comments for this article yet. Be the first!</li>");
//         commentsToRender.push(currentComment);
//     } else {
//         //turn this into a forEach
//         for (var i = 0; i < data.comment.length; i++) {
//             console.log("comment:", data.comment);
//             currentComment = $("<li class='list-group-item comment'>")
//                 .text(data.comment[i].title)
//                 .text(data.comment[i].body)
//                 .append($("<button class='btn comment-delete'>X</button>"));
//             currentComment.children("button").data("_id", data.comment[i].id);
//             commentsToRender.push(currentComment);
//         }
//     }
//     $("#commentBody").append(commentsToRender);
// }

// $("#commentTitle").append("<p>" + data.comment.title + "</p>");
// $("#commentBody").append("<p>" + data.comment.body + "<p>");