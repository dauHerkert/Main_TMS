import { EVENTDATES, URLEMAILTEMPLATES } from './a_constants';
import {doc,getDoc,setDoc,updateDoc,addDoc,collection,getDocs,ref,getDownloadURL,uploadBytes,deleteObject,createUserWithEmailAndPassword,auth,storage,db, user} from './a_firebaseConfig';
import Cropper from 'cropperjs';
import toastr from 'toastr';
import { getUserInfo } from './ab_base';
import 'select2';
import 'select2/dist/css/select2.min.css';
//import flatpickr from "flatpickr";

//console.log('testing flatpickr')

// This is a list of the default values
// as well as of all the possible fields that a user doc can have
const userDefaultValues = {
  // Supplier fields
  supplier_start_date:'',
  supplier_end_date:'',
  supplier_special_request:'',
  supplier_access_zone:'',
  company_admin_petition:'',
  // Boolean: false | true
  supplier_has_form_submitted: false,

  // Press fields
  press_workspot:'',
  press_publisher:'',
  press_media_type:'',
  press_visit_dates:'',
  press_special_request:'',
  // Boolean: false | true
  press_has_uploaded_id: false,
  press_has_form_submitted: false,
  press_form_user: false,
  //Press form info
  press_media:'',
  press_media_type:'',
  user_itwa:'',
  press_workspot:'',
  press_issued_by:'',
  press_card_number:'',

  // User fields
  user_email:'',
  user_id:'',
  user_title:'',
  user_city:'',
  user_country:'',
  user_nationality:'',
  user_zones:'',
  // account_type: supplier | press | RSW
  account_type:'Supplier',
  //User profile
  user_type:'',
  // user_status: pending | ok
  user_status:'Pending',
  // Boolean: false | true
  confirmed_email: false,
  user_is_admin: false,
  company_admin: false,
  basic_admin: false,
  user_deleted: false,
};

/*========================================================================================================================================================
 * This asynchronous function retrieves user information and performs a database query to fetch company data. It checks if the user's company ID matches
 * any company in the database, and if so, it assigns the corresponding company type and company zones to variables. If no matching company is found,
 * default values are used.
=========================================================================================================================================================*/

async function getCompanyType(user) {
  let userInfo = await getUserInfo(user);
  console.log('userInfo:', userInfo);
  const companiesRef = collection(db, "companies");
  const companiesSnapshot = await getDocs(companiesRef);
  let companyProfile = 'No company';
  let companyZones = [];

  for (const company of companiesSnapshot.docs) {
    if (company.id === userInfo.user_company) {
      companyProfile = company.data().company_type;
      companyZones = company.data().company_zones || [];
      break;
    }
  }

  // Return the object with the default values for companyProfile and companyZones
  return { companyProfile, companyZones };
}

/*====================================================================================================================================================
  *  Sets default fields for a user during sign-up process. It retrieves user information such as first name, last name, user ID, and profile image.
  * The function updates the Firestore document with the user's default values and uploads the profile image to Firebase Storage. It also triggers the
  * * sending of a registration confirmation email to the user based on their language preference. Displays success messages for default value setting
  * * and email sending. Finally, redirects the user to the appropriate sign-up confirmation page based on language and account type.
=====================================================================================================================================================*/

const fileName = document.getElementById("fileName");
if (fileName) {
  fileName.style.display = 'none';
}

const uploading_image = document.getElementById('uploading_image');

function generateTempId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

