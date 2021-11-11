var config = {
  apiKey: "AIzaSyBqKhPRMvtI-ZcsUYQBjmkzQqBewFizxzw",
  authDomain: "testproject-7b4de.firebaseapp.com",
  databaseURL: "https://testproject-7b4de.firebaseio.com",
  projectId: "testproject-7b4de",
  storageBucket: "testproject-7b4de.appspot.com",
  messagingSenderId: "531426391978"
};

firebase.initializeApp(config);

// logOut listener
const logOut = document.getElementById("userlogOut");
const navLogin = document.getElementById("navLogin");
const adminConsole = document.getElementById("adminConsole");

logOut.addEventListener("click", e => {
  firebase.auth().signOut();
})

firebase.auth().onAuthStateChanged(firebaseUser => {
  if (firebaseUser) {
    console.log(firebaseUser);
    adminConsole.style.display = "block";
    logOut.style.display = "block";
    navLogin.style.display = "none";
  } else {
    console.log("not logged in");
      adminConsole.style.display = "none";
    logOut.style.display = "none";
    navLogin.style.display = "block";
  }
})

//database reference
const db = firebase.firestore();
var books;
var courses;

//initialize any element needed for page
initializePageElements();



//queries books by CID
//param: CID number
//returns: array of book objects
async function getBooksbyCID(cid) {
  const snapshot = await db.collection('Books').where('CID', '==', cid).get();
  return snapshot.docs.map(doc => ({
    __id: doc.id,
    ...doc.data()
  }));
}

//gets all books
async function getBooks() {
  const snapshot = await db.collection('Books').get();
  return snapshot.docs.map(doc => ({
    __id: doc.id,
    ...doc.data()
  }));
}

//gets all courses
async function getCourses() {
  const snapshot = await db.collection('Courses').orderBy('CourseNumber', 'asc').get();
  return snapshot.docs.map(doc => ({
    __id: doc.id,
    ...doc.data()
  }));
}

//queries Courses by CID
//param: CID number
//returns courseObject
//returns null if course doesnt exist
async function getCoursebyCID(cid) {
  const snapshot = await db.collection('Courses').where('CID', '==', cid).get();
  return snapshot.docs.map(doc => ({
    __id: doc.id,
    ...doc.data()
  }))[0];
}


//finds the highest cid
//returns 1 greater then cid
async function getNewCID() {
  const snapshot = await db.collection('Courses').orderBy('CID', 'desc').limit(1).get();
  return snapshot.docs.map(doc => ({
    __id: doc.id,
    ...doc.data()
  }))[0].CID + 1;
}

//params:CourseNumber and CourseTitle of course to be checked
//Returns true if course exists
async function doesCourseExist(CourseNumber, CourseTitle) {
  const snapshot = await db.collection('Courses').where('CourseNumber', '==', CourseNumber).where('CourseTitle', '==', CourseTitle).get();
  return (snapshot.docs.map(doc => ({
    __id: doc.id,
    ...doc.data()
  })).length > 0);
}

//run on page load
async function initializePageElements() {

  //grab books and courses
  books = await getBooks();
  courses = await getCourses();

  //loop through courses
  //add attributes to corresponding books
  //build model course select
  for (var i = 0; i < courses.length; i++) {
    //Todo: Make this algorithm not shit
    for (var j = 0; j < books.length; j++) {
      if (books[j].CID == courses[i].CID) {
        books[j].CourseNumber = courses[i].CourseNumber;
        books[j].CourseTitle = courses[i].CourseTitle;
      }
    }
    //ADDS EACH COURSE NUMBER TO THE MODAL SELECT DROP DOWN
    var optionAdd = document.createElement("option");
    optionAdd.text = courses[i].CourseNumber;
    document.getElementById('courseNumForm').add(optionAdd);


  }
  buildTable(books);
}

