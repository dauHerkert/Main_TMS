import { doc,db,getDoc } from './firebaseConfig';

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

 export function translateNavigation() {
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
    $(e).prepend('<img id="signout_img" src="https://uploads-ssl.webflow.com/6453e5fbbb9ef87f5979b611/6453e5fbbb9ef8cc1279b64a_logout_icon.svg"/>Ausloggen');
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

/*===============================================================================================================================================================
* This function populates the forms and sets the appropriate links and display based on the user's information and the selected language (storedLang). It
* retrieves the user information using the getUserInfo(user) function and updates the UI elements accordingly. It also handles specific scenarios for different
* account types and user roles.
================================================================================================================================================================*/

 export async function populateForms(user) {
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
  if (userInfo.user_is_admin == "1" || userInfo.company_admin == "1" || userInfo.basic_admin == "1") {
    form_button.setAttribute('href', '/de/supplier');
    document.getElementById('admin_drop').style.display = 'block';
    document.getElementById('admin_drop_mob').style.display = 'block';
  } else if (userInfo.account_type == "No company" && userInfo.user_is_admin == '0') {
    form_button.setAttribute('href', '/de/supplier');
  } else if (userInfo.account_type == "Supplier" && userInfo.user_is_admin == '0') {
    form_button.setAttribute('href', '/de/supplier');
  } else if (userInfo.account_type == "RSW" && userInfo.user_is_admin == '0') {
    form_button.setAttribute('href', '/de/supplier');
  } else if (userInfo.account_type == "Press" && userInfo.user_is_admin == '0') {
    form_button.setAttribute('href', '/de/press');
  } else if (userInfo.user_is_admin == "0" && (userInfo.company_admin != "1" || userInfo.basic_admin != '1')) {
    if (window.location.pathname == '/de/users-table' || window.location.pathname == '/de/companies-table') {
      location.replace('/de/account');
    }
    document.getElementById('companies_table').style.display = 'none';
    document.getElementById('admin_drop').style.display = 'none';
    document.getElementById('admin_drop_mob').style.display = 'none !important';
  } else {}
} else {
  if (userInfo.user_is_admin == "1" || userInfo.company_admin == "1" || userInfo.basic_admin == "1") {
    form_button.setAttribute('href', '/en/supplier');
    document.getElementById('admin_drop').style.display = 'block';
    document.getElementById('admin_drop_mob').style.display = 'block';
  } else if (userInfo.account_type == "No company" && userInfo.user_is_admin == '0') {
    form_button.setAttribute('href', '/en/supplier');
  } else if (userInfo.account_type == "Supplier" && userInfo.user_is_admin == '0') {
    form_button.setAttribute('href', '/en/supplier');
  } else if (userInfo.account_type == "RSW" && userInfo.user_is_admin == '0') {
    form_button.setAttribute('href', '/en/supplier');
  } else if (userInfo.account_type == "Press" && userInfo.user_is_admin == '0') {
    form_button.setAttribute('href', '/en/press');
  } else if (userInfo.user_is_admin == "0" && (userInfo.company_admin != "1" || userInfo.basic_admin != '1')) {
    if (window.location.pathname == '/en/users-table' || window.location.pathname == '/en/companies-table') {
      location.replace('/en/account');
    }
    document.getElementById('admin_drop').style.display = 'none';
    document.getElementById('admin_drop_mob').style.display = 'none !important';
  } else {}
}
} else {
if (userInfo.account_type == "No company" && userInfo.user_is_admin == '0') {
  form_button.setAttribute('href', '/en/supplier');
} else if (userInfo.account_type == "Supplier" && userInfo.user_is_admin == '0') {
  form_button.setAttribute('href', '/en/supplier');
} else if (userInfo.account_type == "RSW" && userInfo.user_is_admin == '0') {
  form_button.setAttribute('href', '/en/supplier');
} else if (userInfo.account_type == "Press" && userInfo.user_is_admin == '0') {
  form_button.setAttribute('href', '/en/press');
} else if (userInfo.user_is_admin == "0" && (userInfo.company_admin != "1" || userInfo.basic_admin != '1')) {
  if (window.location.pathname == '/en/users-table' || window.location.pathname == '/en/companies-table' && userInfo.company_admin != "1") {
    location.replace('/en/account');
  } else if (window.location.pathname == '/en/users-table' || window.location.pathname == '/en/companies-table' && userInfo.basic_admin != "1") {
    location.replace('/en/account');
  }
  document.getElementById('admin_drop').style.display = 'none';
  document.getElementById('admin_drop_mob').style.display = 'none';
} else if (userInfo.user_is_admin == "1" || userInfo.company_admin == "1" || userInfo.basic_admin == "1") {
  form_button.setAttribute('href', '/en/supplier');
  document.getElementById('admin_drop').style.display = 'block';
  document.getElementById('admin_drop_mob').style.display = 'block';
} else {}
}

if (window.location.pathname == '/de/press' || window.location.pathname == '/en/press') {
if (userInfo.press_has_form_submitted == "1") {
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

 export function showPrivateElements() {
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

 export function showPublicElements() {
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