async function setDefaultFields(user) {
  const userRef = doc(db, 'users', user.uid);
  // Use the `getCompanyType` function to get the company type and zones
  const { companyProfile, companyZones } = await getCompanyType(user);
  const userDoc = await getDoc(userRef);
  const user_firstname = document.getElementById('first-name');
  const user_lastname = document.getElementById('last-name');
  const userID = sessionStorage.getItem('userID');
  const tempImageId = sessionStorage.getItem("tempImageId");
  const profile_img = document.getElementById('profile_img');
  let fileItem = profile_img.files[0];
  // Use the companyProfile variable to set the user_type field
  userDefaultValues.user_email = user.email;
  userDefaultValues.user_id = user.uid;
  // Use the companyZones variable to set the user_zones field
  userDefaultValues.user_zones = companyZones;
  const admin_checkbox = jQuery('#admin_checkbox').val();
  var company_admin_petition;
  if ( $("#admin_checkbox").is( ":checked" ) ){
    company_admin_petition = admin_checkbox;
  } else {
    company_admin_petition = "No admin";
  }
  console.log("company admin:", company_admin_petition)
  
  userDefaultValues.company_admin_petition = company_admin_petition;


  let storedLang = localStorage.getItem("language");
  let urlLang = '/en';
  //Subject for Register email - EN
  let register_email_subject = 'Thanks for Applicating';
  let register_email_url = URLEMAILTEMPLATES.URLEMAILFOLDER + URLEMAILTEMPLATES.URLREGISTER_EN;
  
  if (storedLang && storedLang === 'de') {
    urlLang = '/de';
    //Subject for Register email - DE
    register_email_subject = 'Vielen Dank für Ihre Anmeldung';
    register_email_url = URLEMAILTEMPLATES.URLEMAILFOLDER + URLEMAILTEMPLATES.URLREGISTER_DE;
  }


  //Save the user info in case he wants to resend the email
  sessionStorage.setItem('user_firstname', user_firstname.value);
  sessionStorage.setItem('user_lastname', user_lastname.value);
  sessionStorage.setItem('user_email', user.email);
  sessionStorage.setItem('userID', user.uid);
  // Use the setDoc function to set the userDefaultValues object
  setDoc(userRef, userDefaultValues, { merge: true })
    .then(async () => {
    await userUploadImage(user, tempImageId, hiddenProfileInput, fileItem);
    const oldImagePath = `profiles/${tempImageId}`;
    const newImagePath = `profiles/${user.uid}`;

    // Download the old image
    const oldImageRef = ref(storage, oldImagePath);
    const oldImageUrl = await getDownloadURL(oldImageRef);

    // Upload the image with the new name
    const response = await fetch(oldImageUrl);
    const blob = await response.blob();
    const newImageRef = ref(storage, newImagePath);
    await uploadBytes(newImageRef, blob, { contentType: 'image/png' });

    // Delete the old image
    await deleteObject(oldImageRef);

    // Update the user's profile image path in Firestore
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, { profileImagePath: newImagePath });

    // Sign up
    (async () => {
      try {
        const stored_userID = `${userID}`;
        const html = await fetch(register_email_url)
              .then(response => response.text())
              .then(html => html.replace('${userID}', stored_userID));
        const docRef = addDoc(collection(db, "mail"), {
          to: `${user.email}`,
          message: {
            subject: register_email_subject,
            html: html,
          }
        });
      } catch (error) {
        console.error(error);
      }
    })();

    if (companyProfile == 'No company') {
      toastr.success('You are signing up with no company set');
    } else {
      toastr.success('Default values successfully set');
    }

    setTimeout(function(user) {
      window.location = urlLang + "/signup-form-submitted";
    }, 1000);
  })
  .catch((err) => {
      console.log('there was a problem updating the data', err);
      toastr.error('There was an error updating your info');
  });
};


// Sign Up
/*============================================================================================================================================================
  * Handles the sign-up process by creating a new user with the provided email, password, and profile image. It sets default fields for the user and collects
  * additional information.
=============================================================================================================================================================*/
function handleSignUp(e) {
  e.preventDefault();
  e.stopPropagation();
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  var confirm_password = document.getElementById("password-confirm").value;
  const profile_img = document.getElementById('profile_img');
  let storedLang = localStorage.getItem("language");

  if (profile_img.files.length === 0) {
    toastr.error('Please upload your profile picture')
  } else {
    if (password == confirm_password) {
      createUserWithEmailAndPassword(auth, email, password)
        .then(userCredential => {
          // Signed in
          const user = userCredential.user;
          sessionStorage.setItem('userID', user.uid);
          setDefaultFields(user);
          userExtraInfo(e, user);
          toastr.success('user successfully created: ' + user.email);
        })
        .catch((error) => {
          const errorMessage = error.message;
          if (storedLang && storedLang === 'de') {
            toastr.error('Die email wurde bereits benutzt. Bitte wählen Sie eine andere email.');
          } else {
            toastr.error('The email has already been used. Please choose another email.');
          }
        });
    } else {
      toastr.error('Password confirmation does not match');
    }
  }
};

