function displayQuestion() {
    let params = new URL( window.location.href ); //get URL of search bar
    let ID = params.searchParams.get( "docID" ); //get value for key "id"
    console.log( ID );

    // doublecheck: is your collection called "Reviews" or "reviews"?
    db.collection( "questions" )
        .doc( ID )
        .get()
        .then( doc => {
            question = doc.data();
            title = doc.data().title;
            description = doc.data().description;
            
            // only populate title, and image
            document.getElementById( "questionTitle" ).innerHTML = title;
            document.getElementById("question-description").innerHTML = description;
            // let imgEvent = document.querySelector( ".hike-img" );
            // imgEvent.src = "../images/" + hikeCode + ".jpg";
        } );
}
displayQuestion();

// function getQuestionTitle(id) {
//     db.collection("questions")
//       .doc(id)
//       .get()
//       .then((thisQuestion) => {
//         var questionTitle = thisQuestion.data().name;
//         document.getElementById("questionTitle").innerHTML = questionTitle;
//           });
// }

// function getQuestionDescription(id) {
//     db.collection("questions")
//         .doc(id)
//         .get()
//         .then((thisQuestion) => {
//             var questionDesc = thisQuestion.data();
//             document.getElementById("question-description").innerHTML = questionDesc;
//         });
// }