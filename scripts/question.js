
/**
 * @params
 * 
 * get data from firebase and display it on the page
 */
function displayQuestion() {
    let params = new URL( window.location.href ); //get URL of search bar
    let ID = params.searchParams.get( "docID" ); //get value for key "id"
    console.log( ID );

    // getting info from the firebase collection
    db.collection( "questions" )
        .doc( ID )
        .get()
        .then( doc => {
            question = doc.data();
            title = doc.data().title;
            description = doc.data().description;
            author = doc.data().author;
            timestamp = doc.data().timestamp;

            question.author.get().then(authorDoc => {
                let authorName = authorDoc.data().name || "Unknown Author";
                document.getElementById("questionAuthor").innerHTML = authorName;
            }).catch(error => {
                console.error("Error fetching author:", error);
                document.getElementById("questionAuthor").innerHTML = "Author not found";
            });

            timeElapsed = Date.now() - timestamp;
            readableTime = makeDurationReadable(timeElapsed);
            
            // only populate title, and image
            document.getElementById( "questionTitle" ).innerHTML = title;
            document.getElementById("question-description").innerHTML = description;
            document.getElementById("questionAuthor").innerHTML = author;
            document.getElementById("questionTimestamp").innerHTML = readableTime;
            // let imgEvent = document.querySelector( ".hike-img" );
            // imgEvent.src = "../images/" + hikeCode + ".jpg";
        } );
}
displayQuestion();

// copied from search.js
/**
 * @author giorgio
 * Takes a duration in milliseconds and returns
 * a time with appropriate units.
 * @param {Number} The duration in milliseconds.
 * @returns {String} The formatted time with units.
 */
function makeDurationReadable(duration) {
    const units = ["s", "m", "h", "d", "y"];
    const conversions = [1000, 60, 60, 24, 365];
    for (let i = 0; i < conversions.length - 1; i++) {
      duration /= conversions[i];
      if (duration < conversions[i + 1]) {
        return Math.floor(duration) + units[i];
      }
    }
    return Math.floor(duration) + units[units.length - 1];
  }
  
/**
 * some function i created to get the firebase data and insert it into the webpage
 * displayQuestion works just fine though
 * keeping this here in case i want to use it later
 */
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