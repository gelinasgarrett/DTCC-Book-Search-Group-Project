/*Firebase Authentication*/
// Authentication
//email: testbook@gmail.com
//password: testbook123
// Initialize Firebase
// Model Form Implementation: https://mdbootstrap.com/docs/jquery/modals/forms/
//i used a different firebase for testing
var config = {
    apiKey: "AIzaSyBqKhPRMvtI-ZcsUYQBjmkzQqBewFizxzw",
    authDomain: "testproject-7b4de.firebaseapp.com",
    databaseURL: "https://testproject-7b4de.firebaseio.com",
    projectId: "testproject-7b4de",
    storageBucket: "testproject-7b4de.appspot.com",
    messagingSenderId: "531426391978"
  };
  firebase.initializeApp(config);

  const db = firebase.firestore();
window.onload = function() {


  const txtEmail = document.getElementById("txtEmail");
  const txtPassword = document.getElementById("txtPassword");
  const logIn = document.getElementById("userlogIn");
  const userSignUp = document.getElementById("userSignUp");
  const logOut = document.getElementById("userlogOut");
  const mainAdmin = document.getElementById("main");
  const loginPage = document.getElementById("loginContent");
  const navLogin = document.getElementById("navLogin");
  const adminConsole = document.getElementById("adminConsole");

  // Login listener
  logIn.addEventListener("click", e => {
    const email = txtEmail.value;
    const pass = txtPassword.value;
    const auth = firebase.auth();

    //Sign In
    const promise = auth.signInWithEmailAndPassword(email, pass);
    promise.catch(e => console.log(e.message));
  });

  // Sign up Listener
  userSignUp.addEventListener("click", e=>{
    // TODO: Check email if valid
    const email = txtEmail.value;
    const pass = txtPassword.value;
    const auth = firebase.auth();

    //Sign In
    const promise = auth.createUserWithEmailAndPassword(email, pass);
    promise.catch(e => console.log(e.message));
  });

  // logOut listener
  logOut.addEventListener("click", e => {
    firebase.auth().signOut();
  });

  // Realtime Listener
  firebase.auth().onAuthStateChanged(firebaseUser => {
    if (firebaseUser) {
      console.log(firebaseUser);
      logOut.style.display = "block";
      mainAdmin.style.display = "block";
      loginPage.style.display = "none";
      navLogin.style.display = "none";
      adminConsole.style.display = "block";

    } else {
      console.log("not logged in");
      logOut.style.display = "none";
        adminConsole.style.display = "none";
      mainAdmin.style.display = "none";
      loginPage.style.display = "block";
      navLogin.style.display = "block";
    }
  });
}


/*Navigation*/
function openNav() {
  document.getElementById("mySidebar").style.width = "250px";
  document.getElementById("main").style.marginLeft = "250px";
}

function closeNav() {
  document.getElementById("mySidebar").style.width = "0";
  document.getElementById("main").style.marginLeft = "0";
}



$("#editCoursesPanel").click(function() {
  console.log("hello");
 
  document.getElementById('editCoursesDiv').classList.remove('hide');
  document.getElementById('editBooksDiv').classList.add('hide');

});
$("#editBooksPanel").click(function() {
  
  document.getElementById('editCoursesDiv').classList.add('hide');
  document.getElementById('editBooksDiv').classList.remove('hide');

});



var books;
var courses;

$("#prog").change(function () {
	$('#upProg').html($("#prog").val());
	$('#upProg').attr('style',"width:"+$("#prog").val()+"%");
});

//initialize any element needed for page
initializePageElements();



//queries books by CID
//param: CID number
//returns: array of book objects
async function getBooksbyCID(cid) {
	const snapshot = await db.collection('Books').where('CID', '==', cid).get();
	return snapshot.docs.map(doc =>({__id: doc.id, ...doc.data()}));
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
  buildCourseTable(courses);
  buildBookTable(books);
}

