import {signOut,auth} from './firebaseConfig';

// Handle signOut
  /*=======================================================================================================================================================
   * Manages the user sign-out action. It uses the signOut function from Firebase Authentication to sign out the current user. Redirects the user to the
   * "/en/signin-bho" page after signing out.
  ========================================================================================================================================================*/

  function handleSignOut() {
    var storedLang = localStorage.getItem("language");
      signOut(auth).then(() => {
        setTimeout(() => {
          toastr.error('user signed out');
      }, 1000);
      setTimeout(() => {
        if(storedLang){
          if(storedLang == "de" && window.location.pathname != "/de/signin-bho"){
            window.location = "/de/signin-bho";
          }else{
            window.location = "/en/signin-bho";
          }
        }else{
          window.location = "/en/signin-bho";
        }

      }, 1500);
      }).catch((error) => {
          const errorMessage = error.message;
          console.log(errorMessage);
      });
  }

  /*================================================================================================================================================================
 * These event listeners listen for clicks on the sign-out buttons (signout-button and signout-button2). When clicked, they call the handleSignOut function.
================================================================================================================================================================*/
let signOutButton = document.getElementById('signout-button');
let signOutButton2 = document.getElementById('signout-button2');
if(signOutButton) {
    signOutButton.addEventListener('click', handleSignOut);
  }
  if(signOutButton2) {
    signOutButton2.addEventListener('click', handleSignOut);
  }