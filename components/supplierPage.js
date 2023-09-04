import { doc, setDoc, addDoc, collection, getDownloadURL, ref, user, storage } from './a_firebaseConfig';
import { getUserInfo, createOptions, changeCompanyNameToID } from './ab_base';
import toastr from 'toastr'; 

// ---- SUPPLIER FORM EMAILS ----

    //Supplier form submited - DE
    const supplier_de_form_confirmation_subject = 'Vielen Dank für Ihre Anmeldung';
    const supplier_de_form_confirmation_url = 'https://raw.githubusercontent.com/dauHerkert/bho/main/mails_templates/supplier_de_form_confirmation.html';
    //Supplier form submited - EN
    const supplier_en_form_confirmation_subject = 'Thanks for Applicating';
    const supplier_en_form_confirmation_url = 'https://raw.githubusercontent.com/dauHerkert/bho/main/mails_templates/supplier_en_form_confirmation.html';

    //Supplier form changes notification - EN
    const supplier_en_form_changes_subject = 'Supplier Form Changes';
    const supplier_en_form_changes_url = 'https://raw.githubusercontent.com/dauHerkert/bho/main/mails_templates/supplier_en_form_changes.html';
    //Supplier form changes notification - DE
    const supplier_de_form_changes_subject = 'Änderungen im Lieferantenformular';
    const supplier_de_form_changes_url = 'https://raw.githubusercontent.com/dauHerkert/bho/main/mails_templates/supplier_de_form_changes.html';

/*=======================================================================================================================================================
 * This asynchronous function initializes start and end date pickers on a webpage. It sets the minimum and maximum selectable dates, language settings,
 * and other configuration options based on the user's account type and the current URL path.
========================================================================================================================================================*/

async function getMinDate(user) {
  var today = new Date();
  var minDate;
  var maxDate = new Date(today.getFullYear(), 6, 1);
  var startDatePicker = $('[data-date-picker="datepicker-start"]');
  let endDatePicker = $('[data-date-picker="datepicker-end"]')
  let userInfo = await getUserInfo(user);

  //Change minDate depending the user type
  if(userInfo.account_type == 'Press'){
        minDate = new Date(today.getFullYear(), 5, 22);
      }else{
        minDate =  new Date(today.getFullYear(), 5, 22);
      }

  // Copied from https://www.npmjs.com/package/air-datepicker?activeTab=explore
  // and from http://t1m0n.name/air-datepicker/docs/
  $.fn.datepicker.language['de'] = {
    days: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
    daysShort: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
    daysMin: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
    months: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
    monthsShort: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
    today: 'Heute',
    clear: 'Zurücksetzen',
    dateFormat: 'dd.MM.yyyy',
    timeFormat: 'HH:mm',
    firstDay: 1
  };

  $.fn.datepicker.language['en'] = {
    days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    daysMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
    months: ['January','February','March','April','May','June', 'July','August','September','October','November','December'],
    monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    today: 'Today',
    clear: 'Clear',
    dateFormat: 'mm/dd/yyyy',
    timeFormat: 'hh:ii aa',
    firstDay: 0,
};

  let datepickerLocaleToUse = 'en';
  if ( storedLang == 'de' ) {
    datepickerLocaleToUse = 'de';
  }

  let multiDates = true
  if(window.location.pathname == "/en/supplier" || window.location.pathname == "/de/supplier"){
    multiDates = false
  }

  startDatePicker.datepicker({
    multipleDates: multiDates,
    multipleDatesSeparator: ', ',
    dateFormat: 'mm-dd-yyyy',
    minDate: minDate,
    maxDate: maxDate,
    language: datepickerLocaleToUse,
    onHide: function(inst, animationCompleted) {
      var selectedDates = inst.selectedDates;
      console.log(selectedDates);
    },
    onSelect: function(formattedDate, date, inst) {
      inst.hide();
    }
  });
  endDatePicker.datepicker({
    multipleDates: multiDates,
    multipleDatesSeparator: ', ',
    dateFormat: 'mm-dd-yyyy',
    minDate: minDate,
    maxDate: maxDate,
    language: datepickerLocaleToUse,
    onHide: function(inst, animationCompleted) {
      var selectedDates = inst.selectedDates;
      console.log(selectedDates);
    },
    onSelect: function(formattedDate, date, inst) {
      inst.hide();
    }
  });

  if (window.innerWidth < 768) {
    $('[data-date-picker]').attr('readonly', 'readonly');
  }
};

    /*===========================================================================================================================================================
 * The code defines functions related to adding supplier information. It updates the supplier's start date, end date, special request, user zones, and form
 * submission status. It also triggers email notifications based on the language selected and reloads the page after a successful form submission.
===========================================================================================================================================================*/

