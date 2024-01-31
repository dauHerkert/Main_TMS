import { collection, getDocs, sendPasswordResetEmail, db, auth, doc, getDoc, onAuthStateChanged, user } from './a_firebaseConfig';
import { signInPage } from './signIn';
import { signUpPage } from './signUp';
import { pagePress } from './pressPage';
import { pageAccount } from './accountPage';
import { pageSupplier } from './supplierPage';
import { pageAdmin } from './adminPage';
import { pageCompaniesTable } from './companiesPage';
import toastr from 'toastr';

/*===================================================================================================================================
 * Dev variables and constants
 ====================================================================================================================================*/

const PSNAME = '-ptgp'; // Project slug name
export const DEVEMAIL = 'juan.torres@dauherkert.de'; // Dev admin email
const URLEMAILTEMPLATES = 'https://raw.githubusercontent.com/dauHerkert/bho/main/mails_templates/';
export default URLEMAILTEMPLATES;

/* Environment Domain */
/* needs to be changed manually on register_de_email.html & register_en_email.html & storage.cors.json */
/* TODO: Check if it can be centralized also in the above mentioned pages. */
export const URLENV = 'https://tms-main.webflow.io';

/* URL Pages */
export const URLACCOUNT = '/account';
export const URLADMIN = '/admin/users-table';
export const URLSIGNIN = '/signin' + PSNAME;

/* URL Webflow Assets for Images and Icons */
/* must be changed manually in each email template, where the respective asset is used */
/* TODO: Check if it can be centralized also in the above mentioned pages. */
export const URLASSETS = 'https://uploads-ssl.webflow.com/6453e5fbbb9ef87f5979b611/';
/* ASSETS - Icons */
export const ICON_LOGOUT = '6453e5fbbb9ef8cc1279b64a_logout_icon.svg';
export const ICON_PENCIL = '6462983e76b4d1ee3ac14cd1_pencil-alt.png';
export const ICON_TRASH = '6462e184b518709fa4ff5fe6_trash.png';
export const ICON_SENDMAIL = '6468108d231ed90e8f74b109_Vector.png'; // Send Email icon
/* ASSETS - Images */
export const IMAGE_PROFILE = '6453e5fbbb9ef8507179b64c_profile%20picture.png'; // FallBack Profile Picture
/* ASSETS - Images - used in email templates */
/* TODO: Check if it can be centralized also in the above mentioned pages. */
//export const IMAGE_LOGO_1 = '646cfb757ce45f61d4ce8927_Color%3DDefault.png';
//export const IMAGE_LOGO_2 = '646cfb750cadf08ca3047b91_Color%3DDefault%20(1).png';

/* ASSETS - PDF - used in email templates supplier_de_form_confirmation.html */
/* TODO: Check if it can be centralized also in the above mentioned pages. */
// export const PDF_SC_1_DE = 'https://assets.website-files.com/63388d26d610dba24046d36b/641188f76e881ce3c3ea9ffb_EWE_PTGP_2023_DE.pdf';
// export const PDF_SC_2_DE = 'https://assets.website-files.com/63388d26d610dba24046d36b/641465fb036e3514624b5d8a_PTGP230317_Kurzhinweise%20Arbeitsschutz.pdf';

/* ASSETS - PDF - used in email templates supplier_en_form_confirmation.html */
/* TODO: Check if it can be centralized also in the above mentioned pages. */
// export const PDF_SC_1_EN = 'https://assets.website-files.com/63388d26d610dba24046d36b/641188f7675e5b11e5e0a934_EWE_PTGP_2023_EN.pdf';
// export const PDF_SC_2_EN = 'https://assets.website-files.com/63388d26d610dba24046d36b/641465fb036e3514624b5d8a_PTGP230317_Kurzhinweise%20Arbeitsschutz.pdf';

/* Email Templates */
export const URLREGISTER_EN = 'register_en_email.html';
export const URLREGISTER_DE = 'register_de_email.html';
export const URLREGISTRATIONLINK_EN = 'registration_link_en_email.html';
export const URLREGISTRATIONLINK_DE = 'registration_link_de_email.html';

/* Email Templates  - Press */
export const URLMRAPPLICATIONREJECT_EN = 'press_en_mr_application_rejected.html';
export const URLMRAPPLICATIONREJECT_DE = 'press_de_mr_application_rejected.html';
export const URLMSAPPLICATIONREJECT_EN = 'press_en_ms_application_rejected.html';
export const URLMSAPPLICATIONREJECT_DE = 'press_de_ms_application_rejected.html';
export const URLDIVERSEAPPLICATIONREJECT_EN = 'press_en_diverse_application_rejected.html';
export const URLDIVERSEAPPLICATIONREJECT_DE = 'press_de_diverse_application_rejected.html';

