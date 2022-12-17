// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile, updateEmail, updatePassword } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore, collection, addDoc, setDoc, updateDoc, getDoc, doc } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js'

    // TODO: Add SDKs for Firebase products that you want to use
    // https://firebase.google.com/docs/web/setup#available-libraries
  
    // Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDuWqqoSEfawmsdJNQzIDKk6lfvEKAubmA",
  authDomain: "porsche-tms.firebaseapp.com",
  projectId: "porsche-tms",
  storageBucket: "porsche-tms.appspot.com",
  messagingSenderId: "267742806983",
  appId: "1:267742806983:web:7e8a7ed147f052676b8fe2"
};
  
    // Initialize Firebase and declare "global" variables. all variables declared in this section are accessible to functions that follow.
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
	const db = getFirestore(app);
    const colRef = collection(db, "users");
    
     if (window.location.pathname == "/"){
   //identify auth action forms
    let signUpForm = document.getElementById('wf-form-signup-form');
    let signInForm = document.getElementById('wf-form-signin-form');
    let signOutButton = document.getElementById('signout-button');    

    //assign event listeners, if the elements exist
    if(typeof(signUpForm) !== null) {
      signUpForm.addEventListener('submit', handleSignUp, true)
      } else {  };
      
     if(typeof(signInForm) !== null) {
      signInForm.addEventListener('submit', handleSignIn, true)
      } else {};
      
      if(typeof signOutButton !== null) {
        signOutButton.addEventListener('click', handleSignOut);
           } else {}
      
    
    //handle signUp
    function handleSignUp(e) {
        e.preventDefault();
        e.stopPropagation();
        
      const email = document.getElementById('signup-email').value;
      const password = document.getElementById('signup-password').value;
      
      console.log("email is " + email);
      console.log("password is " + password + ". Now sending to firebase.");
      
      createUserWithEmailAndPassword(auth, email, password)
    .then(userCredential => {
      // Signed in 
      const user = userCredential.user;
      alert('user successfully created: ' + user.email);
      
      window.location = "/sign-in"
      // ...      
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      var errorText = document.getElementById('signup-error-message');
      console.log(errorMessage);
      errorText.innerHTML = errorMessage;
      // ..
    });
  }; 

      //handle signIn
    
    function handleSignIn(e) {
        e.preventDefault();
        e.stopPropagation();
        
      const email = document.getElementById('signin-email').value;
      const password = document.getElementById('signin-password').value;
      
      signInWithEmailAndPassword(auth, email, password)
    .then(userCredential => {
      // Signed in 
      const user = userCredential.user;
      alert('user logged in: ' + user.email);
       window.location = "/sign-in"
      // ...
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      var errorText = document.getElementById('signin-error-message');
      console.log(errorMessage);
      errorText.innerHTML = errorMessage;
      
    });
    }
    }
    function handleSignOut() {
        signOut(auth).then(() => {
        alert('user signed out')
        window.location = "/"
        // Sign-out successful.
    }).catch((error) => {
    const errorMessage = error.message;
    console.log(errorMessage);
        // An error happened.
    });
        
    }
  
     onAuthStateChanged(auth, (user) => {
  	  let publicElements = document.querySelectorAll("[data-onlogin='hide']");
      let privateElements = document.querySelectorAll("[data-onlogin='show']");
      
      if (user) {
      
      console.log(user);
      
      
      let update_username_modal = document.getElementById("username_form_modal");
      let update_email_modal = document.getElementById("email_form_modal");
      let update_password_modal = document.getElementById("password_form_modal");
      let add_accountType_form = document.getElementById("account-type-form");
      let change_email = document.getElementById("change_email");
      let change_username = document.getElementById("change_username");
      let change_password = document.getElementById("change_password");
      const email = user.email;
      const displayName = user.displayName;
      const uid = user.uid;
      const userType = user.type
      
      if (window.location.pathname == "/sign-in"){
      
        document.getElementById("user_email").innerHTML = `<span><b>Email:</b> ${email}</span>`;
        if (displayName == null){
        	document.getElementById("username_display").innerHTML = `<span><b>Username:</b> Add your username</span>`;
        }else{
        	document.getElementById("username_display").innerHTML = `<span><b>Username:</b> ${displayName}</span>`;
        }
        document.getElementById("user_password").innerHTML = `<span><b>Change Password</b></span>`;
        document.getElementById("account_type_info").innerHTML = ``
      }
      if(update_username_modal !== null){
      	update_username_modal.addEventListener('submit', updateUsername, true);
      }
      if(update_email_modal !== null){
      	update_email_modal.addEventListener('submit', updateUserEmail, true);
      }
      if(update_password_modal !== null){
      	update_password_modal.addEventListener('submit', updateUserPassword, true);
      }
      if(add_accountType_form !== null){
      	add_accountType_form.addEventListener('submit', addAcountType, true);
      }
      
      //Update username
      function updateUsername(e){
      	e.preventDefault();
        e.stopPropagation();
      
      	updateProfile(auth.currentUser, {
        displayName: change_username.value
      }).then(() => {
      	window.location.reload();
        console.log("Updated");
        
      }).catch((error) => {
       console.log("Error happened");
       
      });
      
      }
      
      // Update email
      
      function updateUserEmail(e){
      	e.preventDefault();
        e.stopPropagation();
      
      	updateEmail(auth.currentUser, change_email.value).then(() => {
          console.log("Email updated!")
          window.location.reload();
          // ...
        }).catch((error) => {
          // An error occurred
          // ...
        });      
      }
      
      // update password
      
      function updateUserPassword(e){
         e.preventDefault();
         e.stopPropagation();
        
        const newPassword = change_password.value;
        
        updatePassword(user, newPassword).then(() => {
          // Update successful.
          alert("Password changed!")
          window.location.reload();
          console.log("Updated")
        }).catch((error) => {
          console.log("An error has ocurred")
          // ...
        });
      }
      
      //Add account type
      
      let accountType = document.getElementById("accountType");
      let is_admin = document.getElementById("is_admin");
      
      function addAcountType(e){
        e.preventDefault();
        e.stopPropagation();
        
        const userRef = doc(db, 'users', uid);
		setDoc(userRef, { type: accountType.value, admin: is_admin.value }, { merge: true });
        
       	setTimeout(reload, 5000)
      }
      
      //Depending on account type the page realoads on one or another page and shows the displayName
      
      function reload(){
      	if(accountType.value === 'Press'){
        	window.location.pathname = '/press';
        }
        if(accountType.value === 'Supplier'){
        	window.location.pathname = '/supplier';
        }
      }
      
      if (window.location.pathname == "/press"){
      
      function getUserName(){
        const typeRef = doc(db, 'users', uid);

		document.getElementById("client_press").innerHTML = `Hello Press ${user.displayName}`
        }
        getUserName()
      }
      if (window.location.pathname == "/supplier"){
      
      function getUserName(){
        const typeRef = doc(db, 'users', uid);

		document.getElementById("supplier_user").innerHTML = `Hello Supplier ${user.displayName}`
        }
        getUserName()
      }
      
     async function getUserType(){
        const typeRef = doc(db, 'users', uid);
        const typeSnap = await getDoc(typeRef);

        if (typeSnap.exists()) {
        
         return typeSnap.data().admin
         
        } else {
          // doc.data() will be undefined in this case
          console.log("No such document!");
        }
          }
          
          (async () => {
          
          let userIsAdmin = await getUserType();

          if(userIsAdmin === "1" && window.location.pathname !== '/admin'){
          	window.location.href = "https://firebase-test-a63d06.webflow.io/admin";
            
          }
          
      	})()
      
      // User is signed in, see docs for a list of available properties
      
      privateElements.forEach(function(element) {
      element.style.display = "initial";
      });
      
      publicElements.forEach(function(element) {
      element.style.display = "none";
      });      
      
      console.log(`The current user's UID is equal to ${uid}`);
      
      // ...
    } else {
      // User is signed out
      
      publicElements.forEach(function(element) {
      element.style.display = "initial";
      });
      
      privateElements.forEach(function(element) {
      element.style.display = "none";
      });
      // ...
      return
    }
    
  });
  
        if (window.location.pathname == "/sign-in"){
        let signOutButton2 = document.getElementById('signout-button2');
  
    	if(typeof signOutButton2 !== null) {
        signOutButton2.addEventListener('click', handleSignOut);
           } else {}
}