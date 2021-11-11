window.onload = function() {
  var config = {
    apiKey: "AIzaSyBqKhPRMvtI-ZcsUYQBjmkzQqBewFizxzw",
    authDomain: "testproject-7b4de.firebaseapp.com",
    databaseURL: "https://testproject-7b4de.firebaseio.com",
    projectId: "testproject-7b4de",
    storageBucket: "testproject-7b4de.appspot.com",
    messagingSenderId: "531426391978"
  };

  firebase.initializeApp(config);
  //database reference
  const db = firebase.firestore();

  //logOut elements
  const logOut = document.getElementById("userlogOut");
  const navLogin = document.getElementById("navLogin");
  const adminConsole = document.getElementById("adminConsole");

  //userlogOut
  logOut.addEventListener("click", e => {
    firebase.auth().signOut();
  })


  // Realtime Listener
  firebase.auth().onAuthStateChanged(firebaseUser => {
    if (firebaseUser) {
      console.log(firebaseUser);
      adminConsole.style.display = "block";
      logOut.style.display = "block";
      navLogin.style.display = "none";
    } else {
      console.log("not logged in");
      adminConsole.style.display ="none";
      logOut.style.display = "none";
      navLogin.style.display = "block";
    }
  })

}