export const URLMRAPPLICATIONACCEPT_EN = 'press_en_mr_application_accepted.html';
export const URLMRAPPLICATIONACCEPT_DE = 'press_de_mr_application_accepted.html';
export const URLMSAPPLICATIONACCEPT_EN = 'press_en_ms_application_accepted.html';
export const URLMSAPPLICATIONACCEPT_DE = 'press_de_ms_application_accepted.html';
export const URLDIVERSEAPPLICATIONACCEPT_EN = 'press_en_diverse_application_accepted.html';
export const URLDIVERSEAPPLICATIONACCEPT_DE = 'press_de_diverse_application_accepted.html';

export const URLMRMSCONFIRMEMAIL_EN = 'form_en_mr_ms_confirmation_form_to_admin.html';
export const URLMRCONFIRMEMAIL_DE = 'form_de_mr_confirmation_email_to_admin.html';
export const URLMSCONFIRMEMAIL_DE = 'form_de_ms_confirmation_email_to_admin.html';
export const URLDIVERSECONFIRMEMAIL_EN = 'form_en_diverse_confirmation_form_to_admin.html';
export const URLDIVERSECONFIRMEMAIL_DE = 'form_de_diverse_confirmation_email_to_admin.html';

export const URLMRMSAPPLICATIONRECEIVED_EN = 'press_en_mr_ms_application_received.html';
export const URLMRAPPLICATIONRECEIVED_DE = 'press_de_mr_application_received.html';
export const URLMSAPPLICATIONRECEIVED_DE = 'press_de_ms_application_received.html';
export const URLDIVERSEAPPLICATIONRECEIVED_EN = 'press_en_diverse_application_received.html';
export const URLDIVERSEAPPLICATIONRECEIVED_DE = 'press_de_diverse_application_received.html';

/* Email Templates  - Supplier */
export const URLSUPPLIERAPPLICATIONREJECT_EN = 'supplier_en_application_rejected.html';
export const URLSUPPLIERAPPLICATIONREJECT_DE = 'supplier_de_application_rejected.html';

export const URLSUPPLIERAPPLICATIONACCEPT_EN = 'supplier_en_application_accepted.html';
export const URLSUPPLIERAPPLICATIONACCEPT_DE = 'supplier_de_application_accepted.html';

export const URLSUPPLIERFORMCONFIRM_EN = 'supplier_en_form_confirmation.html';
export const URLSUPPLIERFORMCONFIRM_DE = 'supplier_de_form_confirmation.html';
export const URLSUPPLIERFORMCHANGE_EN = 'supplier_en_form_changes.html';
export const URLSUPPLIERFORMCHANGE_DE = 'supplier_de_form_changes.html';

/*==================================================================================================================================================================
 * This function retrieves the user information from the Firestore database based on the provided user parameter, which is the user object. It queries the database
 * using the user's UID and returns the corresponding user data if it exists. Otherwise, it displays an error message using Toastr.
===================================================================================================================================================================*/

export async function getUserInfo(user) {
  const typeRef = doc(db, 'users', user.uid);
  const typeSnap = await getDoc(typeRef);
  if ( typeSnap.exists() ) {
    return typeSnap.data();
  } else {
    toastr.error('No user found with that ID');
  }
}

/*=================================================================================================================================================================
* This function translates the navigation menu items based on the selected language (storedLang). It selects the navigation links on the page and iterates over
* each link, checking its text content. If the text matches specific labels (e.g., "Form," "Account," or "Sign Out"), it replaces the text with the corresponding
* translation. In the case of "Sign Out," it replaces the text with an image and the translated text "Ausloggen."
==================================================================================================================================================================*/

function translateNavigation() {
  if (storedLang && storedLang == 'de') {
    let navLinks = $('.nav-menu').find('.nav-link');
    navLinks.each(function(i, e) {
      let navLabel = $(e).text().trim();
      if (navLabel == 'Form') {
        $(e).text('Formular');
      } else if (navLabel == 'Account') {
        $(e).text('Profil');
      } else if (navLabel == 'Sign Out') {
        $(e).text('');
        $(e).prepend('<img id="signout_img" src="' + URLASSETS + ICON_LOGOUT + '"/>Ausloggen');
      }
    });
    let navDropdownLinks = $('#admin_drop').find('nav').find('a');
    navDropdownLinks.each(function(i, e) {
      let navLabel = $(e).text().trim();
      if ( navLabel == 'Users table' ) {
        $(e).text('Benutzerliste');
      } else if ( navLabel == 'Companies table' ) {
        $(e).text('Firmenliste');
      }
    });
  }
}