//todo: input validation and create manual/import differences
function newBook(book) {
	var bookSplit = book.split(",");
	if (!IsNumeric(bookSplit[0])) {
		updateProgress();
		console.log("Invalid CID");
		return;
	}
	var docData = {
		CID: parseInt(bookSplit[0], 10),
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
		updateProgress();
		console.log("Document successfully written!");
	});
}

//Import a course string with a predefined CID
//string should be formated like (CID,CourseNumber,CourseTitle)
async function newCourseManualCID(courseSplit) {
	//validate CID is number
	if (!IsNumeric(courseSplit[0])) {
		updateProgress();
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
	if (await getCoursebyCID(courseData.CID)!=null) {
		updateProgress();
		console.log("Course already exists");
		return;
	}
	//Send courseObject to firebase
	db.collection("Courses").doc().set(courseData).then(function() {
		updateProgress();
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
		updateProgress();
		return;
	}

	var courseData = {
		CourseNumber: courseSplit[0],
		CourseTitle: courseSplit[1]
	};
	//checks if course title and number already in database
	if (await doesCourseExist(courseData.CourseNumber,courseData.CourseTitle)) {
		console.log("Course already exists");
		updateProgress();
		return;
	}

	const newCID = await getNewCID();

	courseData.CID = newCID;

	db.collection("Courses").doc().set(courseData).then(function() {
		updateProgress();
		console.log("Document successfully written!");
	});
}

function updateProgress(){
	var inc = parseFloat($('#progInc').val());
	var progress = parseFloat($("#prog").val());
	progress = progress + inc;
	$("#prog").val(progress).change();
}
//param:String of the book values
//param:the corrosponding ID in firebase you want to edit
function setBook(book,id) {
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
		updateProgress();
		console.log("Document successfully written!");
	});

}

//param:String of the course values
//param:the corrosponding ID in firebase you want to edit
function setCourse(course,id) {
	var courseSplit = course.split(",");
		var docData = {
		CID: courseSplit[0],
		CourseNumber: courseSplit[1],
		CourseTitle: courseSplit[2],
	};
	db.collection("Courses").doc(id).set(docData).then(function() {
		updateProgress();
		console.log("Document successfully written!");
	});

}


function deleteBook(id) {
	db.collection("Books").doc(id).delete().then(function() {
		console.log("Document successfully deleted!");
	});

}

async function deleteCourse(cellData) {
	var bookCheck = await getBooksbyCID(cellData.data().CID);
	//check if books assigned to course
	if (bookCheck.length==0) {
		db.collection("Courses").doc(cellData.data().__id).delete().then(function() {
			console.log("Document successfully deleted!");
		});
		cellData.remove().draw( false );
	} else {
		alert("You may not delete a course that has books");
	}


}

//helper function to check if input is a number
//fails if input is ' ' or '\t\t' or '\n\r'. Don't care to fix
//https://stackoverflow.com/questions/18082/validate-decimal-numbers-in-javascript-isnumeric
function IsNumeric(input){
	return (input - 0) == input && (''+input).trim().length > 0;
}