function updateSelectedCompanyZonesString(supplierUserZones) {
    const selectedOptions = Array.from(supplierUserZones.selectedOptions).map(option => option.value);
    return selectedOptions.join(',');
  }

  async function addSupplierInfo(e, user) {
    e.preventDefault();
    e.stopPropagation();
    const storedLang = localStorage.getItem("language");
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getUserInfo(user);
    const start_date = document.getElementById('Select-dates');
    const end_date = document.getElementById('Select-dates-2');
    const special_request = document.getElementById('Special-request-2');
    const supplierUserZones = document.getElementById('supplierUserZones');
    supplierUserZones.addEventListener('change', () => {
      const selectedSupplierZonesString = updateSelectedCompanyZonesString(supplierUserZones);
    });
    const selectedSupplierZonesString = updateSelectedCompanyZonesString(supplierUserZones);

    setDoc(userRef, {
      supplier_start_date: start_date.value,
      supplier_end_date: end_date.value,
      supplier_special_request: special_request.value,
      supplier_has_form_submitted: "1",
      user_zones: selectedSupplierZonesString

    }, { merge: true })
    .then(() => {
      toastr.success('You have submitted the form successfully');
      if(storedLang == 'de'){
      //Supplier form submited - DE
      (async () => {
      try {
        const fullName = `${userDoc.user_firstname} ${userDoc.user_lastname}`;
        const html = await fetch(supplier_de_form_confirmation_url)
              .then(response => response.text())
              .then(html => html.replace('${userDoc.user_firstname} ${userDoc.user_lastname}', fullName));
        const docRef = addDoc(collection(db, "mail"), {
          to: `${userDoc.user_email}`,
          message: {
            subject: supplier_de_form_confirmation_subject,
            html: html,
          }
        });
      } catch (error) {
        console.error(error);
      }
    })();
    }else{
      // Supplier form submited - EN
      (async () => {
      try {
        const fullName = `${userDoc.user_firstname} ${userDoc.user_lastname}`;
        const html = await fetch(supplier_en_form_confirmation_url)
              .then(response => response.text())
              .then(html => html.replace('${userDoc.user_firstname} ${userDoc.user_lastname}', fullName));
        const docRef = addDoc(collection(db, "mail"), {
          to: `${userDoc.user_email}`,
          message: {
            subject: supplier_en_form_confirmation_subject,
            html: html,
          }
        });
      } catch (error) {
        console.error(error);
      }
    })();
    }
      setTimeout(reloadPage, 3000);
    })
    .catch((err) => {
      console.log('error updating supplier info', err);
      toastr.error('There was an error updating your info');
    });
  }
  function reloadPage(){
      window.location.reload();
  }

/*===============================================================================================================================================================
* The code fetches and displays the user's profile information and company name. It handles form submission, updates the user's last sign-in date, and creates
* options for the zones select. It also includes a function to display the user's profile picture and processes the user's additional information.
================================================================================================================================================================*/

 export async function pageSupplier(user) {
    let userInfo = await getUserInfo(user);
    const userRef = doc(db, 'users', user.uid);
    const companyNames = await changeCompanyNameToID(userInfo);
      userInfo.user_company_name = companyNames;
    // Show displayName
    if(storedLang == 'de'){
      document.getElementById("supplier_user").innerHTML = `Willkommen ${userInfo.user_firstname} ${userInfo.user_lastname}`;
    }else{
      document.getElementById("supplier_user").innerHTML = `Hello ${userInfo.user_firstname} ${userInfo.user_lastname}`;
    }

    if(userInfo.user_company_name == undefined){
      document.getElementById("company_name").innerHTML = 'No company';
    }else{
      const companies = userInfo.user_company_name.split(",");
      const firstCompany = companies[0];
      document.getElementById("company_name").innerHTML = `${firstCompany}`;
    }
    showProfilePic(user);
    getMinDate(user);

    const supplier_form = document.getElementById('supplier_form');
    supplier_form.addEventListener('submit', function(ev) {
      ev.preventDefault();
      addSupplierInfo(ev, user);
    });

   setDoc(userRef, {
    last_signin_date: new Date()
   }, { merge: true })
   .then(() => {
      console.log('Supplier data successfully updated');
   })
   .catch((err) => {
      console.log('there was a problem signin user', err);
      toastr.error('There was an error signin user');
   })

   //Print zones select
    const supplier_user_zone = document.getElementById('supplierUserZones');
    createOptions(supplier_user_zone);

    let update_picture_modal = document.getElementById("picture_form_modal");
    if ( update_picture_modal !== null ) {
      update_picture_modal.addEventListener('submit', function(ev) {
        updateProfilePic(ev, user);
      }, true);
    }
    processUserInfo()
   }
       //Display profile picture
  function showUserPic(user){
    getDownloadURL(ref(storage, 'profiles/' + user.uid))
      .then((url) => {
        const img = document.getElementById('user_profile_pic');
        img.setAttribute('src', url);
      })
      .catch((error) => {
        // Handle any errors
      });
  }