/*======================================================================================================================================================
 * This code snippet performs several tasks on the first page load. It handles a loading overlay by setting its display to "none" after a delay. It then
 * dispatches a request, checks URL parameters, and defines an asynchronous function called changeCompanyNameToID.
=======================================================================================================================================================*/

const loadingOverlay = document.querySelector(".loading-overlay");
if (loadingOverlay) {
  setTimeout(function() {
    loadingOverlay.style.display = "none";
  }, 2000);
}
dispatchRequest(false);
checkUrlParameter();

async function changeCompanyNameToID(user) {
  console.log("user.user_company:", user.user_company);
  const companiesRef = collection(db, "companies");
  const companiesSnapshot = await getDocs(companiesRef);
  let companyNames = [];
  for (const company of companiesSnapshot.docs) {
    if (user.user_company.includes(company.id)) {
      companyNames.push(company.data().company_name);
    }
  }
  if (companyNames.length > 0) {
    return companyNames.join(", ");
  } else {
    console.log("No company found with that ID");
  }
}

/*===============================================================================================================================================================
* This function populates the forms and sets the appropriate links and display based on the user's information and the selected language (storedLang). It
* retrieves the user information using the getUserInfo(user) function and updates the UI elements accordingly. It also handles specific scenarios for different
* account types and user roles.
================================================================================================================================================================*/

async function populateForms(user) {
  let userInfo = await getUserInfo(user);
  const accountType_button = document.getElementById('account_user_profile');
  const press_info = document.getElementsByClassName('press_info');
  const supplier_info = document.getElementsByClassName('supplier_info');
  let form_button = document.getElementById('form_button');
  var storedLang = localStorage.getItem("language");

  if (userInfo) {
    console.log('populateForms() userInfo', userInfo);

    translateNavigation();
    // Use the changeCompanyNameToID(user) function to get the company name
    const companyNames = await changeCompanyNameToID(userInfo);
    userInfo.user_company_name = companyNames;

    if (storedLang) {
      if (storedLang == "de") {
        if (userInfo.user_is_admin || userInfo.company_admin || userInfo.basic_admin) {
          form_button.setAttribute('href', '/de/supplier');
          document.getElementById('admin_drop').style.display = 'block';
          document.getElementById('admin_drop_mob').style.display = 'block';
        } else if (userInfo.account_type == "No company" && !userInfo.user_is_admin) {
          form_button.setAttribute('href', '/de/supplier');
        } else if (userInfo.account_type == "Supplier" && !userInfo.user_is_admin) {
          form_button.setAttribute('href', '/de/supplier');
        } else if (userInfo.account_type == "RSW" && !userInfo.user_is_admin) {
          form_button.setAttribute('href', '/de/supplier');
        } else if (userInfo.account_type == "Press" && !userInfo.user_is_admin) {
          form_button.setAttribute('href', '/de/press');
        } else if (!userInfo.user_is_admin && (!userInfo.company_admin || !userInfo.basic_admin)) {
          if (window.location.pathname == '/de/users-table' || window.location.pathname == '/de/companies-table') {
            location.replace('/de/account');
          }
          document.getElementById('companies_table').style.display = 'none';
          document.getElementById('admin_drop').style.display = 'none';
          document.getElementById('admin_drop_mob').style.display = 'none !important';
        } else {}
      } else {
        if (userInfo.user_is_admin || userInfo.company_admin || userInfo.basic_admin) {
          form_button.setAttribute('href', '/en/supplier');
          document.getElementById('admin_drop').style.display = 'block';
          document.getElementById('admin_drop_mob').style.display = 'block';
        } else if (userInfo.account_type == "No company" && !userInfo.user_is_admin) {
          form_button.setAttribute('href', '/en/supplier');
        } else if (userInfo.account_type == "Supplier" && !userInfo.user_is_admin) {
          form_button.setAttribute('href', '/en/supplier');
        } else if (userInfo.account_type == "RSW" && !userInfo.user_is_admin) {
          form_button.setAttribute('href', '/en/supplier');
        } else if (userInfo.account_type == "Press" && !userInfo.user_is_admin) {
          form_button.setAttribute('href', '/en/press');
        } else if (!userInfo.user_is_admin && (!userInfo.company_admin || !userInfo.basic_admin)) {
          if (window.location.pathname == '/en/users-table' || window.location.pathname == '/en/companies-table') {
            location.replace('/en/account');
          }
          document.getElementById('admin_drop').style.display = 'none';
          document.getElementById('admin_drop_mob').style.display = 'none !important';
        } else {}
      }
    } else {
      if (userInfo.account_type == "No company" && !userInfo.user_is_admin) {
        form_button.setAttribute('href', '/en/supplier');
      } else if (userInfo.account_type == "Supplier" && !userInfo.user_is_admin) {
        form_button.setAttribute('href', '/en/supplier');
      } else if (userInfo.account_type == "RSW" && !userInfo.user_is_admin) {
        form_button.setAttribute('href', '/en/supplier');
      } else if (userInfo.account_type == "Press" && !userInfo.user_is_admin) {
        form_button.setAttribute('href', '/en/press');
      } else if (!userInfo.user_is_admin && (!userInfo.company_admin || !userInfo.basic_admin)) {
        if (window.location.pathname == '/en/users-table' || window.location.pathname == '/en/companies-table' && !userInfo.company_admin) {
          location.replace('/en/account');
        } else if (window.location.pathname == '/en/users-table' || window.location.pathname == '/en/companies-table' && !userInfo.basic_admin) {
          location.replace('/en/account');
        }
        document.getElementById('admin_drop').style.display = 'none';
        document.getElementById('admin_drop_mob').style.display = 'none';
      } else if (userInfo.user_is_admin || userInfo.company_admin || userInfo.basic_admin) {
        form_button.setAttribute('href', '/en/supplier');
        document.getElementById('admin_drop').style.display = 'block';
        document.getElementById('admin_drop_mob').style.display = 'block';
      } else {}
    }

    if (window.location.pathname == '/de/press' || window.location.pathname == '/en/press') {
      if (userInfo.press_has_form_submitted) {
        document.getElementById("workspot").setAttribute('disabled', "");
        document.getElementById("publisher").setAttribute('disabled', "");
        document.getElementById("media_type").setAttribute('disabled', "");
        document.getElementById("Select-dates").setAttribute('disabled', "");
        document.getElementById("special_press_request").setAttribute('disabled', "");
        document.getElementById("fileInp").setAttribute('disabled', "");
        document.getElementById("press_submmited_form").style.display = 'flex';
      }
    }
  }
}


