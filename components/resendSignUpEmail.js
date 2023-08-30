import {addDoc,collection,db} from './a_firebaseConfig';
import toastr from 'toastr';

//Subject for Register email - DE
const register_de_email_subject = 'Vielen Dank für Ihre Anmeldung';
const register_de_email_url = 'https://raw.githubusercontent.com/dauHerkert/bho/main/mails_templates/register_de_email.html';

 //Subject for Register email - EN
 const register_en_email_subject = 'Thanks for Applicating';
 const register_en_email_url = 'https://raw.githubusercontent.com/dauHerkert/bho/main/mails_templates/register_en_email.html';

// ======== Resend Register email ==========
  /*============================================================================================================================================================
   * Resends the registration email to the user. It retrieves the user's email and language preference from session storage, constructs the HTML content of the
   * email based on the language, and sends the email using Firebase's Firestore database. Displays success message upon successful email resend and error
   *  message in case of failure.
  =============================================================================================================================================================*/

  async function resendEmail() {
    const user_email = sessionStorage.getItem('user_email');
    const stored_userID = sessionStorage.getItem('userID');
    const storedLang = localStorage.getItem('language');
  
    try {
      let html;
      let subject;
  
      if (storedLang == 'de') {
        html = await fetch(register_de_email_url)
          .then(response => response.text())
          .then(html => html.replace('${userID}', stored_userID));
        subject = register_de_email_subject;
      } else {
        html = await fetch(register_en_email_url)
          .then(response => response.text())
          .then(html => html.replace('${userID}', stored_userID));
        subject = register_en_email_subject;
      }
  
      const docRef = await addDoc(collection(db, "mail"), {
        to: user_email,
        message: {
          subject: subject,
          html: html,
        }
      });
  
      // Sucessfully resend email
      toastr.success('Email resent successfully!');
    } catch (error) {
      console.error(error);
      // Error resending email
      toastr.error('Failed to resend email. Please try again.');
    }
  }
  
  //Attaches the resendEmail function to the click event of the "resend_email_button" element, triggering the email resend process when the button is clicked.
  const resend_button = document.getElementById('resend_email_button');
  if (resend_button) {
    resend_button.addEventListener('click', resendEmail);
  }