/*================================================================================================================================================================
* The code listens for the form submission event. It sends an email notification to the admin based on the form language. After fetching the email template and
* replacing placeholders, it adds the email details to the database. A success message is displayed, and the modal is hidden after a delay.
==================================================================================================================================================================*/

  // Notify admin to make changes on the supplier form
  let supplier_notify_form = document.getElementById('notify_supplier_form');
  let supplier_email = document.getElementById('supplier_notifier_email');
  let supplier_text = document.getElementById('supplier_notifier_text');

  if(supplier_notify_form){
    supplier_notify_form.addEventListener('submit', function (e, user){
    e.preventDefault();
    e.stopPropagation();

    if (storedLang == 'en'){
      // Admin notification - EN
      (async () => {
      try {
        const supplierEmail = `${supplier_email.value}`;
        const supplierText = `${supplier_text.value}`;
        const html = await fetch(supplier_en_form_confirmation_url)
              .then(response => response.text())
              .then(html => html.replace('${supplier_email.value}', supplierEmail))
              .then(html => html.replace('${supplier_text.value}', supplierText));
          const docRef = addDoc(collection(db, "mail"), {
            to: 'andreas.salvermoser@ops.dauherkert.com',
            message: {
              subject: supplier_en_form_changes_subject,
              html: html,
            }
          });
        } catch (e) {
          console.error("Error adding document: ", e);
        }
        toastr.success('Email has been sent!');
        setTimeout(function() {
          document.getElementById('supplier_notify_modal').style.display = 'none';
          $('body').removeClass('modal-open');
              }, 500);
        })();
    }else{
      // Admin notification DE
      (async () => {
      try {
        const supplierEmail = `${supplier_email.value}`;
        const supplierText = `${supplier_text.value}`;
        const html = await fetch(supplier_de_form_confirmation_url)
              .then(response => response.text())
              .then(html => html.replace('${supplier_email.value}', supplierEmail))
              .then(html => html.replace('${supplier_text.value}', supplierText));
          const docRef = addDoc(collection(db, "mail"), {
            to: 'andreas.salvermoser@ops.dauherkert.com',
            message: {
              subject: supplier_de_form_changes_subject,
              html: html,
            }
          });
        } catch (e) {
          console.error("Error adding document: ", e);
        }
        toastr.success('Email has been sent!');
        setTimeout(function() {
          document.getElementById('supplier_notify_modal').style.display = 'none';
          $('body').removeClass('modal-open');
              }, 500);
        })();
    }
  })
}

/*==============================================================================================================================================================
* This function, which processes user information and manipulates the user interface on a supplier page. If the user has already submitted the supplier form
* (supplier_has_form_submitted equals "1"), certain elements are disabled and displayed accordingly. The function retrieves the supplier start date, end date,
* special request, and zones from the user information and updates the corresponding form fields and select options.
===============================================================================================================================================================*/
async function processUserInfo() {
const user = auth.currentUser;
let userInfo = await getUserInfo(user);
if (window.location.pathname == '/de/supplier' || window.location.pathname == '/en/supplier') {
  if (userInfo.supplier_has_form_submitted == "1") {
    document.getElementById("Select-dates").setAttribute('disabled', "");
    document.getElementById("Select-dates-2").setAttribute('disabled', "");
    document.getElementById("supplierUserZones").setAttribute('disabled', "");
    document.getElementById("Special-request-2").setAttribute('disabled', "");
    document.getElementById("supplier_submmited_form").style.display = 'flex';
    document.getElementById('supplier_submit_btn').style.display = 'none';

    let supplier_start_date = userInfo.supplier_start_date;
    let supplier_end_date = userInfo.supplier_end_date;
    let supplier_special_request = userInfo.supplier_special_request;
    let supplierZones = userInfo.user_zones;
    if (supplier_start_date) {
      $('#supplier_form').find('#Select-dates').val(supplier_start_date);
    }
    if (supplier_end_date) {
      $('#supplier_form').find('#Select-dates-2').val(supplier_end_date);
    }
    if (supplier_special_request) {
      $('#supplier_form').find('#Special-request-2').val(supplier_special_request);
    }
    if (supplierZones) {
$('#supplier_form').find('#supplier_zones_array').html(supplierZones);
let zoneCell = document.getElementById('supplier_zones_array');
let userZonesArray = zoneCell.textContent ? zoneCell.textContent.split(',') : [];

// Clear the previously selected options
$('#supplierUserZones').val(null).trigger('change');

// Create an array of option values to be selected
let selectedOptions = userZonesArray.map(zone => zone.trim());

// Select the options in the supplierUserZones select2 element
$('#supplierUserZones').val(selectedOptions).trigger('change');
}
  }
}
}