/*============================================================================================================================================================
* This function is called when the user is signed in. It selects elements with the data-onlogin="show" attribute and sets their display style to "initial",
* making them visible. It also selects elements with the data-onlogin="hide" attribute and sets their display style to "none", hiding them from view.
=============================================================================================================================================================*/

function showPrivateElements() {
  // User is signed in
  let publicElements = document.querySelectorAll("[data-onlogin='hide']");
  let privateElements = document.querySelectorAll("[data-onlogin='show']");
  privateElements.forEach(function(element) {
    element.style.display = "initial";
  });
  publicElements.forEach(function(element) {
    element.style.display = "none";
  });
}

/*============================================================================================================================================================
* This function is called when the user is signed out. It selects elements with the data-onlogin="hide" attribute and sets their display style to "initial",
* making them visible. It selects elements with the data-onlogin="show" attribute and sets their display style to "none", hiding them from view.
=============================================================================================================================================================*/

function showPublicElements() {
  // User is signed out
  let publicElements = document.querySelectorAll("[data-onlogin='hide']");
  let privateElements = document.querySelectorAll("[data-onlogin='show']");
  publicElements.forEach(function(element) {
    element.style.display = "initial";
  });
  privateElements.forEach(function(element) {
    element.style.display = "none";
  });
}

/*=========================================================================================================================================================
 * Check if the company parameter exists in the URL, if it does then set a value in the local storage and pre-populate the text field in the sign up form
==========================================================================================================================================================*/

const zonesRef = collection(db, 'zones');
export function createOptions(select) {
  getDocs(zonesRef)
    .then((snapshot) => {
      snapshot.docs.forEach((doc) => {
        let zone = doc.data();

        var opt = document.createElement('option');
        opt.value = zone.zone;
        opt.textContent = zone.zone;
        select.appendChild(opt);
      });
    })
    .catch(err => {
      console.log('error fetching companies', err);
    });
}

/*===========================================================================================================================================================
 * This function checks the URL parameters and retrieves the value of the 'company' parameter. If the parameter exists, it stores it in the local storage
 * and sets the value of an input field. Otherwise, it sets the input field value to 'No company'.
============================================================================================================================================================*/

