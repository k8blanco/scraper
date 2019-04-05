$(document).ready(function () {
    $('.modal').modal({
        onCloseEnd: function (modal) {
            $("#commentText").empty();
        }
    });
    $(".parallax").parallax();


    //comments
    //toasts (on db clearing, delete comment, add comment)


    //Displaying all comments
    $(document).on("click", "#commentBtn", function () {
        let thisId = $(this).attr("data-id");
        console.log("displaying comments for article id: " + thisId);

        //Make an ajax call for this article & its comments
        $.ajax({
                method: "GET",
                url: "/comments/" + thisId,
            })
            //Populate the article & comment information to the page
            .then(function (data) {
                if (data.comments.length >= 1) {
                    //loop through comments
                    for (var i = 0; i < data.comments.length; i++) {
                        console.log("comment title: " + data.comments[i].title);
                        console.log("comment body: " + data.comments[i].body);
                        console.log("comment id: " + data.comments[i]._id);

                        //assign data to variables
                        let commentTitle = data.comments[i].title;
                        let commentBody = data.comments[i].body;
                        let commentId = data.comments[i]._id;

                        //Constructs comment list
                        $("#commentText")
                            .append("<div class='commentDiv'><p class='name'>" + commentTitle + ": " + "</p>" + "<p class='body'>" + commentBody + "</p>" +
                                "<button class='btn commentDelete' data-id='" + commentId + "'>X</button></div>");
                        console.log("current comment id: ", commentId);
                    };
                } else {
                    $("#commentText").text("No comments yet!  Be the first");
                }

            });
    });

    //Save new comment
    $(document).on("click", "#saveCommentBtn", function() {
        let saveId = $(this).data("id");
        console.log("saving comment to article with this id: " + saveId);

        let comment = {
            title: $("#titleField").val().trim(),
            body: $("#bodyField").val().trim()
        }
        //Make an ajax call to update the article
        $.ajax({
                method: "POST",
                url: "/newcomment/" + saveId,
                data: comment
            })
            .then(function () {
                $("#titleField").val("");
                $("#bodyField").val("")
            });
    });

    //Delete comment
    $(document).on("click", ".commentDelete", function() {
        let deleteId = $(this).attr("data-id");
        console.log("deleting comment with this id: " + deleteId);

        //Make an ajax call to update the article
        $.ajax({
                method: "PUT",
                url: "/removecomment/" + deleteId,
            })
            .then(function () {
                location.reload();

            })

    })

    //Delete article
    $(document).on("click", "#deleteBtn", function() {
        let thisId = $(this).attr("data-id");
        console.log("deleting article id: " + thisId);

        $.ajax({
                method: "PUT",
                url: "/removearticle/" + thisId,
            })
            .then(function () {
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
            .then(function (data) {
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
            .then(function (data) {
                console.log("article unsaved!");
                //toast to say it was removed?? maybe. probably not
            })
        location.reload();
    });


});