/*=============================================================================================================================================================
 * The code handles the user's selection of a company. If the "company" parameter is present in the URL, it sets the value of the user_company field and hides
 *  the company_select_cont element. If the "company" parameter is not present, it displays the available company options and captures the user's selection
 *  in the newUserCompaniesString variable.
==============================================================================================================================================================*/

const select_company = document.getElementById('user_company');
const currentUrl = new URL(window.location.href);
const company_select_cont = document.getElementById('company_select_cont');
const company_colRef = collection(db, 'companies');

if (select_company) {
  if (currentUrl.searchParams.has('company')) {
    // Use the user_company value when the URL has the ?company parameter
    const companyName = currentUrl.searchParams.get('company');
    user_company.value = companyName;
    // Hide the select_company element
    document.getElementById('company_select_cont').style.display = 'none';
  } else {
    //Print companies select
    getDocs(company_colRef)
      .then((snapshot) => {
        const companies = snapshot.docs.map((doc) => doc.data());
        const sortedCompanies = companies.sort((a, b) => a.company_name.localeCompare(b.company_name));

        sortedCompanies.forEach((company) => {
          var opt = document.createElement('option');
          opt.value = company.company_id;
          opt.textContent = company.company_name;
          select_company.appendChild(opt);
        });
      })
      .catch((err) => {
        console.log('error fetching companies', err);
      });

    // Use the select_company value when the URL doesn't have the ?company parameter
    select_company.value = select_company.value;
    let newUserCompaniesString = '';
    // Show the select_company element
    document.getElementById('company_select_cont').style.display = 'block';
    $('#user_company').on('change', function () {
      var selectedNewUserCompanies = $(this).val();
      newUserCompaniesString = selectedNewUserCompanies.join(', ');
    });
  }
}

// Add user's extra info to Firestore
/*================================================================================================================================================================
 * The function userExtraInfo captures the user's extra information, such as first name, last name, address, company, language, start date, end date, and special
 *  requests. It then updates the corresponding fields in Firestore for the user.
================================================================================================================================================================*/

function userExtraInfo(e, user) {
  e.preventDefault();
  e.stopPropagation();
  const userRef = doc(db, 'users', user.uid);
  const user_firstname = document.getElementById('first-name');
  const user_lastname = document.getElementById('last-name');
  let user_fullname = '';
  const user_address = document.getElementById('user_address');
  const user_company = document.getElementById('sign-up-company');
  let language = localStorage.getItem("language");
  const start_date = document.getElementById('Select-dates');
  const end_date = document.getElementById('Select-dates-2');
  const special_requests = document.getElementById('special_requests');

  if (user_firstname.value && user_lastname.value) {
    user_fullname = (user_firstname.value + user_lastname.value).toLowerCase().replace(/\s/g, '');
  }
  const userCompanyValue = currentUrl.searchParams.has('company') ? currentUrl.searchParams.get('company') : select_company.value;

  setDoc(userRef, {
    user_firstname: user_firstname.value,
    user_lastname: user_lastname.value,
    user_fullname: user_fullname,
    user_company: userCompanyValue,
    last_signin_date: new Date(),
    supplier_start_date: start_date.value,
    supplier_end_date: end_date.value,
    supplier_special_request: special_requests.value,
    language: language,
  }, { merge: true })
  .then(() => {
    // console.log('press data successfully updated');
  })
  .catch((err) => {
    console.log('there was a problem updating the data', err);
    toastr.error('There was an error updating your info');
  });
}

//Upload user's profile image

/*=========================================================================================================================================================
 * The code provided handles the uploading of a user's profile image. When the profile_img element changes, it checks if the selected file is an image and
 *  initializes a cropper instance for image cropping. The cropped image data is then stored in a hidden input field. The userUploadImage function is
 *  responsible for uploading the image to Firebase Storage. It converts the data URL to a blob and uploads it to the specified storage path. The function
 *  also handles different cases for mobile and desktop devices.
==========================================================================================================================================================*/