function checkUrlParameter() {
  let url = new URL(window.location.href);
  let company = url.searchParams.get('company');

  if (company) {
      localStorage.setItem('company', company);
      $('#sign-up-company').val(company);
  } else {
    $('#sign-up-company').val('No company');
  }
}

/*=========================================================================================================================================================
 * This function handles different actions based on the user's sign-in status and the current URL path, determining which page or functionality to display.
==========================================================================================================================================================*/

function dispatchRequest(user) {
  let url = window.location.pathname;
  console.log('url in dispatchRequest()', url);

  // User is NOT signed in
  if ( user == false ) {
    document.getElementById('signout-button').style.display = 'none';
    if ( url == '/en/signup-ptgp' || url == '/de/signup-ptgp' ) {
      signUpPage();
    } else if ( url == '/en/signin-ptgp' || url == '/de/signin-ptgp' ) {
      signInPage();
    } else if ( url == '/en/press-form' || url == '/de/press-form' ) {
      pagePress();
    } else {
      // User does NOT have access to this page
      console.log('user does NOT have access to this page');
    }
  } else {
    document.getElementById('signout-button').style.display = 'block';
    // User IS signed in
      if ( url == '/en/account' || url == '/de/account' ) {
      pageAccount(user);
    } else if ( url == '/en/supplier' || url == '/de/supplier' ) {
      pageSupplier(user);
    } else if ( url == '/en/admin/users-table' || url == '/de/admin/users-table' ) {
      pageAdmin(user);
    } else if ( url == '/en/admin/companies-table' || url == '/de/admin/companies-table' ) {
      pageCompaniesTable(user);
    }
  }
}

/*=================================================================================================================================================
 * This code snippet handles the forgot password functionality, sends password reset emails, and displays success messages and email confirmation
 * messages based on the current URL path and stored language value.
===================================================================================================================================================*/

if(window.location.pathname == '/en/forgoten-password' || window.location.pathname == '/de/forgoten-password'){
  var storedLang = localStorage.getItem("language");
  let email = document.getElementById('email_address');
  let resetPasword = document.getElementById('forgot_password');

  resetPasword.addEventListener('submit', function(e){
    e.preventDefault();
    e.stopPropagation();

    localStorage.setItem('email', JSON.stringify(email.value));

    sendPasswordResetEmail(auth, email.value)
    .then(() => {
      toastr.success('Email has been sent!');
      setTimeout(function() {

        if (storedLang) {
          if (storedLang == "de") {
            window.location.pathname = '/de/success-email-sent';
          } else {
            window.location.pathname = '/en/success-email-sent';
          }
        } else {
          window.location.pathname = '/en/success-email-sent';
        }
      }, 2000);
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      toastr.error('There was an error');
      // ..
    });
  })
};

if (window.location.pathname == '/success-email-sent') {
  let forgot_password_email = localStorage.getItem('email');
  document.getElementById('email_confirmation_text').innerHTML = `We sent a password reset link to ${forgot_password_email}`;
}

/*=======================================================================================================================================================
 * This function handles URL replacement and redirection based on the user's sign-in or sign-out status and language settings. It sets the appropriate
 * URLs for buttons, adjusts the display of buttons, and redirects the user to the appropriate pages based on the language and user status.
=========================================================================================================================================================*/

