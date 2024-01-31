import {addDoc,collection,db} from './a_firebaseConfig';
import { URLEMAILTEMPLATES, URLREGISTER_EN, URLREGISTER_DE } from './ab_base';
import toastr from 'toastr';

// ======== Resend Register email ==========
/*============================================================================================================================================================
  * Resends the registration email to the user. It retrieves the user's email and language preference from session storage, constructs the HTML content of the
  * email based on the language, and sends the email using Firebase's Firestore database. Displays success message upon successful email resend and error
  *  message in case of failure.
=============================================================================================================================================================*/

async function resendEmail() {
  const user_email = sessionStorage.getItem('user_email');
  const stored_userID = sessionStorage.getItem('userID');

  let storedLang = localStorage.getItem('language');
  // Subject for Register email - EN
  let register_email_subject = 'Thanks for Applicating';
  // Template for Register email - EN
  let register_email_url = 'https://raw.githubusercontent.com/dauHerkert/bho/main/mails_templates/' + URLREGISTER_EN;

  if (storedLang && storedLang === 'de') {
    // Subject for Register email - DE
    register_email_subject = 'Vielen Dank für Ihre Anmeldung';
    // Template for Register email - DE
    register_email_url = 'https://raw.githubusercontent.com/dauHerkert/bho/main/mails_templates/' + URLREGISTER_DE;
  }

  try {
    let html;
    let subject;

    html = await fetch(register_email_url)
      .then(response => response.text())
      .then(html => html.replace('${userID}', stored_userID));
    subject = register_email_subject;

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