function buildBookTable(objectArray) {
	var table = $('#searchBookTable').DataTable({
        data: objectArray,
		columns: [
        { data: 'CourseNumber' },
        { data: 'CourseTitle' },
        { data: 'Year' },
		{ data: 'Author' },
		{ data: 'BookTitle' },
        { data: 'Edition' },
        { data: 'ISBN' },
		{ data: 'Publisher' },
        { data: 'Lead' },
        { data: 'LeadName' },
        { data: 'Notes' }
		],  
		columnDefs: [{
        targets: 3,
        render: function ( data, type, row ) {
            return data.substr(0,13);
		}},
		{
        targets: 6,
        render: function ( data, type, row ) {
            return data.substr(0,13);
		}},
		{
        targets: 4,
        render: function ( data, type, row ) {
            return data.substr(0,40);
			}
		}],
		scrollY:        '55vh',
        scrollCollapse: true,
        paging:         false
    });

	//unhide the table
	document.getElementById('searchBookTable').classList.remove('hide');
	addBookButtons();

    // Order by the grouping
    $('#searchBookTable tbody').on( 'click', 'tr.group', function () {
        var currentOrder = table.order()[0];
        if ( currentOrder[0] === groupColumn && currentOrder[1] === 'asc' ) {
            table.order( [ groupColumn, 'desc' ] ).draw();
        }
        else {
            table.order( [ groupColumn, 'asc' ] ).draw();
        }
    });

	$("#searchBookTable tbody").on('click', 'tr', function () {
		if ( $(this).hasClass('selected') ) {
            $(this).removeClass('selected');
        }
        else {
            table.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
        }
	});

	$('#addBookButton').click( function () {
		document.getElementById('yearForm').value = "";
		document.getElementById('authorForm').value = "";
		document.getElementById('bookTitleForm').value = "";
		document.getElementById('editionForm').value = "";
		document.getElementById('isbnForm').value = "";
		document.getElementById('publisherForm').value = "";
		document.getElementById('leadForm').value = "";
		document.getElementById('leadNameForm').value = "";
		document.getElementById('notesForm').value = "";

		$('#courseNumForm').val("CIS107").change();
		//set hidden form element
		document.getElementById('idForm').value = "";
		$('#editBookSearchModal').modal('show');

    });
	$('#deleteBookButton').click( function () {
		$("#yesDelete").off("click");
		$('#deleteWarningModal').modal('show');
		$('#yesDelete').click( function () {
			$('#deleteWarningModal').modal('hide');
			deleteBook(table.row('.selected').data().__id);
			table.row('.selected').remove().draw( false );
		});
    });
	$('#editBookButton').click( function () {
        var cellData = table.row('.selected').data();
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

		$('#editBookSearchModal').modal('show');
    });

	//this got out of hand quick....
	$("#importBookButton").click(function () {
		document.getElementById("confirmImport").value = "Select File";
		document.getElementById("confirmImport").classList.remove('btn-success');
		document.getElementById("confirmImport").classList.add('btn-danger');
		$('#importPtag').text('CSV import can be the following format, Newline after each book\nCourse,Year,Author,BookTitle,Edition,\nISBN,Publisher,Lead,LeadName,Notes');
		$('#importModal').modal('show');
		$("#confirmImport").off("click");
		$("input#fileInput").change(function () {
			$("#confirmImport").off("click");
			document.getElementById("confirmImport").value = "Click to Import";
			document.getElementById("confirmImport").classList.remove('btn-danger');
			document.getElementById("confirmImport").classList.add('btn-success');
			$('#confirmImport').click( function () {
				var rdr = new FileReader();
				rdr.onload = function (e) {
					//get the rows into an array
					var therows = e.target.result.split("\n");
					$('#progInc').val(100/therows.length).change();
					//loop through the rows
					for (var row = 0; row < therows.length; row++) {
						newBook(therows[row]);
					}
				}
				rdr.readAsText($("#fileInput")[0].files[0]);	
				document.getElementById("confirmImport").value = "Select File";
				document.getElementById("confirmImport").classList.remove('btn-success');
				document.getElementById("confirmImport").classList.add('btn-danger');
				$("#confirmImport").off("click");
				$('#importModal').modal('hide');
				
				$("#prog").val(0).change();
				$('#updatingModal').modal('show');
			});
		$("input#fileInput").off("change");
		});
	$("importCourseButton").off("click");
    });
}
//helper for import shit
$('#importModal').on('hidden.bs.modal', function (e) {
    document.getElementById('fileInput').value = "";
	$("#confirmImport").off("click");
	$("input#fileInput").off("change");
	$("importCourseButton").off("click");
})