async function replaceUrl(user) {
  let form_button = document.getElementById('form_button');
  let account_button = document.getElementById('account_user_profile');
  let users_button = document.getElementById('users_table');
  let companies_button = document.getElementById('companies_table');
  var storedLang = localStorage.getItem("language");
  const userRef = doc(db, 'users', user.uid);
  const docSnap = await getDoc(userRef);
  const userData = docSnap.data();

  if (!user) {
    if (storedLang) {
      if (storedLang == "de") {
        form_button.setAttribute('href', '/de/signin-ptgp');
        account_button.setAttribute('href', '/de/signin-ptgp');
        users_button.setAttribute('href', '/de/signin-ptgp');
        companies_button.setAttribute('href', '/de/signin-ptgp');
        document.getElementById('signIn_button').style.display = 'block';
        document.getElementById('signUp_button').style.display = 'block';
        if (window.location.pathname == '/' && !userData.confirmed_email) {
          window.location.replace(URLENV + '/de/signin-ptgp');
        } else if (window.location.pathname !== '/de/success-email-sent' && window.location.pathname !== '/de/forgoten-password' && window.location.pathname !== '/de/signin-ptgp' && window.location.pathname !== '/de/signup-ptgp' && window.location.pathname !== '/de/press-form' && window.location.pathname !== '/de/data-protection' && window.location.pathname !== '/de/impressum') {
          window.location.replace(URLENV + '/de/signin-ptgp');
        }
      } else {
        form_button.setAttribute('href', '/en/signin-ptgp');
        account_button.setAttribute('href', '/en/signin-ptgp');
        users_button.setAttribute('href', '/de/signin-ptgp');
        companies_button.setAttribute('href', '/de/signin-ptgp');
        document.getElementById('signIn_button').style.display = 'block';
        document.getElementById('signUp_button').style.display = 'block';
        if (window.location.pathname == '/' && !userData.confirmed_email) {
          window.location.replace(URLENV + '/en/signin-ptgp');
        } else if (window.location.pathname !== '/en/success-email-sent' && window.location.pathname !== '/en/forgoten-password' && window.location.pathname !== '/en/signin-ptgp' && window.location.pathname !== '/en/signup-ptgp' && window.location.pathname !== '/en/press-form' && window.location.pathname !== '/en/data-protection' && window.location.pathname !== '/en/impressum') {
          window.location.replace(URLENV + '/en/signin-ptgp');
        }
      }
    } else {
      form_button.setAttribute('href', '/en/signin-ptgp');
      account_button.setAttribute('href', '/en/signin-ptgp');
      users_button.setAttribute('href', '/de/signin-ptgp');
      companies_button.setAttribute('href', '/de/signin-ptgp');
      document.getElementById('signIn_button').style.display = 'block';
      document.getElementById('signUp_button').style.display = 'block';
    }
  } else {
    if (storedLang) {
      if (storedLang == "de") {
        account_button.setAttribute('href', '/de/account');
        users_button.setAttribute('href', '/de/admin/users-table');
        companies_button.setAttribute('href', '/de/admin/companies-table');
        document.getElementById('signIn_button').style.display = 'none';
        document.getElementById('signUp_button').style.display = 'none';
        if (window.location.pathname == '/' && !userData.confirmed_email) {
          window.location.replace(URLENV + '/de/signup-form-submitted');
        } else if (window.location.pathname == '/' && userData.confirmed_email) {
          window.location.replace(URLENV + '/de/account');
        }
      } else {
        account_button.setAttribute('href', '/en/account');
        users_button.setAttribute('href', '/en/admin/users-table');
        companies_button.setAttribute('href', '/en/admin/companies-table');
        document.getElementById('signIn_button').style.display = 'none';
        document.getElementById('signUp_button').style.display = 'none';
        if (window.location.pathname == '/' && !userData.confirmed_email) {
          window.location.replace(URLENV + '/en/signup-form-submitted');
        } else if (window.location.pathname == '/' && userData.confirmed_email) {
          window.location.replace(URLENV + '/en/account');
        }
      }
    } else {
      account_button.setAttribute('href', '/en/account');
      users_button.setAttribute('href', '/en/admin/users-table');
      companies_button.setAttribute('href', '/en/admin/companies-table');
      document.getElementById('signIn_button').style.display = 'none';
      document.getElementById('signUp_button').style.display = 'none';
      if (window.location.pathname == '/' && !userData.confirmed_email) {
        window.location.replace(URLENV + '/en/signup-form-submitted');
      } else if (window.location.pathname == '/' && userData.confirmed_email) {
        window.location.replace(URLENV + '/en/account');
      }
    }
  }
}

/*============================================================================================================================================================
 * This function handles URL replacement and redirection based on the sign-out status and language settings. It redirects the user to the appropriate sign-in
 * page based on the language or displays the sign-in and sign-up buttons accordingly.
===============================================================================================================================================================*/

async function replaceUrlSignOut(user) {
  if (!user) {
    if (storedLang) {
      if (storedLang == "de") {
        document.getElementById('signIn_button').style.display = 'block';
        document.getElementById('signUp_button').style.display = 'block';
        if (window.location.pathname == '/') {
          window.location.replace(URLENV + '/de/signin-ptgp');
        } else if (window.location.pathname !== '/de/success-email-sent' && window.location.pathname !== '/de/forgoten-password' && window.location.pathname !== '/de/signin-ptgp' && window.location.pathname !== '/de/signup-ptgp' && window.location.pathname !== '/de/press-form' && window.location.pathname !== '/de/data-protection' && window.location.pathname !== '/de/impressum') {
          window.location.replace(URLENV + '/de/signin-ptgp');
        }
      } else {
        document.getElementById('signIn_button').style.display = 'block';
        document.getElementById('signUp_button').style.display = 'block';
        if (window.location.pathname == '/') {
          window.location.replace(URLENV + '/en/signin-ptgp');
        } else if (window.location.pathname !== '/en/success-email-sent' && window.location.pathname !== '/en/forgoten-password' && window.location.pathname !== '/en/signin-ptgp' && window.location.pathname !== '/en/signup-ptgp' && window.location.pathname !== '/en/press-form' && window.location.pathname !== '/en/data-protection' && window.location.pathname !== '/en/impressum') {
          window.location.replace(URLENV + '/en/signin-ptgp');
        }
      }
    } else {
      form_button.setAttribute('href', '/en/signin-ptgp');
      account_button.setAttribute('href', '/en/signin-ptgp');
      users_button.setAttribute('href', '/de/signin-ptgp');
      companies_button.setAttribute('href', '/de/signin-ptgp');
      document.getElementById('signIn_button').style.display = 'block';
      document.getElementById('signUp_button').style.display = 'block';
    }
  }
}