const profile_img = document.getElementById('profile_img');
const hiddenProfileInput = document.getElementById('hidden_profile_img');
var modal4 = document.getElementById("cropper_modal");

let profile_cropper;

if (profile_img) {
  profile_img.addEventListener("change", function handleProfilePic(e) {
    e.preventDefault();
    e.stopPropagation();

    let fileItem = profile_img.files[0];

    if (profile_img.files.length === 0) {
      toastr.error('Please upload your profile picture');
    } else {
      // Check if the file is an image
      if (/^image\/\w+/.test(fileItem.type)) {
        // Destroy the current cropper instance if it exists
        if (profile_cropper) {
          profile_cropper.destroy();
        }
        // Open the modal
        modal4.style.display = "block";
        // Initialize the cropper
        const image = document.getElementById('profile_image_cropper');
        image.src = URL.createObjectURL(fileItem);
        profile_cropper = new Cropper(image, {
          aspectRatio: 3 / 4,
          width: 200,
          height: 200,
          viewMode: 1,
          autoCropArea: 0.7,
          responsive: true,
          crop(event) {
            // Get the cropped canvas data as a data URL
            const canvas = profile_cropper.getCroppedCanvas();
            const dataURL = canvas.toDataURL();

            // Set the data URL as the value of the hidden input field
            hiddenProfileInput.value = dataURL;
          },
        });

        const isMobile = window.innerWidth <= 800;
        if (isMobile) {
        const saveButton = document.getElementById("close_button");
          if (saveButton) {
            saveButton.click();
          }
        }
      } else {
        toastr.error('Please choose an image file.');
        profile_img.value = null;
        if (profile_cropper) {
          profile_cropper.destroy();
        }
      }
    }
  });
}

async function userUploadImage(user, imageId, hiddenProfileInput, fileItem) {

  // Check if it's a mobile device by screen width
  const isMobile = window.innerWidth <= 800;

  if (isMobile) {
    // For mobile, use the original file
    let fileToUpload = fileItem;
    const metadata = {
      contentType: 'image/png',
    };
    const storageRef = ref(storage, 'profiles/' + imageId);
    return uploadBytes(storageRef, fileToUpload, metadata)
      .then((snapshot) => {
        toastr.success('You have updated the profile picture successfully');
        signup_button.disabled = false;
        signup_button.style.backgroundColor = '#2b2b2b';
        uploading_image.style.display = 'none';
        fileName.style.display = 'block';
        return `profiles/${imageId}`;
      })
      .catch((err) => {
        console.log('error uploading file', err);
        toastr.error('There was an error uploading the file');
      });
  } else {
    // For desktop, continue with original code
    const dataURL = hiddenProfileInput.value;
    if (!dataURL) {
      toastr.error('There was an error processing the profile picture');
      return;
    }
    // Convert data URL to blob
    return fetch(dataURL)
      .then((res) => res.blob())
      .then((blob) => {
        let fileToUpload;
        if (!blob) {
          console.log('using raw file instead');
          fileToUpload = fileItem;
        } else {
          fileToUpload = blob;
          console.log('Using blob to upload');
        }

        const metadata = {
          contentType: 'image/png',
        };
        const storageRef = ref(storage, 'profiles/' + imageId);
        return uploadBytes(storageRef, fileToUpload, metadata)
          .then((snapshot) => {
            toastr.success('You have updated the profile picture successfully');
            signup_button.disabled = false;
            signup_button.style.backgroundColor = '#2b2b2b';
            uploading_image.style.display = 'none';
            fileName.style.display = 'block';
            return `profiles/${imageId}`;
          })
          .catch((err) => {
            console.log('error uploading file', err);
            toastr.error('There was an error uploading the file');
          });
      })
      .catch((err) => {
        console.log('error converting dataURL to blob', err);
        toastr.error('There was an error processing the profile picture');
      });
  }
}