function addCourseButtons() {

	var buttonDiv = $('#searchCourseTable_wrapper').children('div').eq(0).children('div').eq(0);

	var addCourseButton = document.createElement('input');
		addCourseButton.type = "button";
		addCourseButton.name = "addCourseButton";
		addCourseButton.value = "Add";
		addCourseButton.id = 'addCourseButton';

	var deleteCourseButton = document.createElement('input');
		deleteCourseButton.type = "button";
		deleteCourseButton.name = "deleteCourseButton";
		deleteCourseButton.value = "Delete";
		deleteCourseButton.id = 'deleteCourseButton';

	var editCourseButton = document.createElement('input');
		editCourseButton.type = "button";
		editCourseButton.name = "editCourseButton";
		editCourseButton.value = "Edit";
		editCourseButton.id = 'editCourseButton';

	var importCourseButton = document.createElement('input');
		importCourseButton.type = "button";
		importCourseButton.value = "Import Course";
		importCourseButton.name = "importCourseButton";
		importCourseButton.id = 'importCourseButton';

	buttonDiv.append(addCourseButton);
	buttonDiv.append(editCourseButton);
	buttonDiv.append(deleteCourseButton);
	buttonDiv.append(importCourseButton);
}

function addBookButtons() {

	var buttonDiv = $('#searchBookTable_wrapper').children('div').eq(0).children('div').eq(0);

	var addBookButton = document.createElement('input');
		addBookButton.type = "button";
		addBookButton.name = "addBookButton";
		addBookButton.value = "Add";
		addBookButton.id = 'addBookButton';

	var deleteBookButton = document.createElement('input');
		deleteBookButton.type = "button";
		deleteBookButton.name = "deleteBookButton";
		deleteBookButton.value = "Delete";
		deleteBookButton.id = 'deleteBookButton';

	var editBookButton = document.createElement('input');
		editBookButton.type = "button";
		editBookButton.name = "editBookButton";
		editBookButton.value = "Edit";
		editBookButton.id = 'editBookButton';

	var importBookButton = document.createElement('input');
		importBookButton.type = "button";
		importBookButton.value = "Import Book";
		importBookButton.name = "importBookButton";
		importBookButton.id = 'importBookButton';


	buttonDiv.append(addBookButton);
	buttonDiv.append(editBookButton);
	buttonDiv.append(deleteBookButton);
	buttonDiv.append(importBookButton);
}

//when the courseNumber drop down is changed
//find the corresponding CourseTitle and set that value to the form
$("#courseNumForm").change(function(){
	for (var goop=0;goop<courses.length;goop++) {
		if (courses[goop].CourseNumber == $(this).val()) {
			$('#courseTitleForm').val(courses[goop].CourseTitle).change();
			$('#cidForm').val(courses[goop].CID).change();
		}
	}
});


function submitBookModal() {
	var bookString = "";

	bookString += document.getElementById('cidForm').value+",";
	bookString += document.getElementById('yearForm').value+",";
	bookString += document.getElementById('authorForm').value+",";
	bookString += document.getElementById('bookTitleForm').value+",";
	bookString += document.getElementById('editionForm').value+",";
	bookString += document.getElementById('isbnForm').value+",";
	bookString += document.getElementById('publisherForm').value+",";
	bookString += document.getElementById('leadForm').value+",";
	bookString += document.getElementById('leadNameForm').value+",";
	bookString += document.getElementById('notesForm').value;

	$('#editBookSearchModal').modal('hide');
	//save changes to firestore
	var bookId = document.getElementById('idForm').value;
	if (bookId == "") {
		newBook(bookString);
	} else {
		setBook(bookString,bookId);
	}
	$('#progInc').val(100).change();
	$("#prog").val(0).change();
	$('#updatingModal').modal('show');
}

function submitCourseModal() {
	var courseString = "";

	$('#editCourseSearchModal').modal('hide');
	//save changes to firestore
	var courseId = document.getElementById('courseIdForm').value;
	if (courseId == "") {
		courseString += document.getElementById('courseCourseNumberForm').value+",";
		courseString += document.getElementById('courseCourseTitleForm').value;
		newCourse(courseString);
	} else {
		courseString += document.getElementById('courseCidForm').value+",";
		courseString += document.getElementById('courseCourseNumberForm').value+",";
		courseString += document.getElementById('courseCourseTitleForm').value;
		setCourse(courseString,courseId);
	}
	$('#progInc').val(100).change();
	$("#prog").val(0).change();
	$('#updatingModal').modal('show');
}

