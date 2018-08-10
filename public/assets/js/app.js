// // Grab the articles as a json
// $.getJSON("/articles", function(data) {
//   // For each one
//   for (var i = 0; i < data.length; i++) {
//     // Display the apropos information on the page
//     $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
//   }
// });
$(document).ready(function () {

    $(".articlesCol").click(function() {
        var articleID = $(".btn-danger").attr("data-id");
        console.log("ID from btn-danger", articleID);
        console.log("ID from this._id", this._id);
        var commentDiv = 
        `<p>${articleID} or ${this._id}</p>
        <p>${this.comment}</p>`;
        $(".commentsHolder").append(commentDiv);

        $(".columnContainer").append(
            `<form action="/article/${articleID}" class="commentForm" method="post">
            <div class="form-group">
                <label for="userNameInput">UserName</label>
                <input type="text" id="userNameInput" class="form-control" name="userName" placeholder="Enter UserName">
            </div>
            <div class="form-group">
                <label for="CommentInput">Comment</label>
                <textarea id="commentInput" class="form-control" name="comment"  placeholder="Enter Comment"></textarea>
            </div>
            <button data-id=${articleID} id="saveComment" type="submit" class="btn saveComment btn-primary">Save Comment</button>
        </form>`
        );
    });

$(".smashMagTitle").click(function() {
    $(this).append(`<img src="https://d33wubrfki0l68.cloudfront.net/481b949e08351faab07d47e2755cfcde5bf53603/de923/images/smashing-cat/cat-the-cook-presenting-dish.svg" width="255" height="241" alt="Cat the cook presenting a (seemingly) delicious dish.">`)
});


    $(".comment-col").slideUp(fast);
//     $(".article-favorite").on("click", function (e) {
//         var articleId = $(this).attr("data-id");
//         $.ajax({
//             url: "/api/article/" + articleId,
//             method: "PUT",
//             data: {
//                 "favorite": true
//             }
//         }).then(function (data) {
//             if (data) {
//                 window.location.href = '/';
//             }
//         }).catch(function (err) {
//             alert(err);
//         });
//     });

    $(".article-unfavorite").on("click", function (e) {
        var articleId = $(this).attr("data-id");
        $.ajax({
            url: "/api/article/" + articleId,
            method: "PUT",
            data: {
                "favorite": false
            }
        }).then(function (data) {
            if (data) {
                window.location.href = '/favorites';
            }
        }).catch(function (err) {
            alert(err);
        });
    });



    $(".articleRow").click(function () {
        $(".comment-col").slideToggle(400);
        var thisId = $(this).attr("data-id");
        $.ajax({
            method: "GET",
            url: "/articles/" + thisId
        });
    });

});

// // Whenever someone clicks a p tag
// $(document).on("click", "p", function () {
//     // Empty the comments from the comment section
//     $("#comments").empty();
//     // Save the id from the p tag
//     var thisId = $(this).attr("data-id");

//     // Now make an ajax call for the Article
//     $.ajax({
//             method: "GET",
//             url: "/articles/" + thisId
//         })
//         // With that done, add the comment information to the page
//         .then(function (data) {
//             console.log(data);
//             // The title of the article
//             $("#comments").append("<h2>" + data.title + "</h2>");
//             // An input to enter a new title
//             $("#comments").append("<input id='titleinput' name='title' >");
//             // A textarea to add a new comment body
//             $("#comments").append("<textarea id='bodyinput' name='body'></textarea>");
//             // A button to submit a new comment, with the id of the article saved to it
//             $("#comments").append("<button data-id='" + data._id + "' id='savecomment'>Save Comment</button>");

//             // If there's a comment in the article
//             if (data.comment) {
//                 // Place the title of the comment in the title input
//                 $("#titleinput").val(data.comment.title);
//                 // Place the body of the comment in the body textarea
//                 $("#bodyinput").val(data.comment.body);
//             }
//         });
// });

// // When you click the savecomment button
// $(document).on("click", "#savecomment", function () {
//     // Grab the id associated with the article from the submit button
//     var thisId = $(this).attr("data-id");

//     // Run a POST request to change the comment, using what's entered in the inputs
//     $.ajax({
//             method: "POST",
//             url: "/articles/" + thisId,
//             data: {
//                 // Value taken from title input
//                 title: $("#titleinput").val(),
//                 // Value taken from comment textarea
//                 body: $("#bodyinput").val()
//             }
//         })
//         // With that done
//         .then(function (data) {
//             // Log the response
//             console.log(data);
//             // Empty the comments section
//             $("#comments").empty();
//         });

//     // Also, remove the values entered in the input and textarea for comment entry
//     $("#titleinput").val("");
//     $("#bodyinput").val("");
// });