//todo: input validation and create manual/import differences
function newBook(book) {
  var bookSplit = book.split(",");
  var docData = {
    CID: bookSplit[0],
    Year: bookSplit[1],
    Author: bookSplit[2],
    BookTitle: bookSplit[3],
    Edition: bookSplit[4],
    ISBN: bookSplit[5],
    Publisher: bookSplit[6],
    Lead: bookSplit[7],
    LeadName: bookSplit[8],
    Notes: bookSplit[9]
  };

  db.collection("Books").doc().set(docData).then(function() {
    console.log("Document successfully written!");
  });
}

//Import a course string with a predefined CID
//string should be formated like (CID,CourseNumber,CourseTitle)
async function newCourseManualCID(courseSplit) {
  //validate CID is number
  if (!IsNumeric(courseSplit[0])) {
    console.log("Invalid CID");
    return;
  }
  //create courseobject and parse CID to int
  var courseData = {
    CID: parseInt(courseSplit[0], 10),
    CourseNumber: courseSplit[1],
    CourseTitle: courseSplit[2]
  };
  //check if course already exists
  //
  if (await getCoursebyCID(courseData.CID) != null) {
    console.log("Course already exists");
    return;
  }
  //Send courseObject to firebase
  db.collection("Courses").doc().set(courseData).then(function() {
    console.log("Document successfully written!");
  });
}

//this is the method to call to add a new course.
//pass in a string of comma seperated course values with the following format
//CID,CourseNumber,CourseTitle
//or
//CourseNumber,CourseTitle
async function newCourse(courseString) {
  var courseSplit = courseString.split(",");
  //if courseString has 3 values, then there is a manual CID
  //call manualCID function
  if (courseSplit.length == 3) {
    newCourseManualCID(courseSplit);
    return;
  }
  //input validation
  if (courseSplit.length != 2) {
    console.log("Invalid Entry");
    return;
  }

  var courseData = {
    CourseNumber: courseSplit[0],
    CourseTitle: courseSplit[1]
  };
  //checks if course title and number already in database
  if (await doesCourseExist(courseData.CourseNumber, courseData.CourseTitle)) {
    console.log("Course already exists");
    return;
  }

  const newCID = await getNewCID();

  courseData.CID = newCID;

  db.collection("Courses").doc().set(courseData).then(function() {
    console.log("Document successfully written!");
  });

}
//param:String of the book values
//param:the corrosponding ID in firebase you want to edit
function setBook(book, id) {
  var bookSplit = book.split(",");
  var docData = {
    CID: bookSplit[0],
    Year: bookSplit[1],
    Author: bookSplit[2],
    BookTitle: bookSplit[3],
    Edition: bookSplit[4],
    ISBN: bookSplit[5],
    Publisher: bookSplit[6],
    Lead: bookSplit[7],
    LeadName: bookSplit[8],
    Notes: bookSplit[9]
  };
  db.collection("Books").doc(id).set(docData).then(function() {
    console.log("Document successfully written!");
    location.reload();
  });

}

//helper function to check if input is a number
//fails if input is ' ' or '\t\t' or '\n\r'. Don't care to fix
//https://stackoverflow.com/questions/18082/validate-decimal-numbers-in-javascript-isnumeric
function IsNumeric(input) {
  return (input - 0) == input && ('' + input).trim().length > 0;
}

