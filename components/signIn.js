import {signInWithEmailAndPassword,auth,doc,db,getDoc,updateDoc, user} from './a_firebaseConfig';
import toastr from 'toastr'; 

// ============ Handle singin ===============
  /*=========================================================================================================================================================
   * Manages the user sign-in action. It retrieves the email and password from the sign-in form, uses the signInWithEmailAndPassword function from Firebase
   * Authentication to authenticate the user, and redirects the user to the appropriate page based on their account type and language preference. Displays
   *  success messages upon successful sign-in and error messages for various scenarios such as invalid credentials, deleted accounts, or unconfirmed emails.
  ==========================================================================================================================================================*/

  async function handleSignIn(e) {
    e.preventDefault();
    e.stopPropagation();
    let storedLang = localStorage.getItem("language");
    const email = document.getElementById('signin-email').value;
    const password = document.getElementById('signin-password').value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userRef);
      const params = new URLSearchParams(window.location.search);
      const userID = params.get('user_id');
      const userData = docSnap.data();

      if (userID || userData.confirmed_email) {
        
        if (docSnap.exists) {
          toastr.success('user logged in: ' + user.email);

          if (!userData.confirmed_email) {
            await updateDoc(userRef, { confirmed_email: true });
          }

          setTimeout(() => {
            if (storedLang && storedLang === "de") {
              if (userData.user_is_admin || userData.company_admin || userData.basic_admin) {
                window.location = "/de/admin/users-table";
              } else {
                window.location = "/de/account";
              }
            } else {
              if (userData.user_is_admin || userData.company_admin || userData.basic_admin) {
                window.location = "/en/admin/users-table";
              } else {
                window.location = "/en/account";
              }
            }
          }, 1000);
        } else {
          toastr.error('user does not exist');
        }
      } else if (userData.user_deleted) {
        if (storedLang && storedLang == 'en') {
          toastr.error('Your account has been deleted.');
        } else {
          toastr.error('Ihr Konto wurde gelöscht.');
        }
      } else {
        if (storedLang && storedLang == 'en') {
          toastr.error('Please click on the link in your email first in order to sign in.');
        } else {
          toastr.error('Bitte klicken Sie zuerst auf den Link den sie per email erhalten haben.')
        }
      }
    } catch (error) {
      const errorMessage = error.message;
      toastr.error(errorMessage);
    }
  }

  /*================================================================================================================================================================
 * This function is called on the sign-in page. It identifies the sign-in form (wf-form-signin-form) and assigns an event listener to it. The event listener
 * listens for the form's submission and calls the handleSignIn function.
=================================================================================================================================================================*/

export function signInPage(){
  let signInForm = document.getElementById('wf-form-signin-form');

  //assign event listeners
  if(typeof(signInForm) !== null) {
    signInForm.addEventListener('submit', handleSignIn, true)
  }
}