/*=====================================================================================================================================================
 *This code snippet listens for changes in the authentication state using the onAuthStateChanged function. When a user signs in, it logs the user's UID
 * to the console, replaces the URL, dispatches a request, populates forms, and shows private elements. When a user signs out, it replaces the URL, shows
 * public elements, and exits the function.
=======================================================================================================================================================*/

onAuthStateChanged(auth, (user) => {

  if (user) {
    // user is signed in
    console.log(`The current user's UID is equal to ${user.uid}`);
    replaceUrl(user);
    dispatchRequest(user);
    populateForms(user);
    showPrivateElements();

  } else {
    // user is signed out
    replaceUrlSignOut(user)
    showPublicElements();
    return;
  }
});

/*===================================================================================================================================
 * These onClick events add/delete a class to the selected language and triggers the changeLanguage and updateLinks functions
 ====================================================================================================================================*/

let reloaded = false;

function changeLanguage(lang) {
  const currentPath = window.location.pathname;
  const isWelcomePage = currentPath.startsWith("/en/welcome") || currentPath.startsWith("/de/welcome");
  const isSignupPage = currentPath.startsWith("/en/signup") || currentPath.startsWith("/de/signup");
  const urlParams = new URLSearchParams(window.location.search);
  const companyId = urlParams.get("company");

  localStorage.setItem("language", lang);
  let newPath = currentPath.replace(/^\/[a-z]{2}/, `/${lang}`);

  if (companyId && (isWelcomePage || isSignupPage)) {
    newPath += `?company=${companyId}`;
  }
  window.history.pushState({}, null, newPath);

  if (!reloaded) {
    reloaded = true;
    location.reload();
  }
}

let currentLang = 'en';

window.addEventListener('load', function(){
  var storedLang = localStorage.getItem("language");
  if(storedLang){
    currentLang = storedLang;
  }
  updateLinks();
});

function updateLinks() {
  console.log("Updating linkss");
  var baseUrl = window.location.origin;
  var currentPath = window.location.pathname;
  var pathArray = currentPath.split("/");
  if (pathArray.length < 3 || (pathArray.length >= 3 && !/^[a-z]{2}$/.test(pathArray[1]))) {
    currentPath = '/'+currentLang+currentPath;
  }
  var links = document.querySelectorAll(".nav-link");
  if (links) {
    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      if(!link.href.startsWith(baseUrl)){
        link.href = baseUrl + currentPath + link.getAttribute("href");
      }
    }
  }
}

/*===================================================================================================================================
 * These onClick events add/delete a class to the selected language and triggers the changeLanguage and updateLinks functions
====================================================================================================================================*/

var storedLang = localStorage.getItem("language");
let sign_lang = document.getElementById('selected_lang2');
let user_lang = document.getElementById('selected_lang');
if (storedLang) {
  if (storedLang == "de") {
    if (user_lang) {
      document.getElementById('englishBtn').classList.remove('selected');
      document.getElementById('germanBtn').classList.add('selected');
    }
    if (sign_lang) {
      document.getElementById('englishBtn2').classList.remove('selected');
      document.getElementById('germanBtn2').classList.add('selected');
    }
  } else {
    if (user_lang) {
      document.getElementById('englishBtn').classList.add('selected');
      document.getElementById('germanBtn').classList.remove('selected');
    }
    if (sign_lang) {
      document.getElementById('englishBtn2').classList.add('selected');
      document.getElementById('germanBtn2').classList.remove('selected');
    }
  }
} else {
  if (user_lang) {
    document.getElementById('englishBtn').classList.add('selected');
    document.getElementById('germanBtn').classList.remove('selected');
  }
  if (sign_lang) {
    document.getElementById('englishBtn2').classList.add('selected');
    document.getElementById('germanBtn2').classList.remove('selected');
  }
}