function buildTable(objectArray) {
  var groupColumn = 1;
  var table = $('#searchBookTable').DataTable({
    data: objectArray,
    columns: [{
        data: 'CourseNumber'
      },
      {
        data: 'CourseTitle'
      },
      {
        data: 'Year'
      },
      {
        data: 'Author'
      },
      {
        data: 'BookTitle'
      },
      {
        data: 'Edition'
      },
      {
        data: 'ISBN'
      },
      {
        data: 'Publisher'
      },
      {
        data: 'Lead'
      },
      {
        data: 'LeadName'
      },
      {
        data: 'Notes'
      }
    ],

    "columnDefs": [{
      "visible": false,
      "targets": groupColumn
    }],
    "order": [0, 'asc'],
    "displayLength": 25,
    "drawCallback": function(settings) {
      var api = this.api();
      var rows = api.rows({
        page: 'current'
      }).nodes();
      var last = null;

      api.column(groupColumn, {
        page: 'current'
      }).data().each(function(group, i) {
        if (last !== group) {
          $(rows).eq(i).before(
            '<tr class="group"><td colspan="10">' + group + '</td></tr>'
          );

          last = group;
        }
      });
    }
  });

  //gets the value created from form submit on home page
  //tries a search
  table.search(window.location.search.slice(13)).draw();
  // Order by the grouping

  $('#searchBookTable tbody').on('click', 'tr.group', function() {
    var currentOrder = table.order()[0];
    if (currentOrder[0] === groupColumn && currentOrder[1] === 'asc') {
      table.order([groupColumn, 'desc']).draw();
    } else {
      table.order([groupColumn, 'asc']).draw();
    }
  });

  //grab row data and load up modal/form for edit book
  $("#searchBookTable tbody").on('click', 'tr.odd, tr.even', function() {

    var cellData = table.row($(this)).data();

    //set to change so the CourseTitle gets updated
    $('#courseNumForm').val(cellData.CourseNumber).change();
    document.getElementById('yearForm').value = cellData.Year;
    document.getElementById('authorForm').value = cellData.Author;
    document.getElementById('bookTitleForm').value = cellData.BookTitle;
    document.getElementById('editionForm').value = cellData.Edition;
    document.getElementById('isbnForm').value = cellData.ISBN;
    document.getElementById('publisherForm').value = cellData.Publisher;
    document.getElementById('leadForm').value = cellData.Lead;
    document.getElementById('leadNameForm').value = cellData.LeadName;
    document.getElementById('notesForm').value = cellData.Notes;
    //set hidden form elements
    document.getElementById('cidForm').value = cellData.CID;
    document.getElementById('idForm').value = cellData.__id;

    // Real time listener on authentication. Allows ability for the form.
    firebase.auth().onAuthStateChanged(firebaseUser => {
      if (firebaseUser) {
        console.log(firebaseUser);
        $('#editBookSearchModal').modal('show');
      } else {
        console.log("Hello you're not logged in");
        $('#editBookSearchModal').modal('hide');
      }
    })
    //$('#editBookSearchModal').modal('show');
  });
  //unhide the table
  document.getElementById('searchBookTable').classList.remove('hide');
}




//when the courseNumber drop down is changed
//find the corresponding CourseTitle and set that value to the form
$("#courseNumForm").change(function() {
  for (var goop = 0; goop < courses.length; goop++) {
    if (courses[goop].CourseNumber == $(this).val()) {
      $('#courseTitleForm').val(courses[goop].CourseTitle).change();
      $('#cidForm').val(courses[goop].CID).change();
    }
  }
});


function submitBookModal() {
  var bookString = "";

  bookString += document.getElementById('cidForm').value + ",";
  bookString += document.getElementById('yearForm').value + ",";
  bookString += document.getElementById('authorForm').value + ",";
  bookString += document.getElementById('bookTitleForm').value + ",";
  bookString += document.getElementById('editionForm').value + ",";
  bookString += document.getElementById('isbnForm').value + ",";
  bookString += document.getElementById('publisherForm').value + ",";
  bookString += document.getElementById('leadForm').value + ",";
  bookString += document.getElementById('leadNameForm').value + ",";
  bookString += document.getElementById('notesForm').value;

  $('#editBookSearchModal').modal('hide');
  //save changes to firestore
  setBook(bookString, document.getElementById('idForm').value);
}

/* Modal for other web browsers */
$(function() {
  var isIE = window.ActiveXObject || "ActiveXObject" in window;
  if (isIE) {
    $('.modal').removeClass('fade');
  }
});
