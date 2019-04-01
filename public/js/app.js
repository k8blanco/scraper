$(document).ready(function () {
    //show instructions
    $("#instructions").show();

    //on scrape button click, populate scraped articles
    $("#scraperBtn").on("click", function () {
        //hide instructions div
        $("#instructions").hide();

        //grab the articles as a json !!convert this to arrow function?
        $.getJSON("/articles", function (data) {
            //forEach function here to populate cards
            data.forEach(function (item) {

                let itemId = item._id;
                let title = item.title;
                let link = item.link;

                console.log(itemId, title, link);

                // let articleTitle = $("<span class='card-title' id='article-title'>").text(title);

                // //create a card to display information
                // articleCard = $("<div class='card'>");
                // articleContent = $("<div class='card-content white-text' id='articleContent'>");

                // articleContent.append(this.title, this.link);

                // //populate card with information
                // $("#articles").append(articleCard, articleContent, articleTitle)
                
            })
        })

        // Grab the articles as a json
        // $.getJSON("/articles", function (data) {
        //     // For each one
        //     for (var i = 0; i < data.length; i++) {
        //         // Display the apropos information on the page
        //         $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
        //     }
        // });




    })


    //On comment button click
    // $(document).on("click", "p", function() {
    //     // Empty the notes from the note section
    //     $("#notes").empty();
    //     // Save the id from the p tag
    //     var thisId = $(this).attr("data-id");

});