/*============================================================================================================================================================
 * This code adds an event listener to the "close_button" element. When the button is clicked, it generates a temporary ID using the generateTempId function.
 *  It then displays the "uploading_image" element, sets the temporary ID in the session storage, retrieves the file item from the "profile_img" element,
 *  and calls the userUploadImage function to upload the image with the temporary ID.
============================================================================================================================================================*/

const saveButton = document.getElementById("close_button");
if (saveButton) {
  saveButton.addEventListener("click", async function () {
    const tempId = generateTempId();
    uploading_image.style.display = 'block';
    sessionStorage.setItem("tempImageId", tempId);
    const hiddenProfileInput = document.getElementById('hidden_profile_img');
    let fileItem = profile_img.files[0];
    console.log(fileItem);
    await userUploadImage(null, tempId, hiddenProfileInput, fileItem);
  });
}

/*========================================================================================================================================================
 *This asynchronous function initializes a start date picker and an end date picker. It sets the minimum and maximum selectable dates, language
 settings, and other configuration options. The end date picker is dependent on the selected start date, and it is initialized separately through the
 initializeEndDatePicker function.
==========================================================================================================================================================*/

/*let datepickerLocaleToUse = (storedLang === 'de') ? localeDe : localeEn;

new AirDatepicker('#Select-dates', {
  selectedDates: [new Date()],
  locale: datepickerLocaleToUse
})*/

async function getDateSignUp() {
  var today = new Date();
  var minDate = new Date(today.getFullYear(), EVENTDATES.MINDATE_MONTH, EVENTDATES.MINDATE_DAY);
  var maxDate = new Date(today.getFullYear(), EVENTDATES.MAXDATE_MONTH, EVENTDATES.MAXDATE_DAY);
  var minDateEndPicker = new Date(today.getFullYear(), EVENTDATES.MINDATE_MONTH, EVENTDATES.MINDATE_DAY);
  var startDatePicker = document.querySelector('#Select-dates');
  let endDatePicker = document.querySelector('#Select-dates-2');

  let multiDates = false;

  //flatpickr("#Select-dates", {});

  /*new AirDatepicker(startDatePicker, {
    multipleDates: multiDates,
    multipleDatesSeparator: ', ',
    dateFormat: 'mm-dd-yyyy',
    minDate: minDate,
    maxDate: maxDate,
    language: datepickerLocaleToUse,
    onHide: function(inst) {
      var selectedDates = inst.selectedDates;
      console.log(selectedDates);
      if (selectedDates.length > 0) {
        var selectedDate = startDatePicker.value;
        var parsedDate = new Date(selectedDates[0]);
        minDateEndPicker = parsedDate;
        endDatePicker.value = '';
        initializeEndDatePicker();
      }
    },
    onSelect: function(formattedDate, date, inst) {
      inst.hide();
    }
  });*/

  /*function initializeEndDatePicker() {
    new AirDatepicker(endDatePicker, {
      multipleDates: multiDates,
      multipleDatesSeparator: ', ',
      dateFormat: 'mm-dd-yyyy',
      minDate: minDateEndPicker,
      maxDate: maxDate,
      language: datepickerLocaleToUse,
      onHide: function(inst) {
        var selectedDates = inst.selectedDates;
        console.log(selectedDates);
      },
      onSelect: function(formattedDate, date, inst) {
        inst.hide();
      }
    });
  }

  initializeEndDatePicker();

  if (window.innerWidth < 768) {
    startDatePicker.setAttribute('readonly', 'readonly');
    endDatePicker.setAttribute('readonly', 'readonly');
  }*/
}

/*================================================================================================================================================================
 * This function is called on the home page. It identifies the sign-up form (wf-form-signup-form) and assigns an event listener to it. The event listener listens
 * for the form's submission and calls the handleSignUp function.
=================================================================================================================================================================*/

export function signUpPage() {
  //identify auth action forms
  let signUpForm = document.getElementById('wf-form-signup-form');
  //assign event listeners
  if ( typeof(signUpForm) !== null ) {
    signUpForm.addEventListener('submit', handleSignUp, true);
  }
  getDateSignUp()
}