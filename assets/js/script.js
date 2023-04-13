const socket = io();

$(document).ready(function () {
  $(document).on("submit", "#addcomment", function (event) {
    event.preventDefault();

    const newComment = { name: $("#name").val(), comment: $("#comment").val() };

    $.ajax({
      url: "../addcomment",
      data: newComment,
      type: "post",
      success: (data) => {
        console.log(data.message);
      },
    });
  });

  getComments();
});

socket.on("comment", addComment);

function addComment(comment) {
  $("#comment").val("").focus();
  console.log("adding comment", comment);
  $("#comments").append(`<h4>${comment.name}</h4><p>${comment.comment}</p>`);
}

function getComments() {
  $("#comments").html("");
  $.get("../test", (data) => {
    console.log("data", data);
    data.forEach((element) => {
      addComment(element);
    });
  });
}