function buildCourseTable(objectArray1) {

	var table2 = $('#searchCourseTable').DataTable({
        data: objectArray1,
		columns: [
        { data: 'CourseNumber' },
        { data: 'CourseTitle' }
		],
		scrollY:        '55vh',
        scrollCollapse: true,
        paging:         false
    });
	document.getElementById('searchCourseTable').classList.remove('hide');

	addCourseButtons();

	$("#searchCourseTable tbody").on('click', 'tr', function () {
		if ( $(this).hasClass('selected') ) {
            $(this).removeClass('selected');
        }
        else {
            table2.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
        }
	});
	$('#addCourseButton').click( function () {
        //set to change so the CourseTitle gets updated
		document.getElementById('courseCourseNumberForm').value = "";
		document.getElementById('courseCourseTitleForm').value = "";
		//set hidden form elements
		document.getElementById('courseCidForm').value = "";
		document.getElementById('courseIdForm').value = "";

		$('#editCourseSearchModal').modal('show');
    });
	$('#deleteCourseButton').click( function () {
		$('#deleteWarningModal').modal('show');
		$("#yesDelete").off("click");
		$('#yesDelete').click( function () {
			$('#deleteWarningModal').modal('hide');
			var cellData = table2.row('.selected');
			deleteCourse(cellData);
		});
    });
	$('#editCourseButton').click( function () {
        var cellData = table2.row('.selected').data();
		document.getElementById('courseCourseNumberForm').value = cellData.CourseNumber;
		document.getElementById('courseCourseTitleForm').value = cellData.CourseTitle;
		//set hidden form elements
		document.getElementById('courseCidForm').value = cellData.CID;
		document.getElementById('courseIdForm').value = cellData.__id;

		$('#editCourseSearchModal').modal('show');
    });

	//this got out of hand quick....
	//its good enough if it works right?
	$("#importCourseButton").click(function () {
		document.getElementById("confirmImport").value = "Select File";
		document.getElementById("confirmImport").classList.remove('btn-success');
		document.getElementById("confirmImport").classList.add('btn-danger');
		$('#importPtag').text('CSV import can be the following formats, Newline after each book\nCID,CourseNumber,CourseTitle\n\nCourseNumber,CourseTitle');
		$('#importModal').modal('show');
		$("#confirmImport").off("click");
		$("input#fileInput").change(function () {
			$("#confirmImport").off("click");
			document.getElementById("confirmImport").value = "Click to Import";
			document.getElementById("confirmImport").classList.remove('btn-danger');
			document.getElementById("confirmImport").classList.add('btn-success');
			$('#confirmImport').click( function () {
				var rdr = new FileReader();
				rdr.onload = function (e) {
					//get the rows into an array
					var therows = e.target.result.split("\n");
					$('#progInc').val(100/therows.length).change();
					//loop through the rows
					for (var row = 0; row < therows.length; row++) {
						newCourse(therows[row]);
					}
				}
				rdr.readAsText($("#fileInput")[0].files[0]);
				$("#confirmImport").off("click");
				document.getElementById("confirmImport").value = "Select File";
				document.getElementById("confirmImport").classList.remove('btn-success');
				document.getElementById("confirmImport").classList.add('btn-danger');
				$('#importModal').modal('hide');
				$("#prog").val(0).change();
				$('#updatingModal').modal('show');
			});
		$("input#fileInput").off("change");
		});
	$("importCourseButton").off("click");
    });
}

	
/* Modal for other web browsers */
$(function() {
  var isIE = window.ActiveXObject || "ActiveXObject" in window;
  if (isIE) {
    $('.modal').removeClass('fade');
  }
});