document.getElementById("englishBtn").addEventListener("click", function() {
  changeLanguage("en");
  updateLinks();
  document.getElementById('englishBtn').classList.add('selected');
  document.getElementById('germanBtn').classList.remove('selected');
});

document.getElementById("germanBtn").addEventListener("click", function() {
  changeLanguage("de");
  updateLinks();
  document.getElementById('englishBtn').classList.remove('selected');
  document.getElementById('germanBtn').classList.add('selected');
});

let signEnBtn = document.getElementById("englishBtn2")
if (signEnBtn) {
  signEnBtn.addEventListener("click", function() {
    changeLanguage("en");
    updateLinks();
    document.getElementById('germanBtn2').classList.remove('selected');
    document.getElementById('englishBtn2').classList.add('selected');
  });
}

let signDeBtn = document.getElementById("germanBtn2")
if (signDeBtn) {
  signDeBtn.addEventListener("click", function() {
    changeLanguage("de");
    updateLinks();
    document.getElementById('germanBtn2').classList.add('selected');
    document.getElementById('englishBtn2').classList.remove('selected');
  });
}

/*===================================================================================================================================
 * This function adds a border bottom to the link on the navbar of the current page
 ====================================================================================================================================*/

let form_button = document.getElementById('form_button');
let admin_users_table = document.getElementById("users_table");
let admin_companies_table = document.getElementById("companies_table");

if (window.location.pathname == '/de/press' || window.location.pathname == '/en/press' || window.location.pathname == '/de/supplier' || window.location.pathname == '/en/supplier') {
  form_button.style.borderBottom = "2px solid #B11372";
}
if (window.location.pathname == '/en/admin/users-table' || window.location.pathname == '/de/admin/users-table') {
  admin_users_table.style.borderBottom = "2px solid #B11372";
}
if (window.location.pathname == '/en/admin/companies-table' || window.location.pathname == '/de/admin/companies-table') {
  admin_companies_table.style.borderBottom = "2px solid #B11372";
}

let welcomeBanner = document.getElementById('welcomeBanner');
if (welcomeBanner) {
  if (location.search.indexOf('?company=') !== -1) {
  welcomeBanner.style.display = 'flex';
  } else {
    welcomeBanner.style.display = 'none';
  }
}

/*===============================================================================================================================================================
* This function changes the Admin type title on the tables to the correct one. If the user is a Basic Admin the code will print "Basic Admin" on the DOM element,
* if it's a "Company Admin" will print "Multi Company Admin" and if it's a Super Admin will print "Super Admin".
=================================================================================================================================================================*/

export async function changeAdminTypeTitle(user){
  let userInfo = await getUserInfo(user);
  let storedLang = localStorage.getItem("language");

  if (storedLang == 'en') {
    if (!userInfo.user_is_admin && !userInfo.company_admin && userInfo.basic_admin) {
      document.getElementById('user_admin_type').innerHTML = 'Basic Admin';
    } else if (!userInfo.user_is_admin && !userInfo.basic_admin && userInfo.company_admin) {
      document.getElementById('user_admin_type').innerHTML = 'Multi Company Admin';
    } else if (userInfo.user_is_admin) {
      document.getElementById('user_admin_type').innerHTML = 'Super Admin';
    }
  } else {
    if (!userInfo.user_is_admin && !userInfo.company_admin && userInfo.basic_admin) {
      document.getElementById('user_admin_type').innerHTML = 'Grundlegender Administrator';
    } else if (!userInfo.user_is_admin && userInfo.company_admin && !userInfo.basic_admin) {
      document.getElementById('user_admin_type').innerHTML = 'MEHRFIRMENADMIN';
    } else if (userInfo.user_is_admin) {
      document.getElementById('user_admin_type').innerHTML = 'Superadministrator';
    }
  }
}

/*===================================================================================================================================
 * This function changes the text and the url of the "Impressum" and "Data Protection" on the footer depending on the user's language
 ====================================================================================================================================*/

if (storedLang == 'de') {
  document.getElementById('imprint').textContent = 'Impressum';
  document.getElementById('imprint').setAttribute('href', '/de/impressum');
  document.getElementById('data_protection').textContent = 'Datenschutz';
  document.getElementById('data_protection').setAttribute('href', '/de/data-protection');
}

/*===================================================================================================================================
 * This function redirects from the "Home page" to the "Sign-in page"
 ====================================================================================================================================*/

if(window.location.href == URLENV){
  window.location.href = URLENV + '/en/signin-ptgp' 
}