
    import { initializeApp } from "firebase/app";
    import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile, updateEmail, updatePassword, sendPasswordResetEmail, deleteUser, reauthenticateWithCredential } from "firebase/auth";
    import { getFirestore, collection, addDoc, setDoc, updateDoc, getDoc, doc, query, where, getDocs, deleteDoc, writeBatch } from 'firebase/firestore';
    import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

    // Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAMoVGExyvb89NEa-M3EMl647-_rUN4XP4",
  authDomain: "bho-copy.firebaseapp.com",
  projectId: "bho-copy",
  storageBucket: "bho-copy.appspot.com",
  messagingSenderId: "792136477405",
  appId: "1:792136477405:web:001c2802b72baa4321c934"
};

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    const storage = getStorage(app);
    const user = auth.currentUser;
    let currentLang = 'en';

    // This is a list of the default values
    // as well as of all the possible fields that a user doc can have
    const userDefaultValues = {
      // Supplier fields
      supplier_start_date:'',
      supplier_end_date:'',
      supplier_special_request:'',
      supplier_access_zone:'',
      company_admin_petition:'',
      // supplier_has_form_submitted: 0 | 1
      supplier_has_form_submitted:'0',

      // Press fields
      press_workspot:'',
      press_publisher:'',
      press_media_type:'',
      press_visit_dates:'',
      press_special_request:'',
      // press_has_uploaded_id: 0 | 1
      press_has_uploaded_id:'0',
      // press_has_form_submitted: 0 | 1
      press_has_form_submitted:'0',
      //Press form info
      press_media:'',
      press_media_type:'',
      user_itwa:'',
      press_workspot:'',
      press_form_user:'0',
      press_issued_by:'',
      press_card_number:'',

      // User fields
      user_email:'',
      user_id:'',
      user_title:'',
      user_city:'',
      user_country:'',
      user_nationality:'',
      // user_is_admin: 0 | 1
      user_is_admin:'0',
      company_admin:'0',
      basic_admin:'0',
      user_zones:'',
      user_deleted: '0',
      // account_type: supplier | press | RSW
      account_type:'Supplier',
      //User profile
      user_type:'',
      // user_status: pending | ok
      user_status:'Pending',
      // confirmed_email: 0 | 1
      confirmed_email:'0',
    };

    /*
    * -----------------------------------------------------------------------------------------------------------
    * EMAILS TEMPLATES AND SUBJECTS
    * -----------------------------------------------------------------------------------------------------------
    */

    // ---- SIGN UP REGISTER EMAIL ----

    //Subject for Register email - DE
    const register_de_email_subject = 'Vielen Dank für Ihre Anmeldung';
    const register_de_email_url = 'https://raw.githubusercontent.com/dauHerkert/bho/main/mails_templates/register_de_email.html';

     //Subject for Register email - EN
     const register_en_email_subject = 'Thanks for Applicating';
     const register_en_email_url = 'https://raw.githubusercontent.com/dauHerkert/bho/main/mails_templates/register_en_email.html';

    // ---- PRESS FORM EMAILS ----

    //Subject for press - DE - application received
    const press_de_application_received_subject = 'Antrag Eingegangen';
    //URLs for press - DE - Mr - application received
    const form_de_mr_confirmation_email_to_admin_url = 'https://raw.githubusercontent.com/dauHerkert/bho/main/mails_templates/form_de_mr_confirmation_email_to_admin.html';
    const press_de_mr_application_received_url = 'https://raw.githubusercontent.com/dauHerkert/bho/main/mails_templates/press_de_mr_application_received.html';
    //URLs for press - DE - Ms - application received
    const form_de_ms_confirmation_email_to_admin_url = 'https://raw.githubusercontent.com/dauHerkert/bho/main/mails_templates/form_de_ms_confirmation_email_to_admin.html';
    const press_de_ms_application_received_url = 'https://raw.githubusercontent.com/dauHerkert/bho/main/mails_templates/press_de_ms_application_received.html';
    //URLs for press - DE - Diverse - application received
    const form_de_diverse_confirmation_email_to_admin_url = 'https://raw.githubusercontent.com/dauHerkert/bho/main/mails_templates/form_de_diverse_confirmation_email_to_admin.html';
    const press_de_diverse_application_received_url = 'https://raw.githubusercontent.com/dauHerkert/bho/main/mails_templates/press_de_diverse_application_received.html';

    //Subject for press - EN - application received
    const press_en_application_received_subject_admin = 'New Press Form Submited';
    const press_en_application_received_subject = 'Application recieved'
    //URLs for press - EN - Mr - Ms - application received
    const form_en_mr_ms_confirmation_form_to_admin_url = 'https://raw.githubusercontent.com/dauHerkert/bho/main/mails_templates/form_en_mr_ms_confirmation_form_to_admin.html';
    const press_en_mr_ms_application_received_url = 'https://raw.githubusercontent.com/dauHerkert/bho/main/mails_templates/press_en_mr_ms_application_received.html';
    //URLs for press - EN - Diverse - application received
    const form_en_diverse_application_received_url = 'https://raw.githubusercontent.com/dauHerkert/bho/main/mails_templates/form_en_diverse_confirmation_form_to_admin.html';
    const press_en_diverse_application_received_url = 'https://raw.githubusercontent.com/dauHerkert/bho/main/mails_templates/press_en_diverse_application_received.html';

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

    // ---- USERS TABLE EMAILS ----

    // Application rejected - Subjects
    const press_en_application_rejected_subject = 'Accreditation Rejection';
    const press_de_application_rejected_subject = 'Akkreditierungsabsage';
    // Press - EN - Mr - Application rejected
    const press_en_mr_application_rejected_url = 'https://raw.githubusercontent.com/dauHerkert/bho/main/mails_templates/press_en_mr_application_rejected.html';
    // Press - DE - Mr - Application rejected
    const press_de_mr_application_rejected_url = 'https://raw.githubusercontent.com/dauHerkert/bho/main/mails_templates/press_de_mr_application_rejected.html';
    // Press - EN - Ms - Application rejected
    const press_en_ms_application_rejected_url = 'https://raw.githubusercontent.com/dauHerkert/bho/main/mails_templates/press_en_ms_application_rejected.html';
    // Press - DE - Ms - Application rejected
    const press_de_ms_application_rejected_url = 'https://raw.githubusercontent.com/dauHerkert/bho/main/mails_templates/press_de_ms_application_rejected.html';
     // Press - EN - Diverse - Application rejected
    const press_en_diverse_application_rejected_url = 'https://raw.githubusercontent.com/dauHerkert/bho/main/mails_templates/press_en_diverse_application_rejected.html';
    // Press - DE - Diverse - Application rejected
    const press_de_diverse_application_rejected_url = 'https://raw.githubusercontent.com/dauHerkert/bho/main/mails_templates/press_de_diverse_application_rejected.html';
    // Supplier - EN - Application rejected
    const supplier_en_application_rejected_url = 'https://raw.githubusercontent.com/dauHerkert/bho/main/mails_templates/supplier_en_application_rejected.html';
    // Supplier - DE - Application rejected
    const supplier_de_application_rejected_url = 'https://raw.githubusercontent.com/dauHerkert/bho/main/mails_templates/supplier_de_application_rejected.html';

    // Application accepted - Subjects
    const press_en_application_accepted_subject = 'Accreditation Confirmation';
    const press_de_application_accepted_subject = 'Akkreditierungsbestätigung';
    // Press - EN - Mr - Application accepted
    const press_en_mr_application_accepted_url = 'https://raw.githubusercontent.com/dauHerkert/bho/main/mails_templates/press_en_mr_application_accepted.html';
    // Press - DE - Mr - Application accepted
    const press_de_mr_application_accepted_url = 'https://raw.githubusercontent.com/dauHerkert/bho/main/mails_templates/press_de_mr_application_accepted.html';
    // Press - EN - Ms - Application accepted
    const press_en_ms_application_accepted_url = 'https://raw.githubusercontent.com/dauHerkert/bho/main/mails_templates/press_en_ms_application_accepted.html';
    // Press - DE - Ms - Application accepted
    const press_de_ms_application_accepted_url = 'https://raw.githubusercontent.com/dauHerkert/bho/main/mails_templates/press_de_ms_application_accepted.html';
    // Press - EN - Diverse - Application accepted
    const press_en_diverse_application_accepted_url = 'https://raw.githubusercontent.com/dauHerkert/bho/main/mails_templates/press_en_diverse_application_accepted.html';
    // Press - DE - Diverse - Application accepted
    const press_de_diverse_application_accepted_url = 'https://raw.githubusercontent.com/dauHerkert/bho/main/mails_templates/press_de_diverse_application_accepted.html';
    // Supplier - EN - Application accepted
    const supplier_en_application_accepted_url = 'https://raw.githubusercontent.com/dauHerkert/bho/main/mails_templates/supplier_en_application_accepted.html';
    // Supplier - DE - Application accepted
    const supplier_de_application_accepted_url = 'https://raw.githubusercontent.com/dauHerkert/bho/main/mails_templates/supplier_de_application_accepted.html';

    // ---- REGISTRATION LINK EMAILS ----

    //Registration link email - DE
    const registration_link_de_email_subject = 'Akkreditierung Bad Homburg Open';
    const registration_link_de_email_url = 'https://raw.githubusercontent.com/dauHerkert/bho/main/mails_templates/registration_link_de_email.html';
    //Registration link email - EN
    const registration_link_en_email_subject = 'Accreditation Bad Homburg Open';
    const registration_link_en_email_url = 'https://raw.githubusercontent.com/dauHerkert/bho/main/mails_templates/registration_link_en_email.html';

    /*
    * -----------------------------------------------------------------------------------------------------------
    * Auth functions
    * -----------------------------------------------------------------------------------------------------------
    */

    /*====================================================================================================================================================
     *  Sets default fields for a user during sign-up process. It retrieves user information such as first name, last name, user ID, and profile image.
     * The function updates the Firestore document with the user's default values and uploads the profile image to Firebase Storage. It also triggers the
     * * sending of a registration confirmation email to the user based on their language preference. Displays success messages for default value setting
     * * and email sending. Finally, redirects the user to the appropriate sign-up confirmation page based on language and account type.
    =====================================================================================================================================================*/

    const signup_button = document.getElementById('signup_button');
    if(signup_button){
      signup_button.disabled = true;
      signup_button.style.backgroundColor = '#EBEBE4';
    }
    const fileName = document.getElementById("fileName");
    if(fileName){
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
    let storedLang = localStorage.getItem("language");
    const admin_checkbox = jQuery('#admin_checkbox').val();
  var company_admin_petition;
  if ( $("#admin_checkbox").is( ":checked" ) ){
    company_admin_petition = admin_checkbox;
  }else{
    company_admin_petition = "No admin";
  }
  console.log("company admin:", company_admin_petition)

  userDefaultValues.company_admin_petition = company_admin_petition;

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

        // Sign up - DE
            if(storedLang == 'de'){
        (async () => {
        try {
          const fullName = `${user_firstname.value} ${user_lastname.value}`;
          const stored_userID = `${userID}`;
          const html = await fetch(register_de_email_url)
                .then(response => response.text())
                .then(html => html.replace('${userID}', stored_userID));
          const docRef = addDoc(collection(db, "mail"), {
            to: `${user.email}`,
            message: {
              subject: register_de_email_subject,
              html: html,
            }
          });
        } catch (error) {
          console.error(error);
        }
      })();
      }else{
        // Sign up - EN
        (async () => {
        try {
          const fullName = `${user_firstname.value} ${user_lastname.value}`;
          const stored_userID = `${userID}`;
          const html = await fetch(register_en_email_url)
                .then(response => response.text())
                .then(html => html.replace('${userID}', stored_userID));
          const docRef = addDoc(collection(db, "mail"), {
            to: `${user.email}`,
            message: {
              subject: register_en_email_subject,
              html: html,
            }
          });
        } catch (error) {
          console.error(error);
        }
      })();
      }
            if (companyProfile == 'No company'){
                toastr.success('You are signing up with no company set');
            } else {
                toastr.success('Default values successfully set');
            }
            setTimeout(function(user) {
                if (storedLang) {
                    if (storedLang == "de") {
                     if (userDefaultValues.account_type == 'Supplier' || userDefaultValues.account_type == 'No company' || userDefaultValues.account_type == 'RSW'){
                        window.location = "/de/signup-form-submitted";
                      } else {
                          window.location = "/de/signup-form-submitted";
                      }
                    } else {
                      if (userDefaultValues.account_type == 'Supplier' || userDefaultValues.account_type == 'No company' || userDefaultValues.account_type == 'RSW'){
                        window.location = "/en/signup-form-submitted";
                      } else{
                          window.location = "/en/signup-form-submitted";
                      }
                    }
                } else {
                    window.location = "/en/signup-form-submitted";
                }
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
          if(storedLang == 'en'){
            toastr.error('The email has already been used. Please choose another email.');
          }else{
            toastr.error('Die email wurde bereits benutzt. Bitte wählen Sie eine andere email.');
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
  let storedLang = localStorage.getItem("language");

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
if(saveButton){
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

      if (userID || userData.confirmed_email == "1") {
      if (docSnap.exists) {

        toastr.success('user logged in: ' + user.email);

        if (userData.confirmed_email == "0") {
          await updateDoc(userRef, { confirmed_email: "1" });
        }

        setTimeout(() => {
          if (storedLang) {
            if (storedLang === "de") {
               if (userData.user_is_admin === "0" && userData.company_admin == '1' && userData.basic_admin == '0') {
                window.location = "/de/admin/users-table";
              } else if (userData.user_is_admin === "0" && userData.company_admin == '0' && userData.basic_admin == '1') {
                window.location = "/de/admin/users-table";
              } else if ( userData.user_is_admin === "0" && userData.account_type == 'No company' ) {
                window.location = '/de/account';
              }else if (userData.user_is_admin === "0" && userData.account_type === "Press") {
                window.location = "/de/account";
              } else if (userData.user_is_admin === "0" && userData.account_type === "Supplier") {
                window.location = "/de/account";
              }else if (userData.user_is_admin === "0" && userData.account_type === "RSW") {
                window.location = "/de/account";
              } else if (userData.user_is_admin === "1") {
                window.location = "/de/admin/users-table";
              }
            } else {
               if (userData.user_is_admin === "0" && userData.company_admin == '1' && userData.basic_admin == '0') {
                window.location = "/en/admin/users-table";
              } else if (userData.user_is_admin === "0" && userData.company_admin == '0' && userData.basic_admin == '1') {
                window.location = "/en/admin/users-table";
              }else if ( userData.user_is_admin === "0" && userData.account_type == 'No company' ) {
                window.location = '/en/account';
              }else if (userData.user_is_admin === "0" && userData.account_type === "Press") {
                window.location = "/en/account";
              } else if (userData.user_is_admin === "0" && userData.account_type === "Supplier") {
                window.location = "/en/account";
              } else if (userData.user_is_admin === "0" && userData.account_type === "RSW") {
                window.location = "/en/account";
              } else if (userData.user_is_admin === "1") {
                window.location = "/en/admin/users-table";
              }
            }
          } else {
            if (userData.user_is_admin === "0" && userData.company_admin == '0' && userData.basic_admin == '1') {
                window.location = "/en/admin/users-table";
              }else if (userData.user_is_admin === "0" && userData.company_admin == '1' && userData.basic_admin == '0') {
                window.location = "/en/admin/users-table";
              } else if ( userData.user_is_admin === "0" && userData.account_type == 'No company' ) {
                window.location = '/en/account';
              }else if (userData.user_is_admin === "0" && userData.account_type === "Press") {
                window.location = "/en/account";
              } else if (userData.user_is_admin === "0" && userData.account_type === "Supplier") {
                window.location = "/en/account";
              } else if (userData.user_is_admin === "0" && userData.account_type === "RSW") {
                window.location = "/en/account";
              } else if (userData.user_is_admin === "1") {
                window.location = "/en/admin/users-table";
              }
          }
        }, 1000);
      } else {
        toastr.error('user does not exist');
      }
    }else if (userData.user_deleted === "1") {
      if (storedLang == 'en') {
        toastr.error('Your account has been deleted.');
      } else {
        toastr.error('Ihr Konto wurde gelöscht.');
      }
    }else{
      if(storedLang == 'en'){
        toastr.error('Please click on the link in your email first in order to sign in.');
      }else{
        toastr.error('Bitte klicken Sie zuerst auf den Link den sie per email erhalten haben.')
      }
    }
    } catch (error) {
      const errorMessage = error.message;
      toastr.error(errorMessage);
    }
  }

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

    /*
    * -----------------------------------------------------------------------------------------------------------
    * Homepage functions
    * -----------------------------------------------------------------------------------------------------------
    */

/*================================================================================================================================================================
 * This function is called on the home page. It identifies the sign-up form (wf-form-signup-form) and assigns an event listener to it. The event listener listens
 * for the form's submission and calls the handleSignUp function.
=================================================================================================================================================================*/

    function pageHome() {
        //identify auth action forms
        let signUpForm = document.getElementById('wf-form-signup-form');
        //assign event listeners
        if ( typeof(signUpForm) !== null ) {
          signUpForm.addEventListener('submit', handleSignUp, true);
        }
        getDateSignUp()
    }

/*================================================================================================================================================================
 * This function is called on the sign-in page. It identifies the sign-in form (wf-form-signin-form) and assigns an event listener to it. The event listener
 * listens for the form's submission and calls the handleSignIn function.
=================================================================================================================================================================*/

    function signInPage(){
        let signInForm = document.getElementById('wf-form-signin-form');

        //assign event listeners
        if(typeof(signInForm) !== null) {
          signInForm.addEventListener('submit', handleSignIn, true)
        }
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

    /*
    * -----------------------------------------------------------------------------------------------------------
    * Account functions
    * -----------------------------------------------------------------------------------------------------------
    */

/*==================================================================================================================================================================
 * This function retrieves the user information from the Firestore database based on the provided user parameter, which is the user object. It queries the database
 * using the user's UID and returns the corresponding user data if it exists. Otherwise, it displays an error message using Toastr.
===================================================================================================================================================================*/

    async function getUserInfo(user) {
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
 * This function updates the user's first name, last name, and address in the Firestore database. It uses the provided user object to identify the user, and
 * the newUsername, newUserLastname, and newUserAddress parameters contain the updated values for each field. The function uses the setDoc function to update
 * the document in the database.
=============================================================================================================================================================*/

// Update user info
function updateUsername(user, newUsername, newUserLastname, newUserAddress) {
  const userRef = doc(db, 'users', user.uid);

  setDoc(userRef, {
    user_firstname: newUsername.value,
    user_lastname: newUserLastname.value,
    user_address: newUserAddress.value
  }, { merge: true })
    .then(() => {
      toastr.success('Username has been successfully updated');
    })
    .catch((error) => {
      toastr.error('There was a problem updating the username');
    });
}

/*=================================================================================================================================================================
 * This function updates the user's email address. It uses the provided user object and the newEmail parameter, which contains the new email address. It uses the
 * updateEmail function to update the email address.
==================================================================================================================================================================*/

   // Update email
function updateUserEmail(user, newEmail, promises) {
  updateEmail(user, newEmail)
    .then(() => {
      toastr.success('Email has been successfully updated');
    })
    .catch((error) => {
      toastr.error('There was a problem updating the email');
    });
}

/*============================================================================================================================================================
 * This function updates the user's password. It uses the provided user object and the newPassword parameter, which contains the new password. It uses the
 * updatePassword function to update the password.
=============================================================================================================================================================*/

// Update password
function updateUserPassword(user, newPassword) {
  updatePassword(user, newPassword)
    .then(() => {
      toastr.success('Password has been successfully updated');
    })
    .catch((error) => {
      toastr.error('There was a problem updating the password', error);
    });
}

/*==================================================================================================================================================================
 * This function displays the user's profile picture. It uses the getDownloadURL function to retrieve the download URL of the profile picture from Firebase Storage.
 * It then sets the src attribute of the img element with the user_profile_pic ID to the obtained URL.
===================================================================================================================================================================*/

    //Display profile picture
    function showProfilePic(user){
      getDownloadURL(ref(storage, 'profiles/' + user.uid))
        .then((url) => {
          const img = document.getElementById('user_profile_pic');
          img.setAttribute('src', url);
        })
        .catch((error) => {
          // Handle any errors
        });
    }

/*===================================================================================================================================================================
 * This event listener listens for changes in the updatedPicture input element, which represents the updated profile picture file. When a change occurs, it checks
 * if the selected file is an image. If it is, it initializes the cropper and sets up the cropping functionality using the Cropper library.
====================================================================================================================================================================*/

   //Update profile picture
const updatedPicture = document.getElementById('updated_picture');
const hidden_input = document.getElementById('hidden_input2');
const update_picture_modal = document.getElementById('update_picture_modal');
let cropper = null;

if(updatedPicture){
  updatedPicture.addEventListener("change", function handleProfilePic(e) {
    e.preventDefault();
    e.stopPropagation();

    let fileItem = updatedPicture.files[0];

    if (updatedPicture.files.length === 0) {
      toastr.error('Please upload your profile picture');
    } else {
      // Check if the file is an image
      if (/^image\/\w+/.test(fileItem.type)) {
        // Destroy the current cropper instance if it exists
        if (cropper) {
          cropper.destroy();
          cropper = null;
        }
        // Initialize the cropper
        const image = document.getElementById('image_cropper2');
        image.src = URL.createObjectURL(fileItem);
        cropper = new Cropper(image, {
          aspectRatio: 3 / 4,
          width: 200,
          height: 200,
          viewMode: 1,
          autoCropArea: 0.7,
          responsive: true,
          crop(event) {
            // Get the cropped canvas data as a data URL
            const canvas = cropper.getCroppedCanvas();
            const dataURL = canvas.toDataURL();
            // Set the data URL as the value of the hidden input field
            hidden_input.value = dataURL;
          },
        });
      } else {
        toastr.error('Please choose an image file.');
      }
    }
  });
}

/*====================================================================================================================================================================
 * This function is triggered when the user submits the form to update their profile picture. It prevents the default form submission behavior, retrieves the cropped
 * canvas from the cropper, converts it to a blob, and uploads it to the Firebase Storage using the uploadBytes function. The updated profile picture is stored
 *  under the profiles directory with the user's ID as the filename. Once the upload is complete, a success message is displayed, and the modal is closed.
=====================================================================================================================================================================*/

function updateProfilePic(e, user) {
  e.preventDefault();
  e.stopPropagation();

  if (cropper) {
    const canvas = cropper.getCroppedCanvas();
    const metadata = {
    contentType: 'image/png'
    };
    canvas.toBlob((blob) => {
      const storageRef = ref(storage, 'profiles/' + update_img_user_id.value);
      uploadBytes(storageRef, blob, metadata)
        .then((snapshot) => {
          toastr.success('You have updated the profile picture successfully');
          setTimeout(function() {
            update_picture_modal.style.display = 'none';
          }, 1000);
        })
        .catch(err => {
          console.log('error uploading file', err);
          toastr.error('There was an error uploading the file');
        });
    });
  } else {
   //toastr.error('Please upload your profile picture');
  }
}

function updateFileLabel() {
  const fileName = document.getElementById("fileName");
  fileName.innerHTML = updatedPicture.files[0].name;
}

if (update_picture_modal !== null) {
  update_picture_modal.addEventListener('submit', function(ev) {
    updateProfilePic(ev, user);
  }, true);
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

/*================================================================================================================================================================
 * This event listener listens for clicks on the deleteButton element. When clicked, it retrieves the currently signed-in user, deletes the user's account using
 * the deleteUser function, and deletes the user's data from Firestore using the deleteDoc function. Depending on the user's selected language (storedLang),
 *  the page is redirected to the appropriate sign-in page after a brief delay. A success message is displayed if the account deletion is successful.
=================================================================================================================================================================*/

    let deleteButton = document.getElementById('delete_user');
    var storedLang = localStorage.getItem("language");

    if(deleteButton){
      deleteButton.addEventListener("click", async function(user){
        try {
          // Get the currently signed-in user
          var user = auth.currentUser;
          // Delete the user's account
          deleteUser(user).then(() => {
            if(storedLang == "de"){
              setTimeout(function() {
                  window.location.pathname = "/de/signin-bho";
                }, 1500);
            }else{
              setTimeout(function() {
                  window.location.pathname = "/en/signin-bho";
                }, 1500);
            }
            toastr.success('User account deleted');
            return deleteDoc(doc(db, "users", user.uid));
          }).catch((error) => {
            console.error('An error occurred while deleting the user account', error);
          });
          console.log("User's data deleted from Firestore");
        } catch (error) {
          toastr.error('An error occurred while deleting the user account', error);
        }
      });
    }

/*================================================================================================================================================================
 * This event listener listens for clicks on the deleteButton element. When clicked, it retrieves the currently signed-in user, deletes the user's account
 * using the deleteUser function, and deletes the user's data from Firestore using the deleteDoc function. Depending on the user's selected language (storedLang),
 * the page is redirected to the appropriate sign-in page after a brief delay. A success message is displayed if the account deletion is successful.
=================================================================================================================================================================*/

    async function pageAccount(user) {
      let userInfo = await getUserInfo(user);
      const companyNames = await changeCompanyNameToID(userInfo);
      userInfo.user_company_name = companyNames;
      const userRef = doc(db, 'users', user.uid);
      // Populate form fields with values
      document.getElementById("change_email").value = `${user.email}`;
      document.getElementById("new_user_name").value = `${userInfo.user_firstname}`;
      document.getElementById("new_user_lastname").value = `${userInfo.user_lastname}`;
      document.getElementById("new_user_address").value = `${userInfo.user_address}`;
      if(userInfo.user_company_name == undefined){
        document.getElementById("company_name").innerHTML = 'No company';
      }else{
        const companies = userInfo.user_company_name.split(",");
        const firstCompany = companies[0];
        document.getElementById("company_name").innerHTML = `${firstCompany}`;
      }
      if(userInfo.user_address == undefined){
        document.getElementById("new_user_address").value = "No Address"
      }
     setDoc(userRef, {
      last_signin_date: new Date()
     }, { merge: true })
     .then(() => {
        console.log('press data successfully updated');
     })
     .catch((err) => {
        console.log('there was a problem signin user', err);
        toastr.error('There was an error signin user');
     })

      let update_picture_modal = document.getElementById("picture_form_modal");
      let update_img_user_id = document.getElementById('update_img_user_id');

      // Update info form
    var updateInfoForm = document.getElementById('update_info_form');
    if (updateInfoForm) {
      updateInfoForm.addEventListener('submit', function(e) {
        e.preventDefault();
        e.stopPropagation();

        var newUsername = document.getElementById('new_user_name');
        var newUserLastname = document.getElementById('new_user_lastname');
        var newUserAddress = document.getElementById('new_user_address');
        var newEmail = document.getElementById('change_email');
        var newPassword = document.getElementById('change_password');
        var confirmPassword = document.getElementById('confirm_password');

        // Promesas de actualización
        var promises = [];

        updateUsername(user, newUsername, newUserLastname, newUserAddress);

        // Esperar a que todas las promesas se resuelvan
        Promise.all(promises)
          .then(() => {
            //toastr.success('Update completed successfully');
            //location.reload();
            if (newPassword.value !== '') {
              if (newPassword.value === confirmPassword.value) {
                promises.push(updateUserPassword(user, newPassword.value));
              } else {
                toastr.error('Password confirmation does not match');
              }
            }
            if (newEmail.value !== user.email) {
                updateUserEmail(user, newEmail.value, promises);
              }
          })
          .catch((error) => {
            toastr.error('There was an error during the update', error);
          });
      }, true);
    }

      if(update_img_user_id){
        update_img_user_id.value = user.uid;
      }

      if (update_picture_modal) {
        update_picture_modal.addEventListener('submit', function(ev) {
          updateProfilePic(ev, user);
        }, true);
      }
      showProfilePic(user);
      console.log(`Your ID: ${user.uid}`);
    }

/*
* -----------------------------------------------------------------------------------------------------------
* Press functions
* -----------------------------------------------------------------------------------------------------------
*/

/*==========================================================================================================================================================
 * The code defines functions related to adding press information. It updates the press's start date, end date, special request, user zones, and form
 * submission status. It also triggers email notifications based on the language selected and reloads the page after a successful form submission.
===========================================================================================================================================================*/

    function pressFormSubmit(e) {
      e.preventDefault();
      e.stopPropagation();

    const pressFormRef = collection(db, 'users');
    let press_title = document.getElementById('press_title');
    let press_lastname = document.getElementById('press_lastname');
    let press_firstname = document.getElementById('press_firstname');
    let user_fullname = '';
    let press_nationality = document.getElementById('press_nationality');
    let press_media_type = document.getElementById('press_media_type');
    let press_media = document.getElementById('press_media');
    let press_email = document.getElementById('press_email');
    let press_confirm_email = document.getElementById('press_confirm_email');
    let press_address = document.getElementById('press_address');
    let press_city = document.getElementById('press_city');
    let press_zip_code = document.getElementById('press_zip_code');
    let press_country = document.getElementById('country');
    let press_phone = document.getElementById('press_phone');
    let press_itwa = document.getElementById('press_itwa');
    let press_workspace = document.getElementById('press_workspace');
    let language = localStorage.getItem('language');
    let press_card_number = document.getElementById('press_card_number')

    if (press_firstname.value && press_lastname.value) {
    user_fullname = (press_firstname.value + press_lastname.value).toLowerCase().replace(/\s/g, '');
  }
      if (press_email.value !== press_confirm_email.value) {
        toastr.error("The emails don't match");
      } else {
        const docRef = addDoc(pressFormRef, {
          user_title: press_title.value,
          user_lastname: press_lastname.value,
          user_firstname: press_firstname.value,
          user_fullname: user_fullname,
          user_nationality: press_nationality.value,
          press_media_type: press_media_type.value,
          press_media: press_media.value,
          user_email: press_email.value,
          user_address: press_address.value,
          user_city: press_city.value,
          user_zip_code: press_zip_code.value,
          user_country: press_country.value,
          user_phone: press_phone.value,
          user_itwa: press_itwa.value,
          press_workspot: press_workspace.value,
          press_card_number: press_card_number.value,
          press_form_user: '1',
          user_company: 'vc5dzk77h7lqwrUQm9Ku',
          company_admin: '0',
          user_is_admin: '0',
          basic_admin: '0',
          account_type: 'Press',
          user_type: '',
          user_zones: '',
          user_status: 'Pending',
          confirmed_email: '1',
          language: language,
          user_deleted: '0'
        }, { merge: true })
        .then((docRef) => {
          const press_image = document.getElementById('press_image');
          if (press_image.files.length > 0) {
            const storageRef = ref(storage, `profiles/${docRef.id}`);
            pressUploadImage(docRef.id, storageRef, press_image);
          } else {
            toastr.error('Please upload your press ID');
          }
        })
        .catch((err) => {
          console.log('there was a problem updating the data', err);
          toastr.error('There was an error updating your info');
        });
      }
    }

/*================================================================================================================================================
 * The code handles the selection and cropping of a press image. It listens for changes in the press image input field, initializes the cropper,
 * and allows the user to crop the image. It also performs validation to ensure that only image files are selected.
=================================================================================================================================================*/

const press_image = document.getElementById('press_image');
const hiddenPressInput = document.getElementById('hidden_press_img');
const press_crop_modal = document.getElementById("crop_modal");
let press_cropper;
let imageLoaded = false;

function handlePressPic(e) {
  e.preventDefault();
  e.stopPropagation();

  let fileItem = press_image.files[0];

  if (press_image.files.length === 0 || !fileItem) {
    console.error('Please upload your profile picture');
    return;
  }
  if (/^image\/\w+/.test(fileItem.type)) {
    // Get the original file type (jpeg or png)
    let originalType = 'image/jpeg';
    if (fileItem.type === 'image/png') {
      originalType = 'image/png';
    }

    // Open the modal
    press_crop_modal.style.display = "block";

    if(press_cropper){
      press_cropper.destroy();
    }

    // Initialize the cropper
    const image = document.getElementById('press_image_cropper');
    image.src = URL.createObjectURL(fileItem);
    image.onload = function () {
      imageLoaded = true;
      press_cropper = new Cropper(image, {
        aspectRatio: 3 / 4,
        width: 200,
        height: 200,
        viewMode: 1,
        autoCropArea: 0.7,
        responsive: true,
        crop(event) {
          const canvas = press_cropper.getCroppedCanvas();
          canvas.toBlob((blob) => {
            const file = new File([blob], "recortedImage." + originalType.split('/')[1], { type: originalType });
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            press_image.files = dataTransfer.files;

            // Destroy the cropper after getting the canvas and toBlob
          }, originalType);
        },
      });
    };

    // Auto close the cropper
    const isMobile = window.innerWidth <= 800;
    if (isMobile) {
      press_crop_modal.style.display = "none";
    }
  } else {
    toastr.error('Please choose an image file.');
  }
}

if (press_image) {
  press_image.addEventListener('change', handlePressPic);
}

/*============================================================================================================================================================
 * The code handles the upload and processing of a press image. It checks if the image is loaded and the cropper is initialized, retrieves the necessary
 * information (such as file, metadata, and user details), and performs the upload to the storage. It also sends confirmation emails and redirects the user
 *  to the appropriate page based on the language and title selected.
=============================================================================================================================================================*/

async function pressUploadImage(docId, storageRef) {
  if (!imageLoaded || !press_cropper) {
    console.error('Image is not loaded or cropper is not initialized.');
    return;
  }
  const fullName = `${press_firstname.value} ${press_lastname.value}`;
  const file = press_image.files[0];
  const contentType = file.type;
  const metadata = {
    contentType: contentType
  };

  if (press_cropper && press_cropper.getCroppedCanvas()) {
    const canvas = press_cropper.getCroppedCanvas();
    canvas.toBlob((blob) => {
      let fileToUpload;
      if (!blob) {
        console.error('Failed to generate Blob object.');
        console.log('Using raw file instead');
        fileToUpload = file;
      } else {
        fileToUpload = blob;
        console.log('Using blob to upload');
      }

      console.log('fileToUpload', fileToUpload);

    //const imageSize = blob.size; // Size of the image in bytes
    //console.log('Image Size:', imageSize);

    uploadBytes(storageRef, fileToUpload, metadata)
      .then((snapshot) => {
        if (storedLang == 'de') {
          toastr.success('Sie haben das Formular erfolgreich übermittelt');
          if (press_title.value == 'Mr') {
            // Form confirmation email to admin DE
            try {
              const docRef = addDoc(collection(db, "mail"), {
                to: 'andreas.salvermoser@ops.dauherkert.com',
                message: {
                  subject: press_de_application_received_subject,
                  html: html,
                }
              });
            } catch (error) {
              console.error(error);
            }
            // Press - DE - Mr - Application received
            (async () => {
              try {
                const fullName = `${press_firstname.value} ${press_lastname.value}`;
                const html = await fetch(press_de_mr_application_received_url)
                  .then(response => response.text())
                  .then(html => html.replace('${fullName}', fullName));
                const docRef = addDoc(collection(db, "mail"), {
                  to: `${press_email.value}`,
                  message: {
                    subject: press_de_application_received_subject,
                    html: html,
                  }
                });
              } catch (error) {
                console.error(error);
              }
              setTimeout(function () {
                window.location.pathname = '/de/press-form-submitted';
              }, 1500);
            })();
            setTimeout(function () {
              window.location.pathname = '/de/press-form-submitted';
            }, 1500);
          } else if (press_title.value == 'Ms') {
            // Form confirmation email to admin
            (async () => {
              try {
                const fullName = `${press_firstname.value} ${press_lastname.value}`;
                const html = await fetch(form_de_ms_confirmation_email_to_admin_url)
                  .then(response => response.text())
                  .then(html => html.replace('${fullName}', fullName));
                const docRef = addDoc(collection(db, "mail"), {
                  to: 'andreas.salvermoser@ops.dauherkert.com',
                  message: {
                    subject: press_de_application_received_subject,
                    html: html,
                  }
                });
              } catch (error) {
                console.error(error);
              }
            })();
            // Press - DE - Ms - Application received
            (async () => {
              try {
                const fullName = `${press_firstname.value} ${press_lastname.value}`;
                const html = await fetch(press_de_ms_application_received_url)
                  .then(response => response.text())
                  .then(html => html.replace('${fullName}', fullName));
                const docRef = addDoc(collection(db, "mail"), {
                  to: `${press_email.value}`,
                  message: {
                    subject: press_de_application_received_subject,
                    html: html,
                  }
                });
              } catch (error) {
                console.error(error);
              }
              setTimeout(function () {
                window.location.pathname = '/de/press-form-submitted';
              }, 1500);
            })();
          } else if (press_title.value == 'Diverse') {
            // Form confirmation email to admin
            (async () => {
              try {
                const fullName = `${press_firstname.value} ${press_lastname.value}`;
                const html = await fetch(form_de_diverse_confirmation_email_to_admin_url)
                  .then(response => response.text())
                  .then(html => html.replace('${fullName}', fullName));
                const docRef = addDoc(collection(db, "mail"), {
                  to: 'andreas.salvermoser@ops.dauherkert.com',
                  message: {
                    subject: press_de_application_received_subject,
                    html: html,
                  }
                });
              } catch (error) {
                console.error(error);
              }
            })();
            // Press - DE - Diverse - Application received
            (async () => {
              try {
                const fullName = `${press_firstname.value} ${press_lastname.value}`;
                const html = await fetch(press_de_diverse_application_received_url)
                  .then(response => response.text())
                  .then(html => html.replace('${fullName}', fullName));
                const docRef = addDoc(collection(db, "mail"), {
                  to: `${press_email.value}`,
                  message: {
                    subject: press_de_application_received_subject,
                    html: html,
                  }
                });
              } catch (error) {
                console.error(error);
              }
              setTimeout(function () {
                window.location.pathname = '/de/press-form-submitted';
              }, 1500);
            })();
          }
        } else { // storedLang == 'en'
          toastr.success('You have submitted the form successfully');
          if (press_title.value == 'Mr' || press_title.value == 'Ms') {
            // Form confirmation email to admin
            (async () => {
              try {
                const fullName = `${press_title.value} ${press_firstname.value} ${press_lastname.value}`;
                const html = await fetch(form_en_mr_ms_confirmation_form_to_admin_url)
                  .then(response => response.text())
                  .then(html => html.replace('${fullName}', fullName));
                const docRef = addDoc(collection(db, "mail"), {
                  to: 'andreas.salvermoser@ops.dauherkert.com',
                  message: {
                    subject: press_en_application_received_subject_admin,
                    html: html,
                  }
                });
              } catch (error) {
                console.error(error);
              }
            })();
            // Press - EN - Mr/Ms - Application received
            (async () => {
              try {
                const fullName = `${press_title.value} ${press_firstname.value} ${press_lastname.value}`;
                const html = await fetch(press_en_mr_ms_application_received_url)
                  .then(response => response.text())
                  .then(html => html.replace('${fullName}', fullName));
                const docRef = addDoc(collection(db, "mail"), {
                  to: `${press_email.value}`,
                  message: {
                    subject: press_en_application_received_subject,
                    html: html,
                  }
                });
              } catch (error) {
                console.error(error);
              }
              setTimeout(function () {
                window.location.pathname = '/en/press-form-submitted';
              }, 1500);
            })();
          } else if (press_title.value == 'Diverse') {
            // Form confirmation email to admin
            (async () => {
              try {
                const fullName = `${press_title.value} ${press_firstname.value} ${press_lastname.value}`;
                const html = await fetch(press_en_mr_ms_application_received_url)
                  .then(response => response.text())
                  .then(html => html.replace('${press_title.value} ${press_firstname.value} ${press_lastname.value}', fullName));
                const docRef = addDoc(collection(db, "mail"), {
                  to: 'andreas.salvermoser@ops.dauherkert.com',
                  message: {
                    subject: press_en_application_received_subject_admin,
                    html: html,
                  }
                });
              } catch (error) {
                console.error(error);
              }
            })();
            // Press - EN - Diverse - Application received
            (async () => {
              try {
                const fullName = `${press_firstname.value} ${press_lastname.value}`;
                const html = await fetch(press_en_diverse_application_received_url)
                  .then(response => response.text())
                  .then(html => html.replace('${press_firstname.value} ${press_lastname.value}', fullName));
                const docRef = addDoc(collection(db, "mail"), {
                  to: `${press_email.value}`,
                  message: {
                    subject: press_en_application_received_subject,
                    html: html,
                  }
                });
              } catch (error) {
                console.error(error);
              }
              setTimeout(function () {
                window.location.pathname = '/en/press-form-submitted';
              }, 1500);
            })();
          }
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }, contentType);
}else {
    console.error('Canvas is not available. The cropper might not be initialized properly or the image is not loaded.');
  }
}

/*==============================================================================================================================================================
 * The code is responsible for handling the press page functionality. It performs various validations on the required fields, checks if checkboxes are checked,
 * validates the press image file input, checks for identical emails, and submits the press form if there are no errors. It also displays appropriate error
 * messages based on the selected language.
===============================================================================================================================================================*/

async function pagePress() {
  const press_form = document.getElementById('logout_press_form');
  const submit_button = document.getElementById('submit_button');
  const requiredFields = document.querySelectorAll(".required");
  const press_image = document.getElementById('press_image');
  const storedLang = localStorage.getItem("language");
  let checkboxesChecked = false;

  requiredFields.forEach(field => {
  field.addEventListener('change', function() {
    if (!this.value) {
      this.style.border = "2px solid red";
    } else {
      this.style.border = "1px solid #cccccc";
    }
  });
});

submit_button.addEventListener('click', function(ev) {
  ev.preventDefault();

  let hasErrors = false;
  let uncheckedCheckboxesCount = 0;

  // Validate the required fields
  for (let i = 0; i < requiredFields.length; i++) {
    if (!requiredFields[i].value) {
      requiredFields[i].style.border = "2px solid red";
      hasErrors = true;
    } else if (requiredFields[i].type === "email") {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(requiredFields[i].value)) {
        requiredFields[i].style.border = "2px solid red";
        hasErrors = true;
      }
    } else if (requiredFields[i].type === "checkbox") {
      if (!requiredFields[i].checked) {
        uncheckedCheckboxesCount++;
        requiredFields[i].parentNode.style.border = "2px solid red";

        requiredFields[i].addEventListener("change", function() {
          if (requiredFields[i].checked) {
            // Remove the red border if the checkbox is checked
            requiredFields[i].parentNode.style.border = "none";
          }
        });

      } else {
        requiredFields[i].parentNode.style.border = "none";
      }
    } else if (requiredFields[i].id === "press_phone") {
      // Validate phone number if needed
    } else if (requiredFields[i].id === "press_zip_code") {
      // Validate zip code if needed
    }
  }

  // Display the error message only once for all unchecked checkboxes
  if (uncheckedCheckboxesCount > 0) {
    hasErrors = true;
    if (storedLang == 'de') {
      toastr.error('Bitte stellen Sie sicher, dass alle rechtlichen Hinweise vor dem Absenden des Formulars angekreuzt sind.');
    } else {
      toastr.error('Please ensure that all legal notices are checked before submitting the form.');
    }
  }

  // Validate the press image file input
  if (press_image.files.length === 0) {
    if (storedLang === 'de') {
      toastr.error('Bitte laden Sie Ihr Profilbild hoch');
    } else {
      toastr.error('Please upload your profile image');
    }
    hasErrors = true;
  }

  // Check for identical emails
  if ($('#press_email').length && $('#press_confirm_email').length) {
    if ($('#press_email').val() != $('#press_confirm_email').val()) {
      if (storedLang === 'de') {
        toastr.error('Bitte verwenden Sie die gleiche E-mail');
      } else {
        toastr.error('Please make sure to use the same E-mail');
      }
      hasErrors = true;
    }
  }

  if (!hasErrors) {
    checkboxesChecked = true;
  }

  if (!hasErrors && checkboxesChecked) {
    pressFormSubmit(ev);
  }
});
}
    /*
    * -----------------------------------------------------------------------------------------------------------
    * Supplier functions
    * -----------------------------------------------------------------------------------------------------------
    */

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

    async function pageSupplier(user) {
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
      /*
      * -----------------------------------------------------------------------------------------------------------
      * Admin functions
      * -----------------------------------------------------------------------------------------------------------
      */

/*=============================================================================================================================================================
 * The provided code is part of the pageAdmin function, which handles date selection and user interface manipulation on an admin page. The first block of
 * code assigns a click event to an element with the ID "open_modal_btn" to open a modal and retrieve start and end dates. The updateDates function initializes
 * the date pickers using the Air Datepicker library. Language and format options are adjusted based on the selected language. Lastly, the user interface is
 * manipulated to show or hide elements based on the user's administrative role.
==============================================================================================================================================================*/

    async function pageAdmin(user) {

      $(document).on( 'click' , '#open_modal_btn' , function() {

      let user_start_date = document.getElementById('Select-dates');
      let user_end_date = document.getElementById('Select-dates2');
      let startDateCell = $(this).closest('div').siblings('div[tabulator-field="user_start_date"]');
      let endDateCell = $(this).closest('div').siblings('div[tabulator-field="user_end_date"]');
      user_start_date.value = startDateCell.text();
      user_end_date.value = endDateCell.text();
      var dateStartStr = user_start_date.value;
      var dateEndStr = user_end_date.value;

      updateDates(user, dateStartStr, dateEndStr)
      })

  async function updateDates(user, dateStartStr, dateEndStr) {
  var today = new Date();
  var minDate;
  var maxDate = new Date(today.getFullYear(), 6, 1);
  var startDatePicker = $('[data-date-picker="datepicker-start"]');
  var endDatePicker = $('[data-date-picker="datepicker-end"]');
  let userInfo = await getUserInfo(user);

  //Change minDate depending the user type
  if(userInfo.account_type == 'Press'){
    minDate = new Date(today.getFullYear(), 5, 22);
  } else {
    minDate =  new Date(today.getFullYear(), 5, 22);
  }

  // Parse the date string into an array of Date objects
  var startDateArray = dateStartStr.split(',').map(function(dateString) {
    return new Date(Date.parse(dateString.replace(/-/g, '/')));
  });
  var defaultStartDate = startDateArray.length > 0 ? startDateArray : null;

  // Parse the date string into an array of Date objects
  var endDateArray = dateEndStr.split(',').map(function(dateString) {
    return new Date(Date.parse(dateString.replace(/-/g, '/')));
  });
  var defaultEndDate = endDateArray.length > 0 ? endDateArray : null;

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
  if (storedLang == 'de') {
    datepickerLocaleToUse = 'de';
  }
startDatePicker.datepicker({
    defaultDate: defaultStartDate,
    multipleDates: false,
    multipleDatesSeparator: ', ',
    dateFormat: 'mm-dd-yyyy',
    minDate: minDate,
    maxDate: maxDate,
    language: datepickerLocaleToUse,
    onHide: function(inst, animationCompleted) {
      let selectedDates = inst.selectedDates;
      console.log(selectedDates);
    },
    onSelect: function(formattedDate, date, inst) {
      inst.hide();
    }
  });
  endDatePicker.datepicker({
    defaultDate: defaultEndDate,
    multipleDates: false,
    multipleDatesSeparator: ', ',
    dateFormat: 'mm-dd-yyyy',
    minDate: minDate,
    maxDate: maxDate,
    language: datepickerLocaleToUse,
    onHide: function(inst, animationCompleted) {
      let selectedDates = inst.selectedDates;
      console.log(selectedDates);
    },
    onSelect: function(formattedDate, date, inst) {
      inst.hide();
    }
  });
  let startDatepickerInstance = startDatePicker.data('datepicker');
let endDatepickerInstance = endDatePicker.data('datepicker');

if(dateStartStr){
  let startDateArray = dateStartStr.split(',').map(function(dateString) {
    return new Date(dateString);
  });
  startDatepickerInstance.selectDate(startDateArray);
}

if(dateEndStr){
  let endDateArray = dateEndStr.split(',').map(function(dateString) {
    return new Date(dateString);
  });
  endDatepickerInstance.selectDate(endDateArray);
}

if (window.innerWidth < 768) {
    $('[data-date-picker]').attr('readonly', 'readonly');
  }
}

      changeAdminTypeTitle(user);
      let user_dates = document.getElementById('user_dates');
      let basic_admin = document.getElementById('basicaAdminCont');
      let companies_table = document.getElementById('companies_table_link');
      let companies_table_mob = document.getElementById('companies_table_mob');
      let userInfo = await getUserInfo(user);
      const userRef = doc(db, 'users', user.uid);
      const companyNames = await changeCompanyNameToID(userInfo);
      userInfo.user_company_name = companyNames;
      if(userInfo.user_company_name == undefined){
        document.getElementById("company_name").innerHTML = 'No company';
      }else{
        const companies = userInfo.user_company_name.split(",");
        const firstCompany = companies[0];
        document.getElementById("company_name").innerHTML = `${firstCompany}`;
      }
            let select_type_id = document.getElementById('select_type_id');
            let user_profile_company_update = document.getElementById('user_company_update');
            let update_user_profile = document.getElementById('update_user_profile');
            let head_user = document.getElementById('head_user');

            if(userInfo.user_is_admin == '0' && userInfo.company_admin == '1' && userInfo.basic_admin == '0'){
              select_type_id.style.display = 'none';
              user_profile_company_update.style.display = 'none';
              update_user_profile.style.display = 'none';
              head_user.style.display = 'none';
              basic_admin.style.display = 'none';
              companies_table.style.display = 'block';
              companies_table_mob.style.display = 'block';
            }else if(userInfo.user_is_admin == '0' && userInfo.basic_admin == '1' && userInfo.company_admin == '0'){
              select_type_id.style.display = 'none';
              user_profile_company_update.style.display = 'none';
              update_user_profile.style.display = 'none';
              head_user.style.display = 'none';
              user_dates.style.display = 'none';
              basic_admin.style.display = 'none';
              companies_table.style.display = 'none';
              companies_table_mob.style.display = 'none';
              document.getElementById('update_user_zones').style.display = 'none';
              document.getElementById('accepted_option').style.display = 'none';
              document.getElementById('accepted_option_bulk').style.display = 'none';
            }else{
              select_type_id.style.display = 'none';
              user_profile_company_update.style.display = 'block';
              update_user_profile.style.display = 'block';
              head_user.style.display = 'block';
              user_dates.style.display = 'block';
              basic_admin.style.display = 'block';
              companies_table.style.display = 'block';
              companies_table_mob.style.display = 'block';
            }

/*---------------------------------------------------------------------------------------------------------------------------------------
 * USERS TABLE FUNCTIONS
----------------------------------------------------------------------------------------------------------------------------------------*/

/*===========================================================================================================================================================
 * This code snippet creates a users table using the Tabulator library. It includes various columns such as ID, Fullname, Email, Company, Status, User Type,
 * and Admin. The table supports pagination, filtering, sorting, and row selection. The data is fetched from the Firestore database, and certain column labels
 * and options are localized based on the stored language. The table also includes buttons for editing and deleting user records.
 ============================================================================================================================================================*/

      // Print users table
      let userTableFirstnameLabel = 'NAME';
      let userTableLastnameLabel = 'LAST NAME';
      let userTableCompanyLabel = 'COMPANY';
      let userTableStatusLabel = 'STATUS';
      let userTableAdminLabel = 'ADMIN';
      let userTableUpdateLabel = 'ACTION';
      let userTableSelectLabel = 'SELECT';
      let userTableEditLabel = 'EDIT';

      if ( storedLang == 'de' ) {
        userTableFirstnameLabel = 'VORNAME';
        userTableLastnameLabel = 'NACHNAME';
        userTableCompanyLabel = 'FIRMA';
        userTableStatusLabel = 'STATUS';
        userTableAdminLabel = 'ADMIN';
        userTableUpdateLabel = 'BEARBEITEN';
        userTableSelectLabel = 'AUSWÄHLEN';
        userTableEditLabel = 'BEARBEITEN';
      }
      let statusOptions = {
        "Ok": "OK",
        "Declined": "DECLINED",
        "Pending": "PENDING",
        "Printed": "PRINTED"
      };
      if (storedLang === 'de') {
        statusOptions = {
          "Ok": "OK",
          "Declined": "DECLINED",
          "Pending": "PENDING",
          "Printed": "PRINTED"
        };
      }
      let typeOptions = {
        "Press": "PRESS",
        "Supplier": "SUPPLIER",
        "RSW": "RSW"
      };
      if (storedLang === 'de') {
        typeOptions = {
          "Press": "PRESSE",
          "Supplier": "ANBIETER",
          "RSW": "RSW"
        };
      }

      const company_colRef = collection(db, 'companies');
      let searchInput = document.getElementById("search-input");
      const q = query(collection(db, "users"));

      // Function to fetch unique company names
      async function fetchUniqueCompanies(userInfo) {
        const snapshot = await getDocs(company_colRef);
        const adminCompanyName = userInfo.user_company;
        const adminCompanyIds = adminCompanyName.split(',');
        let uniqueCompanies = [];

        // Get company names for the user
        const companyNames = await changeCompanyNameToID(userInfo);

        snapshot.forEach((doc) => {
          let company = doc.data().company_name;
          if (userInfo.company_admin == '1') {
            if (!uniqueCompanies.includes(company) && companyNames.includes(company)) {
              uniqueCompanies.push(company);
            }
          } else {
            if (!uniqueCompanies.includes(company)) {
              uniqueCompanies.push(company);
            }
          }
        });

        uniqueCompanies = uniqueCompanies.map(company => company.trim()).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

        return uniqueCompanies;
      }

      fetchUniqueCompanies(userInfo).then((uniqueCompanies) => {
      let table = new Tabulator("#admin-user-list", {
       //options here
        layout:"fitData",
        addRowPos:"top",
        history:true,
        pagination:"local",
        paginationSize:10,
        paginationSizeSelector:[10, 25, 50],
        paginationCounter:"rows",
        headerFilterElement: document.querySelector('#tryany'),
        columns:[
            {title:"ID", field:"id", sorter:"string", width:0, cssClass:"hidden-column"},
            {title:"Fullname", field:"user_fullname", sorter:"string", width:0, cssClass:"hidden-column"},
            {title:"ITWA", field:"user_itwa", sorter:"string", width:0, cssClass:"hidden-column"},
            {title:"Press ID", field:"press_id", sorter:"string", width:0, cssClass:"hidden-column"},
            {title:"Special requests", field:"special_requests", sorter:"string", width:0, cssClass:"hidden-column"},
            {title:"Workspot", field:"press_workspot", sorter:"string", width:0, cssClass:"hidden-column"},
            {title:"Press form user", field:"press_form_user", sorter:"string", width:0, cssClass:"hidden-column"},
            {title:"User title", field:"user_title", sorter:"string", width:0, cssClass:"hidden-column"},
            {title:"User type", field:"user_type", sorter: "string", width: 0, headerFilter:"list", cssClass: "hidden-column"},
            {title:"Press media type", field:"press_media_type", sorter:"string", width:0, cssClass:"hidden-column"},
            {title:"Press media", field:"press_media", sorter:"string", width:0, cssClass:"hidden-column"},
            {title:"Company Admin", field:"company_admin", sorter:"string", width:0, cssClass:"hidden-column"},
            {title:"Basic Admin", field:"basic_admin", sorter:"string", width:0, cssClass:"hidden-column"},
            {title:"companyID", field:"companyID", sorter:"string", width:0, cssClass:"hidden-column"},
            {title:"User Zones", field:"user_zones", sorter:"string", width:0, cssClass:"hidden-column"},
            {title:"User Start Date", field:"user_start_date", sorter:"string", width:0, cssClass:"hidden-column"},
            {title:"User End Date", field:"user_end_date", sorter:"string", width:0, cssClass:"hidden-column"},
            {title:"User Language", field:"language", sorter:"string", width:0, cssClass:"hidden-column"},
            {title:"Nationality", field:"nationality", sorter:"string", width:0, cssClass:"hidden-column"},
            {title:"Address", field:"address", sorter:"string", width:0, cssClass:"hidden-column"},
            {title:"City", field:"city", sorter:"string", width:0, cssClass:"hidden-column"},
            {title:"Zip", field:"zip", sorter:"string", width:0, cssClass:"hidden-column"},
            {title:"Country", field:"country", sorter:"string", width:0, cssClass:"hidden-column"},
            {title:"Phone", field:"phone", sorter:"string", width:0, cssClass:"hidden-column"},
            {title: userTableFirstnameLabel, field:"name", sorter:"string", width:180, cssClass:"first_column"},
            {title:"EMAIL", field:"email", sorter:"string", width:220, cssClass:"other_columns"},
            {title: userTableLastnameLabel, field:"lastname", sorter:"string", width:0, cssClass:"hidden-column"},
            {title: userTableCompanyLabel, field:"company", sorter:"string", width:150, headerFilter:"list", headerFilterParams:{values: uniqueCompanies, clearable:true, headerFilterFunc: function(headerValue, rowValue, rowData, filterParams) {let selectedCompany = headerValue.toLowerCase();let userCompanies = rowData.company.toLowerCase().split(", ");return userCompanies.includes(selectedCompany);}}, headerFilterPlaceholder: "Company", cssClass:"other_columns"},
            {
              title: userTableStatusLabel,
              field: "status",
              sorter: "string",
              width: 105,
              formatter: function(cell) {
                let value = cell.getValue();
                let label = "";
                let color = "";
                if (storedLang === 'de') {
                  if (value === "Ok") {
                    label = "Ok";
                    color = "#A3E11E";
                  } else if (value === "Declined") {
                    label = "Declined";
                    color = "#DD4042";
                  } else if (value === "Pending") {
                    label = "Pending";
                    color = "#F29A2E";
                  } else if (value === "Printed") {
                    label = "Printed";
                    color = "#0000FF";
                  }
                } else {
                  if (value === "Ok") {
                    label = "Ok";
                    color = "#A3E11E";
                  } else if (value === "Declined") {
                    label = "Declined";
                    color = "#DD4042";
                  } else if (value === "Pending") {
                    label = "Pending";
                    color = "#F29A2E";
                  } else if (value === "Printed") {
                    label = "Printed";
                    color = "#0000FF";
                  }
                }
                return '<div style="display:flex;align-items:center;justify-content:center"><div style="width:16px;height:16px;border-radius:50%;background-color:' + color + ';margin-right:0px;"></div><div style="width:0px;font-size:0px">' + label + '</div></div>';
              },
              headerFilter: "list",
              headerFilterParams: {
                values: true,
                valuesSort: "asc",
                values: statusOptions,
                clearable: true,
              },
              headerFilterPlaceholder: "Status",
              cssClass: "other_columns",
            },
            {title:"USER TYPE", field: "account_type", sorter: "string", cssClass:"hidden-column", width:0, headerFilter: "list",
              headerFilterParams: {
                values: true,
                valuesSort: "asc",
                values: typeOptions,
                clearable: true,
              }},
            {title: userTableAdminLabel, field:"user_admin", width:0, cssClass:"hidden-column", formatter:function(cell, formatterParams, onRendered){
                return cell.getValue() == 1 ? "Admin" : "";
            }},
            {title: userTableUpdateLabel, formatter:function(cell, formatterParams){
                // Create first button
                let button1 = document.createElement("button");
                button1.setAttribute("onclick","openModal()");
                button1.setAttribute("id","open_modal_btn");
                button1.innerHTML = "<img src='https://uploads-ssl.webflow.com/6453e5fbbb9ef87f5979b611/6462983e76b4d1ee3ac14cd1_pencil-alt.png' alt='Edit'/>";
                // Create second button
                let button2 = document.createElement("button");
                button2.setAttribute("onclick","openModal10()");
                button2.setAttribute("id","delete_btn");
                button2.innerHTML = "<img src='https://uploads-ssl.webflow.com/6453e5fbbb9ef87f5979b611/6462e184b518709fa4ff5fe6_trash.png' alt='Delete'/>";
                // Create a div to contain the buttons
                let buttonContainer = document.createElement("div");
                buttonContainer.appendChild(button1);
                buttonContainer.appendChild(button2);
                // Return the container with the buttons
                return buttonContainer;
            }, align: "center", cssClass:"center_col other_columns edit_delete_col", width: 120},
        {title: userTableSelectLabel, cssClass:"center_col other_columns", width: 105, formatter:function(cell, formatterParams){
          let checkbox = document.createElement("input");
              checkbox.type = "checkbox";
              checkbox.addEventListener("click", function(){
                  let row = cell.getRow();
                  let rowData = row.getData();
                  let rowId = rowData.id;
                  if(checkbox.checked){
                      selectedData.push(rowId);
                  }else{
                      selectedData = selectedData.filter(function(value){
                          return value != rowId;
                      });
                  }
                  console.log(selectedData);
              });
              return checkbox;
          }, align: "center"},
        ],
});

/*=================================================================================================================================================================
 * This code snippet sets up event listeners and filters for the users table. It fetches company data from Firestore and populates the company filter dropdowns.
 * The code enables filtering of the table based on selected values in the company, status, and type filters. It also includes pagination customization and a
 *  search functionality. The clear filter button resets the filters. User data is retrieved based on admin privileges and company, and the filtered data is
 *  displayed in the table.
==================================================================================================================================================================*/

let companyFilterSelect = document.getElementById("company-filter");
let statusFilterSelect = document.getElementById("status-filter");
let typeFilterSelect = document.getElementById("type-filter");
let companyFilterSelectMobile = document.getElementById("company-filter-mob");
let statusFilterSelectMobile = document.getElementById("status-filter-mob");

//Print companies select
    getDocs(company_colRef)
      .then((snapshot) => {
          // Retrieve company data from Firestore
        const companies = snapshot.docs.map((doc) => doc.data());
        const sortedCompanies = companies.sort((a, b) => a.company_name.localeCompare(b.company_name));

        // Populate the company filter dropdown with company names
        sortedCompanies.forEach((company) => {
          var opt = document.createElement('option');
          opt.value = company.company_name;
          opt.textContent = company.company_name;
          companyFilterSelect.appendChild(opt);
        });
      })
      .catch((err) => {
        console.log('error fetching companies', err);
      });

//Print companies select Mobile
getDocs(company_colRef)
      .then((snapshot) => {
        // Retrieve company data from Firestore
        const companies = snapshot.docs.map((doc) => doc.data());
        const sortedCompanies = companies.sort((a, b) => a.company_name.localeCompare(b.company_name));

        // Populate the mobile company filter dropdown with company names
        sortedCompanies.forEach((company) => {
          var opt = document.createElement('option');
          opt.value = company.company_name;
          opt.textContent = company.company_name;
          companyFilterSelectMobile.appendChild(opt);
        });
      })
      .catch((err) => {
        console.log('error fetching companies', err);
      });

// Event listener for company filter select
companyFilterSelect.addEventListener("change", function() {
    let companyColumn = table.getColumn("company");
    let selectedCompany = companyFilterSelect.value;
    table.setHeaderFilterValue(companyColumn, selectedCompany);
});

// Event listener for status filter select
statusFilterSelect.addEventListener("change", function() {
    let statusColumn = table.getColumn("status");
    let selectedStatus = statusFilterSelect.value;
    table.setHeaderFilterValue(statusColumn, selectedStatus);
});

// Event listener for type filter select
typeFilterSelect.addEventListener("change", function() {
    let typeColumn = table.getColumn("account_type");
    let selectedStatus = typeFilterSelect.value;
    table.setHeaderFilterValue(typeColumn, selectedStatus);
});

// Event listener for mobile company filter select
companyFilterSelectMobile.addEventListener("change", function() {
    let companyColumn = table.getColumn("company");
    let selectedCompany = companyFilterSelectMobile.value;
    table.setHeaderFilterValue(companyColumn, selectedCompany);
});

// Event listener for mobile status filter select
statusFilterSelectMobile.addEventListener("change", function() {
    let statusColumn = table.getColumn("status");
    let selectedStatus = statusFilterSelectMobile.value;
    table.setHeaderFilterValue(statusColumn, selectedStatus);
});

$(document).ready(function() {
          $(".tabulator-paginator").find(".tabulator-page[data-page='prev']").html("&lt;");
          $(".tabulator-paginator").find(".tabulator-page[data-page='next']").html("&gt;");
          if(storedLang == 'de'){
            $(".tabulator-paginator").find(".tabulator-page[data-page='first']").html("Zurück");
            $(".tabulator-paginator").find(".tabulator-page[data-page='last']").html("Vor");
          }
          const tableFilters = table.getHeaderFilters();
          const tableFiltersContainer = document.querySelector("#aaaa");
          tableFilters.forEach((filterEl) => tableFiltersContainer.appendChild(filterEl));
        });

const input = document.getElementById("fSearch");
input.addEventListener("keyup", function() {
    table.setFilter(matchAny, { value: input.value });
    if (input.value == " ") {
        table.clearFilter()
    }
});

// Function to match any value in the data with the filter value
function matchAny(data, filterParams) {
    var match = false;
    const regex = RegExp(filterParams.value, 'i');

    for (var key in data) {
        if (regex.test(data[key]) == true) {
            match = true;
        }
    }
    return match;
}

// Event listener for clear filter button
let clearFilterButton = document.getElementById('clear_button');
let clearFilterButtonMobile = document.getElementById('clear_button_mob');
if (clearFilterButton) {

  clearFilterButton.addEventListener("click", function() {
    // Clear filter values and header filters
    document.querySelector('input[placeholder="Company"]').value = "";
    document.querySelector('input[placeholder="Status"]').value = "";
    document.querySelector('#company-filter').value = "clear";
    document.querySelector('#status-filter').value = "clear";

    table.clearHeaderFilter();
  });
}
if (clearFilterButtonMobile) {
  clearFilterButtonMobile.addEventListener("click", function() {
    // Clear filter values and header filters
    document.querySelector('input[placeholder="Company"]').value = "";
    document.querySelector('input[placeholder="Status"]').value = "";
    document.querySelector('#company-filter-mob').value = "clear";
    document.querySelector('#status-filter-mob').value = "clear";

    table.clearHeaderFilter();
  });
}

const companyAdmin = userInfo.company_admin;
const basicAdmin = userInfo.basic_admin;
const adminCompanyName = userInfo.user_company;
console.log('admin:', adminCompanyName)

getDocs(q)
  .then((snapshot) => {
    let data = [];
    let promises = [];
    snapshot.docs.forEach((doc) => {
      let user = doc.data();

      promises.push(changeCompanyNameToID(user).then(userCompanyName => {
        if (user.user_deleted !== '1') { // Agregar condición para excluir usuarios eliminados
          data.push({id: doc.id, user_fullname: user.user_fullname, special_requests: user.supplier_special_request, user_itwa: user.user_itwa, press_id: user.press_card_number, press_workspot: user.press_workspot, press_form_user: user.press_form_user, user_title: user.user_title, press_media_type: user.press_media_type, press_media: user.press_media, email: user.user_email, company_admin: user.company_admin, basic_admin: user.basic_admin, companyID: [user.user_company], user_type: user.user_type, account_type: user.account_type, user_zones: user.user_zones, user_start_date: user.supplier_start_date, user_end_date: user.supplier_end_date, language: user.language, name: user.user_firstname + ' ' + user.user_lastname, lastname: user.user_lastname, company: userCompanyName, status: user.user_status, user_admin: user.user_is_admin, nationality: user.user_nationality, address: user.user_address, city: user.user_city, zip: user.user_zip_code, country: user.user_country, phone: user.user_phone});
        }
      }));
    });
    return Promise.all(promises).then(() => data);
  })
  .then(data => {
    // Filter and set user data for the table based on admin privileges and company
    console.log(data, 'admin', adminCompanyName);
    table.setData((companyAdmin == '1' || basicAdmin == '1') ? data.filter(user => user.companyID && user.companyID != ' ' && user.companyID != '' && user.companyID.some(x => adminCompanyName.includes(x))) : data);
  })
  .catch(err => {
    console.log('error fetching users', err);
  });
});

/*========================================================================================================================================================
 * This code segment is responsible for updating user information. It listens for form submission events and prevents the default behavior. It retrieves
 * various form elements and values, including user-specific details such as ID and email. It updates the selected user's information in the database,
 * including user type, account type, user status, user company, admin privileges, and other relevant fields. It also handles email notifications and displays
 * appropriate success messages. Finally, it updates and saves the user's selected zones to the database.
=========================================================================================================================================================*/
    // Update single user Info
      let update_user_form = document.getElementById('update_user_type');
      let user_specific_id = document.getElementById('admin_user_id');
      let user_specific_email = document.getElementById('admin_user_email');
      let admin_user_name = document.getElementById('admin_user_name');
      let basic_admin_update = document.getElementById('basic_admin');
      let admin_user_lastname = document.getElementById('admin_user_lastname');
      let userTypeUpdate = document.getElementById('new_user_type');
      let accountTypeUpdate = document.getElementById('accountType');
      let user_status_update = document.getElementById('accountStatus');
      let user_company_update = document.getElementById('userCompany');
      let admin_cred = document.getElementById('is_admin');
      let company_admin = document.getElementById('headUser');
      let updated_dates = document.getElementById('Select-dates');
      let selectedUserZonesString = '';
      let selectedUserCompaniesString = '';
      let user_language = document.getElementById('user_language');
      let press_user_title = document.getElementById('press_user_title');
      let press_user = document.getElementById('press_user');
      const zonesSelect = document.getElementById('userZones');
      let user_zones_update = document.getElementById('select2-userZones-container');
      let update_itwa = document.getElementById('itwa');
      let update_workspace = document.getElementById('workspace');
      let update_card_number = document.getElementById('press-id');
      let update_special_request = document.getElementById('special_requests');
      let update_media_type = document.getElementById("update_media_type");
      let update_user_address = document.getElementById('update_user_address');

      $('#userCompany').on('change', function () {
        var selectedUserCompanies = $(this).val();
        selectedUserCompaniesString = selectedUserCompanies.join(', ');
      });

   // Update the selectedUserZonesString variable based on the current selection
  function updateSelectedUserZonesString() {
  if (selectedUserZonesString === '') {
  selectedUserZonesString = user_zones_update.textContent.trim();
  }
  const selectedOptions = Array.from(zonesSelect.selectedOptions).map(option => option.value);
  selectedUserZonesString = selectedOptions.join(',');
  console.log('Selected zones:', selectedUserZonesString);
  saveUserZones();
  }

// Update the zones based on the selected user type
userTypeUpdate.addEventListener('change', async () => {
  const userType = userTypeUpdate.value;
  if (userType !== '') {
    const profilesRef = doc(db, 'profiles', userType);
    try {
      const profilesSnapshot = await getDoc(profilesRef);
      if (profilesSnapshot.exists()) {
        const zones = profilesSnapshot.data().zones;
        // Update the options for the zones select
        const allOptions = zonesSelect.options;
        for (let i = 0; i < allOptions.length; i++) {
          const option = allOptions[i];
          if (zones.includes(option.value)) {
            option.selected = true;
          } else if (option.selected) {
            option.selected = false;
          }
        }
        $(zonesSelect).trigger('change.select2');
        selectedUserZonesString = user_zones_update.textContent.trim();
        // Update the selectedUserZonesString variable based on the current selection
        updateSelectedUserZonesString();
        // Save the user's zones when the user type is changed
        saveUserZones();
      } else {
        console.log('Error getting document(s):', error);
      }
    } catch (error) {
      console.log('Error getting document:', error);
    }
  } else {
    console.log('Error: "userType" is empty.');
  }
});

// Update the selectedUserZonesString variable whenever the zones select element changes
zonesSelect.addEventListener('change', () => {
  updateSelectedUserZonesString();
  console.log('Updating user zones:', selectedUserZonesString);
});

// Save the user's zones to the database
function saveUserZones() {
  const userRef = doc(db, 'users', user_specific_id.value);
  setDoc(userRef, {
    user_zones: selectedUserZonesString !== '' ? selectedUserZonesString : '',
  }, { merge: true })
  .then(() => {
    console.log('User zones updated successfully.');
  })
  .catch((error) => {
    console.log('Error updating user zones:', error);
  });
}

/*=================================================================================================================================================
 * This code snippet manages user zone selection, updates the last sign-in date in Firestore, and handles profile picture retrieval and display.
 * It ensures user zones are updated, tracks sign-in activity, and dynamically displays profile pictures based on the user's ID.
==================================================================================================================================================*/

let update_user_zone = document.getElementById('userZones');

createOptions(update_user_zone);
setDoc(userRef, {
last_signin_date: new Date()
}, { merge: true })
.then(() => {
  console.log('press data successfully updated');
})
.catch((err) => {
  console.log('there was a problem signin user', err);
  toastr.error('There was an error signin user');
})
$('#userZones').on('change', function () {
  updateSelectedUserZonesString();
});

$(document).on('click', '#open_modal_btn', function () {
  let row = event.target.closest('.tabulator-row');
const img = document.getElementById('specific_user_img');
let idCell = row.querySelector('div[tabulator-field="id"]');

img.setAttribute('src', 'https://uploads-ssl.webflow.com/6453e5fbbb9ef87f5979b611/6453e5fbbb9ef8507179b64c_profile%20picture.png');

getDownloadURL(ref(storage, `profiles/${idCell.textContent}`))
  .then((url) => {
    // Update image src
    img.setAttribute('src', url);
  })
  .catch((error) => {
    // Manege errors
    console.log(error);
  });
});

/*========================================================================================================================================================
 * The code enables users to update their profile picture by uploading an image file or capturing a snapshot from a webcam. It utilizes the CropperJS
 * library for image cropping and the WebcamJS library for webcam access. The code includes event listeners for file input changes, webcam activation,
 * and snapshot capture. It also provides functions for updating the profile picture and handling form submissions.
=========================================================================================================================================================*/

const updatedPicture = document.getElementById('updated_picture');
const hidden_input = document.getElementById('hidden_input2');
const update_photo_modal = document.getElementById('update_photo_modal');
let cropper = null;
let isPhotoUploaded = false;

if (updatedPicture) {
  updatedPicture.addEventListener('change', function handleProfilePic(e) {
  e.preventDefault();
  e.stopPropagation();

  let fileItem = updatedPicture.files[0];

  if (updatedPicture.files.length === 0) {
    toastr.error('Please upload your profile picture');
    isPhotoUploaded = false; // Actualizamos la variable a false
  } else {
    // Check if the file is an image
    if (/^image\/\w+/.test(fileItem.type)) {
      // Destroy the current cropper instance if it exists
      if (cropper) {
        let image_cropper = document.querySelector(".cropper-container.cropper-bg")
        cropper.destroy();
        cropper = null;
        image_cropper.style.display = 'none';
      }
      // Initialize the cropper
      const image = document.getElementById('image_cropper2');
      image.src = URL.createObjectURL(fileItem);
      cropper = new Cropper(image, {
        aspectRatio: 3 / 4,
        width: 200,
        height: 200,
        viewMode: 1,
        autoCropArea: 0.7,
        responsive: true,
        crop(event) {
          // Get the cropped canvas data as a data URL
          const canvas = cropper.getCroppedCanvas();
          const dataURL = canvas.toDataURL();
          // Set the data URL as the value of the hidden input field
          hidden_input.value = dataURL;
        },
      });

      isPhotoUploaded = true;
    } else {
      toastr.error('Please choose an image file.');
      isPhotoUploaded = false;
    }
  }
})
}

function updateProfilePic2(e, user) {
  e.preventDefault();
  e.stopPropagation();
  let update_img_user_id = document.getElementById('update_img_user_id');

  if (cropper || isPhotoUploaded) {
    const canvas = cropper.getCroppedCanvas();
    const metadata = {
      contentType: 'image/png',
    };
    canvas.toBlob((blob) => {
      const storageRef = ref(storage, 'profiles/' + update_img_user_id.value);
      uploadBytes(storageRef, blob, metadata)
        .then((snapshot) => {
          toastr.success('You have updated the profile picture successfully');
          setTimeout(function () {
            update_picture_modal.style.display = 'none';
          }, 1000);
        })
        .catch((err) => {
          console.log('error uploading file', err);
          toastr.error('There was an error uploading the file');
        });
        console.log(isPhotoUploaded)
    });
  } else if (isPhotoUploaded != true){
   toastr.error('Please upload your profile picture');
  }
}

function updateFileLabel() {
  const fileName = document.getElementById('fileName');
  fileName.innerHTML = updatedPicture.files[0].name;
}

// Start the webcam with WebcamJS
function startWebcam() {
  // Destroy Cropper if exists
  if (cropper) {
    cropper.destroy();
    cropper = null;
  }
  Webcam.set({
    width: 320,
    height: 240,
    dest_width: 640,
    dest_height: 480,
    image_format: 'png',
  });

  // Start camera
  Webcam.attach('#camera');
}

// Take a picture with the webcam and open CropperJS
function takeSnapshotAndOpenCropper() {
  Webcam.snap(function(dataURL) {
    // Initialize CropperJS with the captured image
    const image = document.getElementById('image_cropper2');
    image.src = dataURL;
    cropper = new Cropper(image, {
      aspectRatio: 3 / 4,
      width: 200,
      height: 200,
      viewMode: 1,
      autoCropArea: 0.7,
      responsive: true,
      crop(event) {
        // Get the cropped canvas data as a data URL
        const canvas = cropper.getCroppedCanvas();
        const dataURL = canvas.toDataURL();
        // Set the data URL as the value of the hidden input field
        hidden_input.value = dataURL;
      },
    });
    // Set the flag for successful photo upload
    isPhotoUploaded = true;
    // Turn off the camera
    Webcam.reset();
  });
}
//Close the take picture modal
var modal7 = document.getElementById("take_picture_modal");
var span7 = document.getElementsByClassName("close7")[0];

if(span7 || modal7){
span7.onclick=function(){
modal7.style.display="none";
$('body').removeClass('modal-open');
Webcam.reset();
}
}

// Add the event listener to the button to start the webcam and take the photo.
document.getElementById('snapshotButton').addEventListener('click', function() {
  // Start the webcam
  startWebcam();
  document.getElementById('take_picture_modal').style.display = 'block';
});

// Add the button to take a photo and open CropperJS.
const snapshotBtn = document.getElementById('take_photo');
snapshotBtn.addEventListener('click', function() {
  takeSnapshotAndOpenCropper();
  document.getElementById('take_picture_modal').style.display = 'none';
});

if (update_picture_modal !== null) {
  update_picture_modal.addEventListener('submit', function (ev) {
    ev.preventDefault();
    ev.stopPropagation();
    updateProfilePic2(ev, user);
  }, true);
}

/*==================================================================================================================================================================
 * This function handles the form submission event for updating a user's information. It prevents the default form submission behavior and stops event propagation.
 * It retrieves the necessary form elements and checks if the user ID is valid. Then, it updates the user's information in the database and sends an email
 * notification based on the user's status and language.
===================================================================================================================================================================*/

update_user_form.addEventListener('submit', (e) => {
  e.preventDefault();
  e.stopPropagation();
  const send_email = document.getElementById('send_email')

  if (user_specific_id != null || user_specific_id != 0) {
    const userRef = doc(db, 'users', user_specific_id.value);

    // Check if basic admin value is undefined
    if ( typeof basic_admin_update.value === 'undefined' || basic_admin_update.value == false ) {
      basic_admin_update.value = 0;
    }
    console.log('basic admin variable', basic_admin_update);
    console.log('basic admin value', basic_admin_update.value);

    setDoc(userRef, {
      user_type: userTypeUpdate.value,
      account_type: accountTypeUpdate.value,
      user_status: user_status_update.value,
      user_company: selectedUserCompaniesString,
      user_zones: selectedUserZonesString,
      company_admin: company_admin.value,
      supplier_visit_dates: updated_dates.value,
      basic_admin: basic_admin_update.value,
      user_itwa: update_itwa.value,
      press_workspot: update_workspace.value,
      press_card_number: update_card_number.value,
      press_media_type: update_media_type.value,
      user_address: update_user_address.value,
      supplier_special_request: update_special_request.value
    }, { merge: true })
      .then(() => {
        console.log('sending email... status is', user_status_update.value);
        console.log('stored lang for email is', storedLang);

        if(press_user.textContent == '1'){
          if(press_user_title.textContent == 'Mr'){
            if (user_status_update.value == 'Declined') {
          if(user_language.value == 'en'){
           // Press - EN - Mr - Application rejected
           (async () => {
            if(send_email.checked) {
            try {
            const fullName = `${admin_user_name.value}`;
            const html = await fetch(press_en_mr_application_rejected_url)
                .then(response => response.text())
                .then(html => html.replace('${fullName}', fullName))
            const docRef = addDoc(collection(db, "mail"), {
              to: `${user_specific_email.value}`,
              message: {
                subject: press_en_application_rejected_subject,
                    html: html,
              }
              });
            } catch (e) {
              console.error("Error declining user: ", e);
            }
            }
            toastr.success('User registration declined');
            document.getElementById('update_user_modal').style.display = 'none';
            })();
            }else {
             // Press - DE - Mr - Application rejected
             (async () => {
              if(send_email.checked) {
              try {
                const fullName = `${admin_user_name.value}`;
                const html = await fetch(press_de_mr_application_rejected_url)
                    .then(response => response.text())
                    .then(html => html.replace('${fullName}', fullName))
                const docRef = addDoc(collection(db, "mail"), {
                  to: `${user_specific_email.value}`,
                  message: {
                    subject: press_de_application_rejected_subject,
                        html: html,
                  }
                  });
                } catch (e) {
                  console.error("Error declining user: ", e);
                }
              }
                toastr.success('User registration declined');
                document.getElementById('update_user_modal').style.display = 'none';
            })();
            }
            } else {
              if(user_language.value == 'en'){
                // Press - EN - Mr - Application accepted
                (async () => {
                  if(send_email.checked) {
              try {
                const fullName = `${admin_user_name.value}`;
                const html = await fetch(press_en_mr_application_accepted_url)
                    .then(response => response.text())
                    .then(html => html.replace('${fullName}', fullName))
                const docRef = addDoc(collection(db, "mail"), {
                  to: `${user_specific_email.value}`,
                  message: {
                    subject: press_en_application_accepted_subject,
                    html: html,
                  }
                });
                    console.log("Document written with ID: ", docRef.id);
                  } catch (e) {
                    console.error("Error adding document: ", e);
                  }
                }
                toastr.success('User registration accepted');
                document.getElementById('update_user_modal').style.display = 'none';
                })();
                }else {
                  // Press - DE - Mr - Application accepted
                  (async () => {
                    if(send_email.checked) {
                  try {
                    const fullName = `${admin_user_name.value}`;
                    const html = await fetch(press_de_mr_application_accepted_url)
                    .then(response => response.text())
                    .then(html => html.replace('${fullName}', fullName))
                    const docRef = addDoc(collection(db, "mail"), {
                      to: `${user_specific_email.value}`,
                      message: {
                        subject: press_de_application_accepted_subject,
                        html: html,
                      }
                    });
                    console.log("Document written with ID: ", docRef.id);
                  } catch (e) {
                    console.error("Error adding document: ", e);
                  }
                }
                toastr.success('Benutzerregistrierung akzeptiert');
                document.getElementById('update_user_modal').style.display = 'none';
                })();
                }
              $('body').removeClass('modal-open');
            }
          }if(press_user_title.textContent == 'Ms'){
            if (user_status_update.value == 'Declined') {
          if(user_language.value == 'en'){
            // Press - EN - Ms - Application rejected
            (async () => {
              if(send_email.checked) {
                  try {
                    const fullName = `${admin_user_name.value}`;
                    const html = await fetch(press_en_ms_application_rejected_url)
                    .then(response => response.text())
                    .then(html => html.replace('${fullName}', fullName))
            const docRef = addDoc(collection(db, "mail"), {
              to: `${user_specific_email.value}`,
              message: {
                subject: press_en_application_rejected_subject,
                    html: html,
              }
              });
            } catch (e) {
              console.error("Error declining user: ", e);
            }
            }
            toastr.success('User registration declined');
            document.getElementById('update_user_modal').style.display = 'none';
            })();
            }else {
              // Press - DE - Ms - Application rejected
              (async () => {
                if(send_email.checked) {
                  try {
                    const fullName = `${admin_user_name.value}`;
                    const html = await fetch(press_de_ms_application_rejected_url)
                    .then(response => response.text())
                    .then(html => html.replace('${fullName}', fullName))
            const docRef = addDoc(collection(db, "mail"), {
              to: `${user_specific_email.value}`,
              message: {
                subject: press_de_application_rejected_subject,
                    html: html,
              }
              });
            } catch (e) {
              console.error("Error declining user: ", e);
            }
            }
            toastr.success('User registration declined');
            document.getElementById('update_user_modal').style.display = 'none';
            })();
            }
            } else {
              if(user_language.value == 'en'){
                // Press - EN - Ms - Application accepted
                (async () => {
                  if(send_email.checked) {
                  try {
                    const fullName = `${admin_user_name.value}`;
                    const html = await fetch(press_en_ms_application_accepted_url)
                    .then(response => response.text())
                    .then(html => html.replace('${fullName}', fullName))
                  const docRef = addDoc(collection(db, "mail"), {
                  to: `${user_specific_email.value}`,
                  message: {
                    subject: press_en_application_accepted_subject,
                    html: html,
                  }
                });
                    console.log("Document written with ID: ", docRef.id);
                  } catch (e) {
                    console.error("Error adding document: ", e);
                  }
                }
                toastr.success('User registration accepted');
                document.getElementById('update_user_modal').style.display = 'none';
                })();
                }else {
                  // Press - DE - Ms - Application accepted
                  (async () => {
                    if(send_email.checked) {
                  try {
                    const fullName = `${admin_user_name.value}`;
                    const html = await fetch(press_de_ms_application_accepted_url)
                    .then(response => response.text())
                    .then(html => html.replace('${fullName}', fullName))
                    const docRef = addDoc(collection(db, "mail"), {
                      to: `${user_specific_email.value}`,
                      message: {
                        subject: press_de_application_accepted_subject,
                        html: html,
                      }
                    });
                    console.log("Document written with ID: ", docRef.id);
                  } catch (e) {
                    console.error("Error adding document: ", e);
                  }
                }
                toastr.success('Benutzerregistrierung akzeptiert');
                document.getElementById('update_user_modal').style.display = 'none';
                })();
                }
              $('body').removeClass('modal-open');
            }
          }if(press_user_title.textContent == 'Diverse'){
            if (user_status_update.value == 'Declined') {
          if(user_language.value == 'en'){
            // Press - EN - Diverse - Application rejected
            (async () => {
              if(send_email.checked) {
                  try {
                    const fullName = `${admin_user_name.value}`;
                    const html = await fetch(press_en_diverse_application_rejected_url)
                    .then(response => response.text())
                    .then(html => html.replace('${fullName}', fullName))
                    const docRef = addDoc(collection(db, "mail"), {
                      to: `${user_specific_email.value}`,
                      message: {
                        subject: press_en_application_rejected_subject,
                            html: html,
              }
              });
            } catch (e) {
              console.error("Error declining user: ", e);
            }
            }
            toastr.success('User registration declined');
            document.getElementById('update_user_modal').style.display = 'none';
            })();
            }else {
              // Press - DE - Diverse - Application rejected
              (async () => {
                if(send_email.checked) {
                  try {
                    const fullName = `${admin_user_name.value}`;
                    const html = await fetch(press_de_diverse_application_rejected_url)
                    .then(response => response.text())
                    .then(html => html.replace('${fullName}', fullName))
            const docRef = addDoc(collection(db, "mail"), {
              to: `${user_specific_email.value}`,
              message: {
                subject: press_de_application_rejected_subject,
                    html: html,
              }
              });
            } catch (e) {
              console.error("Error declining user: ", e);
            }
            }
            toastr.success('User registration declined');
            document.getElementById('update_user_modal').style.display = 'none';
            })();
            }
            } else {
              if(user_language.value == 'en'){
                // Press - EN - Diverse - Application accepted
                (async () => {
                  if(send_email.checked) {
                  try {
                    const fullName = `${admin_user_name.value}`;
                    const html = await fetch(press_en_diverse_application_accepted_url)
                    .then(response => response.text())
                    .then(html => html.replace('${fullName}', fullName))
                    const docRef = addDoc(collection(db, "mail"), {
                      to: `${user_specific_email.value}`,
                      message: {
                        subject: press_en_application_accepted_subject,
                        html: html,
                      }
                    });
                    console.log("Document written with ID: ", docRef.id);
                  } catch (e) {
                    console.error("Error adding document: ", e);
                  }
                }
                toastr.success('User registration accepted');
                document.getElementById('update_user_modal').style.display = 'none';
                })();
                }else {
                  // Press - DE - Diverse - Application accepted
                  (async () => {
                    if(send_email.checked) {
                  try {
                    const fullName = `${admin_user_name.value}`;
                    const html = await fetch(press_de_diverse_application_accepted_url)
                    .then(response => response.text())
                    .then(html => html.replace('${fullName}', fullName))
                    const docRef = addDoc(collection(db, "mail"), {
                      to: `${user_specific_email.value}`,
                      message: {
                        subject: press_de_application_accepted_subject,
                        html: html,
                      }
                    });
                    console.log("Document written with ID: ", docRef.id);
                  } catch (e) {
                    console.error("Error adding document: ", e);
                  }
                }
                toastr.success('Benutzerregistrierung akzeptiert');
                document.getElementById('update_user_modal').style.display = 'none';
                })();
                }
              $('body').removeClass('modal-open');
            }
          }
        }else{
        if (user_status_update.value == 'Declined') {
          if(user_language.value == 'en'){
            // Supplier - EN - Application rejected
            (async () => {
              if(send_email.checked) {
                  try {
                    const fullName = `${admin_user_name.value}`;
                    const html = await fetch(supplier_en_application_rejected_url)
                    .then(response => response.text())
                    .then(html => html.replace('${fullName}', fullName))
            const docRef = addDoc(collection(db, "mail"), {
              to: `${user_specific_email.value}`,
              message: {
                subject: press_en_application_rejected_subject,
                    html: html,
              }
              });
            } catch (e) {
              console.error("Error declining user: ", e);
            }
            }
            toastr.success('User registration declined');
            document.getElementById('update_user_modal').style.display = 'none';
            })();
            }else {
              // Supplier - DE - Application rejected
              (async () => {
                if(send_email.checked) {
                  try {
                    const fullName = `${admin_user_name.value}`;
                    const html = await fetch(supplier_de_application_rejected_url)
                    .then(response => response.text())
                    .then(html => html.replace('${fullName}', fullName))
            const docRef = addDoc(collection(db, "mail"), {
              to: `${user_specific_email.value}`,
              message: {
                subject: press_de_application_rejected_subject,
                    html: html,
              }
              });
            } catch (e) {
              console.error("Error declining user: ", e);
            }
            }
            toastr.success('User registration declined');
            document.getElementById('update_user_modal').style.display = 'none';
            })();
            }
          } else {
              if(user_language.value == 'en'){
                // Supplier - EN - Application accepted
                (async () => {
                  if(send_email.checked) {
                  try {
                    const fullName = `${admin_user_name.value}`;
                    const html = await fetch(supplier_en_application_accepted_url)
                    .then(response => response.text())
                    .then(html => html.replace('${fullName}', fullName))
                const docRef = addDoc(collection(db, "mail"), {
                  to: `${user_specific_email.value}`,
                  message: {
                    subject: press_en_application_accepted_subject,
                    html: html,
                  }
                });
                    console.log("Document written with ID: ", docRef.id);
                  } catch (e) {
                    console.error("Error adding document: ", e);
                  }
                  }
                  toastr.success('User registration accepted');
                document.getElementById('update_user_modal').style.display = 'none';
                })();
                }else {
                  // Supplier - DE - Application accepted
                  (async () => {
                    if(send_email.checked) {
                  try {
                    const fullName = `${admin_user_name.value}`;
                    const html = await fetch(supplier_de_application_accepted_url)
                    .then(response => response.text())
                    .then(html => html.replace('${fullName}', fullName))
                    const docRef = addDoc(collection(db, "mail"), {
                      to: `${user_specific_email.value}`,
                      message: {
                        subject: press_de_application_accepted_subject,
                        html: html,
                      }
                    });
                    console.log("Document written with ID: ", docRef.id);
                  } catch (e) {
                    console.error("Error adding document: ", e);
                  }
                  }
                  toastr.success('Benutzerregistrierung akzeptiert');
                  document.getElementById('update_user_modal').style.display = 'none';
                })();
                }
              $('body').removeClass('modal-open');
            }
          }
          saveUserZones();
      })
      .catch((err) => {
         toastr.error('There was an error updating the account info');
         console.log('error updating account info', err);
     });
    }
   });

/*===============================================================================================================================================================
 * This function handles the form submission event for deleting a user. It prevents the default form submission behavior, retrieves the user ID to be deleted,
 * and updates the user's information in the database to mark it as deleted. It displays a success message if the deletion is successful, or an error message
 * otherwise.
================================================================================================================================================================*/

   const delete_user_form = document.getElementById('delete_user_modal');
   const delete_user_id = document.getElementById('deleted_user_id');
  //Delete user
delete_user_form.addEventListener('submit', (e) => {
  e.preventDefault();
  e.stopPropagation();

  if (delete_user_id != null || delete_user_id != 0) {
    const userRef = doc(db, 'users', delete_user_id.value);

    setDoc(userRef, {
      user_deleted: '1',
      confirmed_email:"0"
    }, { merge: true })
      .then(() => {
        toastr.success('User succesfully deleted');
      })
      .catch((err) => {
        toastr.error('There was an error deleting the account');
        console.log('error deleting account', err);
      });
  }
});
let selectedData = [];
console.log(selectedData);
          //Bulk users update
          async function bulkUserUpdate(selectedData) {
          let bulk_user_form = document.getElementById('bulk_user_form');
          let bulk_status_update = document.getElementById('bulk_status');

          for (let i = 0; i < selectedData.length; i++) {
          const userRef = doc(db, 'users', selectedData[i]);
          const userData = await getDoc(userRef);
          if(userData.exists){
            setDoc(userRef, {
                user_status: bulk_status_update.value,
            }, { merge: true })
                .then(() => {
                  if(userData.data().press_form_user == '1'){
                  if(userData.data().user_title == 'Mr'){
                  if(bulk_status_update.value == 'Declined'){
                    if(userData.data().language == 'en'){
                      // Press - EN - Mr - Application rejected
                      (async () => {
                    try {
                    const fullName = `${userData.data().user_firstname} ${userData.data().user_lastname}`;
                    const html = await fetch(press_en_mr_application_rejected_url)
                        .then(response => response.text())
                        .then(html => html.replace('${press_firstname.value} ${press_lastname.value}', fullName))
                    const docRef = addDoc(collection(db, "mail"), {
                      to: `${user_specific_email.value}`,
                      message: {
                        subject: press_en_application_rejected_subject,
                            html: html,
                      }
                      });
                    } catch (e) {
                      console.error("Error declining user: ", e);
                    }
                    toastr.success('User registration declined');
                    document.getElementById('update_user_modal').style.display = 'none';
                    })();
                    toastr.success('User registration declined');
                    setTimeout(function() {
                      window.location.reload();
                    }, 1500);
                    }else{
                      // Press - DE - Mr - Application rejected
                      (async () => {
                    try {
                      const fullName = `${userData.data().user_firstname} ${userData.data().user_lastname}`;
                      const html = await fetch(press_de_mr_application_rejected_url)
                          .then(response => response.text())
                          .then(html => html.replace('${press_firstname.value} ${press_lastname.value}', fullName))
                      const docRef = addDoc(collection(db, "mail"), {
                        to: `${user_specific_email.value}`,
                        message: {
                          subject: press_de_application_rejected_subject,
                              html: html,
                        }
                        });
                      } catch (e) {
                        console.error("Error declining user: ", e);
                      }
                      toastr.success('User registration declined');
                      document.getElementById('update_user_modal').style.display = 'none';
                      })();
                        toastr.success('User registration declined');
                        setTimeout(function() {
                          window.location.reload();
                        }, 1500);
                        }
                    }else{
                    if(userData.data().language == 'en'){
                    // Press - EN - Mr - Application accepted
                      (async () => {
                  try {
                    const fullName = `${userData.data().user_firstname} ${userData.data().user_lastname}`;
                    const html = await fetch(press_en_mr_application_accepted_url)
                        .then(response => response.text())
                        .then(html => html.replace('${press_firstname.value} ${press_lastname.value}', fullName))
                    const docRef = addDoc(collection(db, "mail"), {
                      to: `${user_specific_email.value}`,
                      message: {
                        subject: press_en_application_accepted_subject,
                        html: html,
                      }
                    });
                        console.log("Document written with ID: ", docRef.id);
                      } catch (e) {
                        console.error("Error adding document: ", e);
                      }
                        toastr.success('Account info has been successfully updated');
                        setTimeout(function() {
                          window.location.reload();
                        }, 2000);
                      })();
                    }else{
                    // Press - DE - Mr - Application accepted
                   (async () => {
                  try {
                    const fullName = `${userData.data().user_firstname} ${userData.data().user_lastname}`;
                    const html = await fetch(press_de_mr_application_accepted_url)
                    .then(response => response.text())
                    .then(html => html.replace('${press_firstname.value} ${press_lastname.value}', fullName))
                    const docRef = addDoc(collection(db, "mail"), {
                      to: `${user_specific_email.value}`,
                      message: {
                        subject: press_de_application_accepted_subject,
                        html: html,
                      }
                    });
                    console.log("Document written with ID: ", docRef.id);
                    } catch (e) {
                    console.error("Error adding document: ", e);
                    }
                    toastr.success('Account info has been successfully updated');
                    setTimeout(function() {
                      window.location.reload();
                    }, 2000);
                  })();
                    }
                  }
                    }if(userData.data().user_title == 'Ms'){
                  if(bulk_status_update.value == 'Declined'){
                    if(userData.data().language == 'en'){
                      // Press - EN - Ms - Application rejected
                    (async () => {
                          try {
                            const fullName = `${userData.data().user_firstname} ${userData.data().user_lastname}`;
                            const html = await fetch(press_en_ms_application_rejected_url)
                            .then(response => response.text())
                            .then(html => html.replace('${press_firstname.value} ${press_lastname.value}', fullName))
                    const docRef = addDoc(collection(db, "mail"), {
                      to: `${user_specific_email.value}`,
                      message: {
                        subject: press_en_application_rejected_subject,
                            html: html,
                      }
                      });
                    } catch (e) {
                      console.error("Error declining user: ", e);
                    }
                    toastr.success('User registration declined');
                    document.getElementById('update_user_modal').style.display = 'none';
                    })();
                    }else{
                      // Press - DE - Ms - Application rejected
                 (async () => {
                  try {
                    const fullName = `${userData.data().user_firstname} ${userData.data().user_lastname}`;
                    const html = await fetch(press_de_ms_application_rejected_url)
                    .then(response => response.text())
                    .then(html => html.replace('${press_firstname.value} ${press_lastname.value}', fullName))
                    const docRef = addDoc(collection(db, "mail"), {
                      to: `${user_specific_email.value}`,
                      message: {
                        subject: press_de_application_rejected_subject,
                            html: html,
                      }
                      });
                    } catch (e) {
                      console.error("Error declining user: ", e);
                    }
                    toastr.success('User registration declined');
                    document.getElementById('update_user_modal').style.display = 'none';
                    })();
                        }
                    }else{
                    if(userData.data().language == 'en'){
                      // Press - EN - Ms - Application accepted
                  (async () => {
                    try {
                    const fullName = `${userData.data().user_firstname} ${userData.data().user_lastname}`;
                    const html = await fetch(press_en_ms_application_accepted_url)
                        .then(response => response.text())
                        .then(html => html.replace('${press_firstname.value} ${press_lastname.value}', fullName))
                      const docRef = addDoc(collection(db, "mail"), {
                      to: `${user_specific_email.value}`,
                      message: {
                        subject: press_en_application_accepted_subject,
                        html: html,
                      }
                    });
                        console.log("Document written with ID: ", docRef.id);
                      } catch (e) {
                        console.error("Error adding document: ", e);
                      }
                    })();
                    }else{
                   // Press - DE - Ms - Application accepted
                  (async () => {
                  try {
                    const fullName = `${userData.data().user_firstname} ${userData.data().user_lastname}`;
                    const html = await fetch(press_de_ms_application_accepted_url)
                    .then(response => response.text())
                    .then(html => html.replace('${press_firstname.value} ${press_lastname.value}', fullName))
                    const docRef = addDoc(collection(db, "mail"), {
                      to: `${user_specific_email.value}`,
                      message: {
                        subject: press_de_application_accepted_subject,
                        html: html,
                      }
                    });
                    console.log("Document written with ID: ", docRef.id);
                  } catch (e) {
                    console.error("Error adding document: ", e);
                  }
                })();
                    }
                  }
                    }if(userData.data().user_title == 'Diverse'){
                  if(bulk_status_update.value == 'Declined'){
                    if(userData.data().language == 'en'){
                // Press - EN - Diverse - Application rejected
                (async () => {
                  try {
                    const html = await fetch(press_en_diverse_application_rejected_url)
                    .then(response => response.text())
                    const docRef = addDoc(collection(db, "mail"), {
                      to: `${user_specific_email.value}`,
                      message: {
                        subject: press_en_application_rejected_subject,
                        html: html,
                  }
                  });
                  } catch (e) {
                    console.error("Error declining user: ", e);
                  }
                  toastr.success('User registration declined');
                  document.getElementById('update_user_modal').style.display = 'none';
                  })();
                          }else{
               // Press - DE - Diverse - Application rejected
              (async () => {
                  try {
                    const html = await fetch(press_de_diverse_application_rejected_url)
                    .then(response => response.text())
                    const docRef = addDoc(collection(db, "mail"), {
                      to: `${user_specific_email.value}`,
                      message: {
                        subject: press_de_application_rejected_subject,
                        html: html,
                      }
                      });
                    } catch (e) {
                      console.error("Error declining user: ", e);
                    }
                    toastr.success('User registration declined');
                    })();
                        }
                    }else{
                    if(userData.data().language == 'en'){
                  // Press - EN - Diverse - Application accepted
                (async () => {
                  try {
                    const html = await fetch(press_en_diverse_application_accepted_url)
                    .then(response => response.text())
                const docRef = addDoc(collection(db, "mail"), {
                  to: `${user_specific_email.value}`,
                  message: {
                    subject: press_en_application_accepted_subject,
                    html: html,
                  }
                  });
                    console.log("Document written with ID: ", docRef.id);
                  } catch (e) {
                    console.error("Error adding document: ", e);
                  }
                  toastr.success('User registration accpeted');
                    setTimeout(function() {
                      window.location.reload();
                    }, 2000);
                  })();
                    }else{
                      // Press - DE - Diverse - Application accepted
                  (async () => {
                  try {
                    const html = await fetch(press_de_diverse_application_accepted_url)
                    .then(response => response.text())
                    const docRef = addDoc(collection(db, "mail"), {
                      to: `${user_specific_email.value}`,
                      message: {
                        subject: press_de_application_accepted_subject,
                        html: html,
                      }
                    });
                    console.log("Document written with ID: ", docRef.id);
                  } catch (e) {
                    console.error("Error adding document: ", e);
                  }
                    toastr.success('User registration accepted');
                    setTimeout(function() {
                      window.location.reload();
                    }, 2000);
                  })();
                    }
                  }
                    }
                   }else{
                    if(bulk_status_update.value == 'Declined'){
                    if(userData.data().language == 'en'){
                // Supplier - EN - Application rejected
                (async () => {
                  try {
                    const fullName = `${userData.data().user_firstname} ${userData.data().user_lastname}`;
                    const html = await fetch(supplier_en_application_rejected_url)
                    .then(response => response.text())
                    .then(html => html.replace('${admin_user_name.value} ${admin_user_lastname.value}', fullName))
                    const docRef = addDoc(collection(db, "mail"), {
                      to: `${user_specific_email.value}`,
                      message: {
                        subject: press_en_application_rejected_subject,
                            html: html,
                      }
                      });
                    } catch (e) {
                      console.error("Error declining user: ", e);
                    }
                    toastr.success('User registration declined');
                    setTimeout(function() {
                      window.location.reload();
                    }, 1500);
                    })();
                    }else{
                   // Supplier - DE - Application rejected
                  (async () => {
                  try {
                    const fullName = `${userData.data().user_firstname} ${userData.data().user_lastname}`;
                    const html = await fetch(supplier_de_application_rejected_url)
                    .then(response => response.text())
                    .then(html => html.replace('${admin_user_name.value} ${admin_user_lastname.value}', fullName))
                      const docRef = addDoc(collection(db, "mail"), {
                        to: `${user_specific_email.value}`,
                        message: {
                          subject: press_de_application_rejected_subject,
                              html: html,
                        }
                        });
                      } catch (e) {
                        console.error("Error declining user: ", e);
                      }
                      toastr.success('User registration declined');
                      toastr.success('User registration declined');
                        setTimeout(function() {
                          window.location.reload();
                        }, 1500);
                      })();
                        }
                    }else{
                    if(userData.data().language == 'en'){
                      // Supplier - EN - Application accepted
                (async () => {
                  try {
                    const fullName = `${userData.data().user_firstname} ${userData.data().user_lastname}`;
                    const html = await fetch(supplier_en_application_accepted_url)
                    .then(response => response.text())
                    .then(html => html.replace('${admin_user_name.value} ${admin_user_lastname.value}', fullName))
                    const docRef = addDoc(collection(db, "mail"), {
                    to: `${user_specific_email.value}`,
                    message: {
                      subject: press_en_application_accepted_subject,
                      html: html,
                    }
                    });
                    console.log("Document written with ID: ", docRef.id);
                  } catch (e) {
                    console.error("Error adding document: ", e);
                  }
                  toastr.success('Account info has been successfully updated');
                    setTimeout(function() {
                      window.location.reload();
                    }, 2000);
                    })();
                    }else{
                     // Supplier - DE - Application accepted
                  (async () => {
                  try {
                    const fullName = `${userData.data().user_firstname} ${userData.data().user_lastname}`;
                    const html = await fetch(supplier_de_application_accepted_url)
                    .then(response => response.text())
                    .then(html => html.replace('${admin_user_name.value} ${admin_user_lastname.value}', fullName))
                    const docRef = addDoc(collection(db, "mail"), {
                      to: `${user_specific_email.value}`,
                      message: {
                        subject: press_de_application_accepted_subject,
                        html: html,
                      }
                    });
                    console.log("Document written with ID: ", docRef.id);
                  } catch (e) {
                    console.error("Error adding document: ", e);
                  }
                  toastr.success('Account info has been successfully updated');
                    setTimeout(function() {
                      window.location.reload();
                    }, 2000);
                })();
                    }
                  }
                   }
                })
                .catch((err) => {
                    toastr.error('There was an error updating the users info');
                    console.log('error updating users info', err);
                });
          }
        }
        }
        document.getElementById("bulk_user_form").addEventListener("submit", function(e){
          e.preventDefault();
          e.stopPropagation();
          bulkUserUpdate(selectedData);
        });

/*=================================================================================================================================================================
 * This code segment handles the creation of user forms. It dynamically populates select dropdowns with options from the database, such as companies and profiles.
 * It also includes event listeners to capture user input and trigger actions accordingly. The createUser function creates a new user in the database using the
 * provided form inputs. It also handles the upload of a profile picture and associates it with the newly created user. Overall, this code enables the creation of
 * user accounts with various details and functionalities.
==================================================================================================================================================================*/

        //CREATE USERS FORM
        let selectedCreateUserZonesString = '';

        //Print companies select
        let select = document.getElementById('userCompany');
          getDocs(company_colRef)
          .then((snapshot) => {
            snapshot.docs.forEach((doc) => {
              let company = doc.data();

              var opt = document.createElement('option');
              opt.value = doc.id;
              opt.textContent = company.company_name;
              select.appendChild(opt);
            });
          })
          .catch(err => {
            console.log('error fetching companies', err);
          })
          //Print profiles select
        let user_type_select = document.getElementById('new_user_type');
        const profilesRef = collection(db, 'profiles');
          getDocs(profilesRef)
          .then((snapshot) => {
            snapshot.docs.forEach((doc) => {
              let profile = doc.data();

              var opt = document.createElement('option');
              opt.value = doc.id;
              opt.textContent = profile.profile_name;
              user_type_select.appendChild(opt);
            });
          })
          .catch(err => {
            console.log('error fetching companies', err);
          });

          //Print zones select
          const create_user_zone = document.getElementById('createUserZones');

              createOptions(create_user_zone);

            setDoc(userRef, {
              last_signin_date: new Date()
            }, { merge: true })
            .then(() => {
                console.log('press data successfully updated');
            })
            .catch((err) => {
                console.log('there was a problem signin user', err);
                toastr.error('There was an error signin user');
            })

            $('#createUserZones').on('change', function () {
        var selectedValues = $(this).val();
        selectedValuesString = selectedValues.join(', ');
      });

      // Update the zones based on the selected user type
      const create_user_zones_container = document.getElementById('select2-createUserZones-container');
      const new_user_profile = document.getElementById('new_user_profile');

      new_user_profile.addEventListener('change', async () => {
  const userProfile = new_user_profile.value;
  if (userProfile !== '') {
    const profilesRef = doc(db, 'profiles', userProfile);
    try {
      const profilesSnapshot = await getDoc(profilesRef);
      if (profilesSnapshot.exists()) {
        const zones = profilesSnapshot.data().zones;
        // Update the options for the zones select
        const allOptions = create_user_zone.options;
        for (let i = 0; i < allOptions.length; i++) {
          const option = allOptions[i];
          if (zones.includes(option.value)) {
            option.selected = true;
          } else if (option.selected) {
            option.selected = false;
          }
        }
        $(create_user_zone).trigger('change.select2');
        selectedCreateUserZonesString = create_user_zones_container.textContent.trim();
        // Update the selectedCreateUserZonesString variable based on the current selection
        updateSelectedCreateUserZonesString();
      } else {
        console.log('Error getting document(s):', error);
      }
    } catch (error) {
      console.log('Error getting document:', error);
    }
  } else {
    console.log('Error: "userType" is empty.');
  }
 });

 // Update the selectedCreateUserZonesString variable based on the current selection
 function updateSelectedCreateUserZonesString() {
  if (selectedCreateUserZonesString === '') {
    selectedCreateUserZonesString = user_zones_update.textContent.trim();
  }
  const selectedOptions = Array.from(create_user_zone.selectedOptions).map(option => option.value);
  selectedCreateUserZonesString = selectedOptions.join(',');
  console.log('Selected zones:', selectedCreateUserZonesString);
  }

// Update the selectedCreateUserZonesString variable whenever the zones select element changes
create_user_zone.addEventListener('change', () => {
  updateSelectedCreateUserZonesString();
  console.log('Updating user zones:',selectedCreateUserZonesString);
});
      let new_user_firstname = document.getElementById('new_user_firstname');
      let new_user_lastname = document.getElementById('new_user_lastname');
      let new_user_fullname = "";
      let new_user_account_type = document.getElementById('new_user_account_type');
      let new_user_company = document.getElementById('new_user_company');
      let newUserCompaniesString = '';

      console.log(new_user_fullname);

      $('#new_user_company').on('change', function () {
        var selectedNewUserCompanies = $(this).val();
        newUserCompaniesString = selectedNewUserCompanies.join(', ');
      });

     //Print companies select
    getDocs(company_colRef)
      .then((snapshot) => {
        const companies = snapshot.docs.map((doc) => doc.data());
        const sortedCompanies = companies.sort((a, b) => a.company_name.localeCompare(b.company_name));

        sortedCompanies.forEach((company) => {
          var opt = document.createElement('option');
          opt.value = company.company_id;
          opt.textContent = company.company_name;
          new_user_company.appendChild(opt);
        });
      })
      .catch((err) => {
        console.log('error fetching companies', err);
      });
          //Print profiles select
          getDocs(profilesRef)
          .then((snapshot) => {
            snapshot.docs.forEach((doc) => {
              let profile = doc.data();

              var opt = document.createElement('option');
              opt.value = doc.id;
              opt.textContent = profile.profile_name;
              new_user_profile.appendChild(opt);
            });
          })
          .catch(err => {
            console.log('error fetching companies', err);
          })

      async function createUser(user) {
        if (!upload_cropper) {
            toastr.error('Please select an image to upload');
            return;
          }
          if (new_user_firstname.value && new_user_lastname.value) {
        new_user_fullname = (new_user_firstname.value + new_user_lastname.value).toLowerCase().replace(/\s/g, '');
      }

        let storedLang = localStorage.getItem("language");
        let companyRef;
        companyRef = await addDoc(collection(db, "users"), {
            user_firstname: new_user_firstname.value,
            user_lastname: new_user_lastname.value,
            account_type: new_user_account_type.value,
            user_company: newUserCompaniesString,
            user_type: new_user_profile.value,
            user_status: 'Pending',
            company_admin: '0',
            basic_admin: '0',
            confirmed_email: '1',
            language: storedLang,
            press_form_user: '0',
            press_media: '',
            press_media_type: '',
            press_workspot: '',
            user_address: '',
            user_city: '',
            user_country: '',
            user_email: '',
            user_is_admin: '0',
            user_itwa:'',
            user_nationality:'',
            user_phone:'',
            user_title:'',
            user_zip_code:'',
            user_fullname: new_user_fullname,
            user_zones: selectedCreateUserZonesString,
            supplier_start_date: '06-24-2023',
            supplier_end_date: '07-01-2023',
            user_deleted:'0'
          })
          .then((companyRef) => {
            userUploadImage(companyRef.id);
            if(storedLang == 'de'){
              toastr.success('Benutzer wurde erfolgreich erstellt');
            }else{
              toastr.success('User has been successfully created');
            }
            setTimeout(function() {
              window.location.reload();
            }, 2000);
          })
          .catch((err) => {
            toastr.error('There was an error creating the company');
            console.log('error creating user', err);
          });
      }

      //Upload profile picture
      const uploadPicture = document.getElementById('upload_picture');
      const hiddenInput = document.getElementById('hidden_input');
      let upload_cropper;
      if (uploadPicture) {
        uploadPicture.addEventListener('change', function ulploadProfilePic(e) {
          e.preventDefault();
          e.stopPropagation();

          let fileItem = uploadPicture.files[0];

          if (uploadPicture.files.length === 0) {
            toastr.error('Please upload your profile picture');
          } else {
            // Check if the file is an image
            if (/^image\/\w+/.test(fileItem.type)) {
              // Destroy the current cropper instance if it exists
              if (upload_cropper) {
                upload_cropper.destroy();
              }
              // Initialize the cropper
              const image = document.getElementById('image_cropper');
              image.src = URL.createObjectURL(fileItem);
              upload_cropper = new Cropper(image, {
                aspectRatio: 3 / 4,
                width: 200,
                height: 200,
                viewMode: 1,
                autoCropArea: 0.7,
                responsive: true,
                crop(event) {
                  // Get the cropped canvas data as a data URL
                  const canvas = upload_cropper.getCroppedCanvas();
                  const dataURL = canvas.toDataURL();
                  // Set the data URL as the value of the hidden input field
                  hiddenInput.value = dataURL;
                },
              });
            } else {
              toastr.error('Please choose an image file.');
            }
          }
        });
    }

    function userUploadImage(userID) {
          const canvas = upload_cropper.getCroppedCanvas();
          const metadata = {
          contentType: 'image/png'
          };
          canvas.toBlob(async (blob) => {
            const storageRef = ref(storage, 'profiles/' + userID);
            const snapshot = await uploadBytes(storageRef, blob, metadata);
            toastr.success('User and photo created successfully');
            setTimeout(function () {
              window.location.reload();
            }, 2000);
          });
        }

      create_user_form.addEventListener('submit', (e) => {
        e.preventDefault();
        e.stopPropagation();

        createUser();
      });
    }

/*
 * --------------------------------------------------------------------------------------------
 * Companies table page functions
 * --------------------------------------------------------------------------------------------
 */

/*================================================================================================================================================================
 * This code snippet handles the functionality related to the companies table, including data retrieval, filtering, pagination, creation, updating,
 * and deletion of companies. It also includes the creation and updating of profiles and zones, as well as the display of selected company and zone information.
=================================================================================================================================================================*/
    async function pageCompaniesTable(user){
      changeAdminTypeTitle(user);

      const companyFilterSelect = document.getElementById("companies_profile");
      const zonesFilterSelect = document.getElementById("companies_zones");

      //Print companies select
      const company_colRef = collection(db, 'companies');
      getDocs(company_colRef)
                .then((snapshot) => {
                  snapshot.docs.forEach((doc) => {
                    let company = doc.data();

                    var opt = document.createElement('option');
                    opt.value = company.company_name;
                    opt.textContent = company.company_name;
                    companyFilterSelect.appendChild(opt);
                  });
                })
                .catch(err => {
                  console.log('error fetching companies', err);
                })

      //Print zones select
      createOptions(zonesFilterSelect);

      companyFilterSelect.addEventListener("change", function() {
          let companyColumn = table.getColumn("company_profile");
          let selectedCompany = companyFilterSelect.value;
          table.setHeaderFilterValue(companyColumn, selectedCompany);
      });
      zonesFilterSelect.addEventListener("change", function() {
          let zoneColumn = table.getColumn("zone");
          let selectedZone = zonesFilterSelect.value;
          table.setHeaderFilterValue(zoneColumn, selectedZone);
      });

    let companyProfileLabel = 'COMPANY PROFILE';
    let companyLabel = 'COMPANY';
    let companyZoneLabel = 'COMPANY ZONE';
    let sendLinkLabel = 'SEND LINK';
    let updateLabel = 'ACTION';
    let sendLinkButtonLabel = 'SEND LINK';
    let link_lang = 'en';
    let userInfo = await getUserInfo(user);

    if ( storedLang == 'de' ) {
      companyProfileLabel = 'FIRMA';
      companyZoneLabel = 'ZONEN';
      sendLinkLabel = 'EINLADUNG';
      updateLabel = 'AKTION';
      sendLinkButtonLabel = 'LINK SENDEN';
      link_lang = 'de';
    }

    // Print companies table
      let searchCompanyInput = document.getElementById("search-input");
      let companies_table = new Tabulator("#admin-companies-list", {
        //options here
        layout:"fitData",
        addRowPos:"top",
        history:true,
        pagination:"local",
        paginationSize:10,
        paginationSizeSelector:[10, 25, 50],
        paginationCounter:"rows",
        columns:[
        {title:"Company Link", field:"companyLink", sorter:"string", width:0, cssClass:"hidden-column companyLinkToCopy_en", formatter: function(cell, formatterParams, onRendered){
                let companyLink_en = cell.getValue();
                cell.getElement().setAttribute("id", "companyLink"+cell.getRow().getData().id);
                return companyLink_en;
            }},
            {title:"Company Link De", field:"companyLinkDe", sorter:"string", width:0, cssClass:"hidden-column companyLinkToCopy_de", formatter: function(cell, formatterParams, onRendered){
                let companyLink_de = cell.getValue();
                cell.getElement().setAttribute("id", "companyLink"+cell.getRow().getData().id);
                return companyLink_de;
            }},
            {title:"ID", field:"id", sorter:"string", width:0, cssClass:"companyID hidden-column"},
            {title:"Company Profile", field:"company_profile", sorter:"string", width:0, cssClass:"companyProfile hidden-column"},
            {title: companyProfileLabel, field:"company", sorter:"string", width:250, cssClass:"companyName first_column"},
            {title: companyZoneLabel, field:"zone", sorter:"string", width:250, cssClass:"companyZone other_columns"},
            {title:"User Head", field:"userHead", sorter:"string", width:0, cssClass:"userHead hidden-column"},
            {title: sendLinkLabel, width:195, cssClass:"other_columns center_column", formatter:function(cell, formatterParams){
            let value = cell.getValue();
            let button = document.createElement("button");
            button.innerHTML = `<img class="button_img" src="https://uploads-ssl.webflow.com/6453e5fbbb9ef87f5979b611/6468108d231ed90e8f74b109_Vector.png">`;
            button.setAttribute("onclick","openModal5()");
            button.setAttribute("id","open_link_modal");
            return button;
            }},
            {title: updateLabel, width: 195, cssClass: "other_columns center_column", formatter: function(cell, formatterParams) {
                let value = cell.getValue();
                let buttonContainer = document.createElement("div");
                buttonContainer.setAttribute("class","actionBtnContainer");

                let editButton = document.createElement("button");
                editButton.innerHTML = "<img src='https://uploads-ssl.webflow.com/6453e5fbbb9ef87f5979b611/6462983e76b4d1ee3ac14cd1_pencil-alt.png' alt='Edit'/>";
                editButton.setAttribute("onclick", "openModal2()");
                editButton.setAttribute("id", "open_companies_modal");

                let deleteButton = document.createElement("button");
                deleteButton.innerHTML = "<img src='https://uploads-ssl.webflow.com/6453e5fbbb9ef87f5979b611/6462e184b518709fa4ff5fe6_trash.png' alt='Delete'/>";
                deleteButton.setAttribute("onclick", "deleteCompany()");

                buttonContainer.appendChild(editButton);
                buttonContainer.appendChild(deleteButton);

                return buttonContainer;
              }}
        ],
    });

  $(document).ready(function() {
    $(".tabulator-paginator").find(".tabulator-page[data-page='prev']").html("&lt;");
    $(".tabulator-paginator").find(".tabulator-page[data-page='next']").html("&gt;");
    if(storedLang == 'de'){
      $(".tabulator-paginator").find(".tabulator-page[data-page='first']").html("Zurück");
      $(".tabulator-paginator").find(".tabulator-page[data-page='last']").html("Vor");
    }
  });

    const company_input = document.getElementById("company_search");
    company_input.addEventListener("keyup", function() {
      companies_table.setFilter(matchAny, { value: company_input.value });
        if (company_input.value == " ") {
          companies_table.clearFilter()
        }
    });

    function matchAny(data, filterParams) {
        var match = false;
        const regex = RegExp(filterParams.value, 'i');

        for (var key in data) {
            if (regex.test(data[key]) == true) {
                match = true;
            }
        }
        return match;
    }

  getDocs(company_colRef)
    .then((snapshot) => {
        let data = [];
        snapshot.docs.forEach((doc) => {
            let company = doc.data();
            let company_link_en = `https://tms-main.webflow.io/en/signup-bho?company=${doc.id}`;
            let company_link_de = `https://tms-main.webflow.io/de/signup-bho?company=${doc.id}`;
                data.push({companyLink: company_link_en,companyLinkDe: company_link_de, company_profile: company.company_profile,  id:doc.id, userHead: company.user_head, company: company.company_name, zone: company.company_zones});
                companies_table.setData(data);
        });
    })
    .catch(err => {
        console.log('error fetching users', err);
    });

      //Update company info
      let update_company_form = document.getElementById('update_company_info');
      let company_id = document.getElementById('company_id');
      let update_company = document.getElementById('update_company');
      let newCompanyProfile = document.getElementById('newCompanyProfile');
      let selectedNewZonesString;

      $('#newCompanyZones').on('change', function () {
        var selectedNewZones = $(this).val();
        selectedNewZonesString = selectedNewZones.join(', ');
      });
      update_company_form.addEventListener('submit', (e) => {
        e.preventDefault();
        e.stopPropagation()

        if ( company_id != null) {
          const companyRef = doc(db, 'companies', company_id.value);
          setDoc(companyRef, {
            company_name: update_company.value,
            company_zones: selectedNewZonesString,
            company_profile: newCompanyProfile.value
          }, { merge: true })
          .then(() => {
                toastr.success('Company info has been successfully updated');
                setTimeout(function() {
                  window.location.reload();
                }, 2000);
          })
          .catch((err) => {
            toastr.error('There was an error updating the company info');
            console.log('error updating company info', err);
          });
        }
      });

      //Create companies
      let create_company_form = document.getElementById('create_company_form');
      let new_company_name = document.getElementById('newCompanyName');
      let new_company_profile = document.getElementById('companyProfile');
      let new_company_type = document.getElementById('company_type');
      let companyZone = document.getElementById('companyZone');
      let selectedValuesString;

      $('#companyZone').on('change', function () {
        var selectedValues = $(this).val();
        selectedValuesString = selectedValues.join(', ');
      });

      async function createCompany() {
  try {
    const docRef = await addDoc(collection(db, "companies"), {
      company_name: new_company_name.value,
      company_zones: selectedValuesString,
      company_profile: new_company_profile.value,
      company_type: '',
      user_head: ''
    });

    const companyId = docRef.id;
    await updateDoc(docRef, { company_id: companyId });

    toastr.success('Company has been successfully created');
    setTimeout(function() {
      window.location.reload();
    }, 2000);
  } catch (err) {
    toastr.error('There was an error creating the company');
    console.log('error creating company', err);
  }
}

create_company_form.addEventListener('submit', async (e) => {
  e.preventDefault();
  e.stopPropagation();
  await createCompany();
});

      //Create Profiles
      let create_profile_form = document.getElementById('create_profile_form');
      let new_profile_name = document.getElementById('newProfileName');
      let profileZones = document.getElementById('profileZones');
      let selectedProfileZones;

      $('#profileZones').on('change', function () {
        var selectedValues = $(this).val();
        selectedProfileZones = selectedValues.join(', ');
      });

      async function createProfile() {
        const profileRef = await addDoc(collection(db, "profiles"), {
            profile_name: new_profile_name.value,
            zones: selectedProfileZones,
          })
          .then(() => {
            toastr.success('Profile has been successfully created');
            setTimeout(function() {
              document.getElementById('create_profile_modal').style.display = 'none';
            }, 500);
            $('body').removeClass('modal-open')
          })
          .catch((err) => {
            toastr.error('There was an error creating the profile');
            console.log('error creating profile', err);
          });
      }
      create_profile_form.addEventListener('submit', (e) => {
        e.preventDefault();
        e.stopPropagation();

        createProfile();
      });

    //Create new zones
    if (window.location.pathname == '/de/admin/users-table' || window.location.pathname == '/de/admin/companies-table' || window.location.pathname == '/en/admin/users-table' || window.location.pathname == '/en/admin/companies-table'){
      let create_zone_form = document.getElementById('create_zone_form');
      let new_zone_name = document.getElementById('newZoneName');

      async function createZone(){
        const zoneRef = await addDoc(collection(db, "zones"), {
            zone: new_zone_name.value,
          })
          .then(() => {
                toastr.success('Zone has been successfully created');
                setTimeout(function() {
                  document.getElementById('#zone_modal').style.display = 'none';
                  $('body').removeClass('modal-open')
                }, 500);
          })
          .catch((err) => {
            toastr.error('There was an error creating the zone');
            console.log('error creating zone', err);
          });
      }

      create_zone_form.addEventListener('submit', (e) => {
        e.preventDefault();
        e.stopPropagation();

        createZone()
      });

      //Print zones select
      let create_company_zone = document.getElementById('companyZone');
      let update_company_zone = document.getElementById('newCompanyZones');
      let profileZones = document.getElementById('profileZones');

          createOptions(create_company_zone);
          createOptions(update_company_zone);
          createOptions(profileZones);

        //Print profiles select
      let companyProfile = document.getElementById('companyProfile');
      let newCompanyProfile = document.getElementById('newCompanyProfile')
      const profilesRef = collection(db, 'profiles');

        function createProfileOptions(select) {
          getDocs(profilesRef)
            .then((snapshot) => {
              snapshot.docs.forEach((doc) => {
                let profile = doc.data();

                var opt = document.createElement('option');
                opt.value = doc.id;
                opt.textContent = profile.profile_name;
                select.appendChild(opt);
              });
            })
            .catch(err => {
              console.log('error fetching companies', err);
            });
        }
            createProfileOptions(companyProfile);
            createProfileOptions(newCompanyProfile);

             // Update the selectedUserZonesString variable based on the current selection
            function updateSelectedCompanyZonesString() {
              const selectedOptions = Array.from(newCompanyZones.selectedOptions).map(option => option.value);
              selectedNewZonesString = selectedOptions.join(',');
            }

            let newCompanyZones = document.getElementById('newCompanyZones');
            // Update the zones based on the selected company profile
            newCompanyProfile.addEventListener('change', async () => {
              const companyProfile = newCompanyProfile.value;
              if (companyProfile !== '') {
                const profilesRef = doc(db, 'profiles', companyProfile);
                try {
                  const profilesSnapshot = await getDoc(profilesRef);
                  if (profilesSnapshot.exists()) {
                    const zones = profilesSnapshot.data().zones;
                    // Update the options for the zones select
                    const allOptions = newCompanyZones.options;
                    for (let i = 0; i < allOptions.length; i++) {
                      const option = allOptions[i];
                      if (zones.includes(option.value)) {
                        option.selected = true;
                      } else if (option.selected) {
                        option.selected = false;
                      }
                    }
                    $(newCompanyZones).trigger('change.select2');
                    // Update the selectedUserZonesString variable based on the current selection
                    updateSelectedCompanyZonesString();
                  } else {
                    console.log('Error getting document(s):', error);
                  }
                } catch (error) {
                  console.log('Error getting document:', error);
                }
              } else {
                console.log('Error: "userType" is empty.');
              }
             });

              // Update the selectedUserZonesString variable whenever the zones select element changes
              newCompanyZones.addEventListener('change', () => {
                updateSelectedCompanyZonesString();
              });

              // Update the selectedUserZonesString variable based on the current selection
            function updateCompanyZonesString() {
              const selectedOptions = Array.from(companyZones.selectedOptions).map(option => option.value);
              selectedValuesString = selectedOptions.join(',');
            }

            let companyZones = document.getElementById('companyZone');
            let createCompanyProfile = document.getElementById('companyProfile');
            // Update the zones based on the selected company profile
            createCompanyProfile.addEventListener('change', async () => {
              const companyProfile = createCompanyProfile.value;
              if (companyProfile !== '') {
                const profilesRef = doc(db, 'profiles', companyProfile);
                try {
                  const profilesSnapshot = await getDoc(profilesRef);
                  if (profilesSnapshot.exists()) {
                    const zones = profilesSnapshot.data().zones;
                    // Update the options for the zones select
                    const allOptions = companyZones.options;
                    for (let i = 0; i < allOptions.length; i++) {
                      const option = allOptions[i];
                      if (zones.includes(option.value)) {
                        option.selected = true;
                      } else if (option.selected) {
                        option.selected = false;
                      }
                    }
                    $(companyZones).trigger('change.select2');
                    // Update the selectedUserZonesString variable based on the current selection
                    updateCompanyZonesString();
                  } else {
                    console.log('Error getting document(s):', error);
                  }
                } catch (error) {
                  console.log('Error getting document:', error);
                }
              } else {
                console.log('Error: "userType" is empty.');
              }
             });

             if(userInfo.user_company_name == undefined){
                document.getElementById("company_name").innerHTML = 'No company';
              }else{
                const companies = userInfo.user_company_name.split(",");
                const firstCompany = companies[0];
                document.getElementById("company_name").innerHTML = `${firstCompany}`;
              }

              // Update the selectedUserZonesString variable whenever the zones select element changes
              newCompanyZones.addEventListener('change', () => {
                updateCompanyZonesString();
              });
          }
      }

/*===================================================================================================================================================
 * This code snippet handles the company page functionality, including data retrieval, storage, and population in the table, as well as redirection
 * to the appropriate company page based on the language.
====================================================================================================================================================*/

    $(document).on( 'click' , '#companyName' ,async function() {
          let storedLang = localStorage.getItem("language");
          let companyValue = event.target.getAttribute('data-value');
          let companyNameValue = event.target.getAttribute('data-company-name');
          const q = query(collection(db, "users"), where("user_company", "==", companyValue));
          const company_filter = query(collection(db, "companies"), where("company_name", "==", companyNameValue));
          const companySnapshot = await getDocs(company_filter);
          const querySnapshot = await getDocs(q);
          let users = [];
          let company = [];

          querySnapshot.forEach((doc) => {
            let user = doc.data(q);
            users.push(user)
          });
           //Get company name from the companies collection
          companySnapshot.forEach((doc) => {
            let company_name = doc.data(company_filter);
            company.push(company_name)
          });

          console.log(company)
          localStorage.setItem('users', JSON.stringify(users));
          localStorage.setItem('company', companyValue);

          //Save company name from the companies collection
          localStorage.setItem('company_collection', JSON.stringify(company));

          if(storedLang){
            if(storedLang == "de"){
              window.location.replace('/de/company');
            }else{
              window.location.replace('/en/company');
            }
          }else{
            window.location.replace('/en/company');
          }
      })

    if (window.location.pathname == '/de/company'){
      // Retrieve users data from local storage
      const storedUsers = localStorage.getItem('users');
      const company_name = localStorage.getItem('company');
      const company_collection = localStorage.getItem('company_collection');
      const parseCompany = JSON.parse(company_collection);
      const users = JSON.parse(storedUsers);

    // Add rows and cells to table
    users.forEach(function(user) {
      var newRow = document.getElementById('company-user-list-body').insertRow(0);
      let idCell = newRow.insertCell(0);
      let emailCell = newRow.insertCell(1);
      let userTypeCell = newRow.insertCell(2);
      idCell.innerHTML = `${user.user_id}`;
      emailCell.innerHTML = `${user.user_email}`;
      userTypeCell.innerHTML = `${user.account_type}`;
    });

    //Add company head
        parseCompany.forEach(function(company){
      if(company.hasOwnProperty('user_head')){
        document.getElementById('user_head').innerHTML = `User head: ${company.user_head}`
      }
      if(company.hasOwnProperty('company_name')){
        document.getElementById('company_table_name').innerHTML = `Company: ${company.company_name}`
      }
    })
  }

/*==========================================================================================================================================================
 * This code snippet sends an email with the user's registration link when a form is submitted. It retrieves the necessary values, fetches the appropriate
 * HTML template for the email body based on the stored language value, and sends the email. Success or error messages are displayed accordingly.
===========================================================================================================================================================*/

    let company_link_form = document.getElementById('company_link_form');

    if(company_link_form){
      company_link_form.addEventListener('submit', (e)=>{
        e.preventDefault();
        e.stopPropagation();

              if(storedLang == 'de'){
                (async () => {
                try {
                const registrationLink = `${company_link.value}`;
                const registrationLink_de = `${company_link_de.value}`;
                const html = await fetch(registration_link_de_email_url)
                .then(response => response.text())
                .then(html => html.replace('${company_link.value}', registrationLink))
                .then(html => html.replace('${company_link_de.value}', registrationLink_de))
                    const docRef = addDoc(collection(db, "mail"), {
                    to: `${email_to_send.value}`,
                    message: {
                    subject: registration_link_de_email_subject,
                    html:  html,
                    }
                    });
                    toastr.success('E-Mail wurde erfolgreich versendet');
                    setTimeout(function() {
                      document.getElementById('company_link_modal').style.display = 'none';
                      $('body').removeClass('modal-open');
                    }, 500);
                    } catch (e) {
                      toastr.error("Error beim versenden der E-Mail: ", e);
                    }
                  })();
              }else {
                (async () => {
                try {
                  const registrationLink = `${company_link.value}`;
                  const registrationLink_de = `${company_link_de.value}`;
                  const html = await fetch(registration_link_en_email_url)
                  .then(response => response.text())
                  .then(html => html.replace('${company_link.value}', registrationLink))
                  .then(html => html.replace('${company_link_de.value}', registrationLink_de))
                    const docRef = addDoc(collection(db, "mail"), {
                    to: `${email_to_send.value}`,
                    message: {
                    subject: registration_link_en_email_subject,
                    html:  html,
                    }
                    });
                    toastr.success('Email has been successfully sent');
                    setTimeout(function() {
                      document.getElementById('company_link_modal').style.display = 'none';
                      $('body').removeClass('modal-open');
                    }, 500);
                    } catch (e) {
                      toastr.error("Error sending email: ", e);
                    }
                  })();
              }
                })
              }

/*
* -----------------------------------------------------------------------------------------------------------
* URL functions
* -----------------------------------------------------------------------------------------------------------
*/

/*=========================================================================================================================================================
 * Check if the company parameter exists in the URL, if it does then set a value in the local storage and pre-populate the text field in the sign up form
==========================================================================================================================================================*/

    const zonesRef = collection(db, 'zones');
    function createOptions(select) {
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

      if ( company ) {
          localStorage.setItem('company', company);
          $('#sign-up-company').val(company);
      }else{
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
        if ( url == '/en/signup-bho' || url == '/de/signup-bho' ) {
          pageHome();
        } else if ( url == '/en/signin-bho' || url == '/de/signin-bho' ) {
          signInPage();
        }else if ( url == '/en/press-form' || url == '/de/press-form' ) {
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
        }else if ( url == '/en/admin/companies-table' || url == '/de/admin/companies-table' ) {
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

            if(storedLang){
              if(storedLang == "de"){
                window.location.pathname = '/de/success-email-sent';
              }else{
                window.location.pathname = '/en/success-email-sent';
              }
            }else{
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

    if(window.location.pathname == '/success-email-sent'){
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

      if(!user){
        if(storedLang){
          if(storedLang == "de"){
            form_button.setAttribute('href', '/de/signin-bho');
            account_button.setAttribute('href', '/de/signin-bho');
            users_button.setAttribute('href', '/de/signin-pbho');
            companies_button.setAttribute('href', '/de/signin-bho');
            document.getElementById('signIn_button').style.display = 'block';
            document.getElementById('signUp_button').style.display = 'block';
            if(window.location.pathname == '/' && userData.confirmed_email != '1'){
              window.location.replace('https://tms-main.webflow.io/de/signin-bho');
              }else if(window.location.pathname !== '/de/success-email-sent' && window.location.pathname !== '/de/forgoten-password' && window.location.pathname !== '/de/signin-bho' && window.location.pathname !== '/de/signup-bho' && window.location.pathname !== '/de/press-form' && window.location.pathname !== '/de/data-protection' && window.location.pathname !== '/de/impressum'){
                window.location.replace('https://tms-main.webflow.io/de/signin-bho');
              }
          }else{
            form_button.setAttribute('href', '/en/signin-bho');
            account_button.setAttribute('href', '/en/signin-bho');
            users_button.setAttribute('href', '/de/signin-bho');
            companies_button.setAttribute('href', '/de/signin-bho');
            document.getElementById('signIn_button').style.display = 'block';
            document.getElementById('signUp_button').style.display = 'block';
            if(window.location.pathname == '/' && userData.confirmed_email != '1'){
              window.location.replace('https://tms-main.webflow.io/en/signin-bho');
              }else if(window.location.pathname !== '/en/success-email-sent' && window.location.pathname !== '/en/forgoten-password' && window.location.pathname !== '/en/signin-bho' && window.location.pathname !== '/en/signup-bho' && window.location.pathname !== '/en/press-form' && window.location.pathname !== '/en/data-protection' && window.location.pathname !== '/en/impressum'){
                window.location.replace('https://tms-main.webflow.io/en/signin-bho');
              }
          }
        }else{
          form_button.setAttribute('href', '/en/signin-bho');
          account_button.setAttribute('href', '/en/signin-bho');
          users_button.setAttribute('href', '/de/signin-bho');
          companies_button.setAttribute('href', '/de/signin-bho');
          document.getElementById('signIn_button').style.display = 'block';
          document.getElementById('signUp_button').style.display = 'block';
        }
      }else{
        if(storedLang){
          if(storedLang == "de"){
            account_button.setAttribute('href', '/de/account');
            users_button.setAttribute('href', '/de/admin/users-table');
            companies_button.setAttribute('href', '/de/admin/companies-table');
            document.getElementById('signIn_button').style.display = 'none';
            document.getElementById('signUp_button').style.display = 'none';
            if(window.location.pathname == '/' && userData.confirmed_email != '1'){
              window.location.replace('https://tms-main.webflow.io/de/signup-form-submitted');
              }else if(window.location.pathname == '/' && userData.confirmed_email == '1'){
              window.location.replace('https://tms-main.webflow.io/de/account');
              }
          }else{
            account_button.setAttribute('href', '/en/account');
            users_button.setAttribute('href', '/en/admin/users-table');
            companies_button.setAttribute('href', '/en/admin/companies-table');
            document.getElementById('signIn_button').style.display = 'none';
            document.getElementById('signUp_button').style.display = 'none';
            if(window.location.pathname == '/' && userData.confirmed_email != '1'){
              window.location.replace('https://tms-main.webflow.io/en/signup-form-submitted');
              }else if(window.location.pathname == '/' && userData.confirmed_email == '1'){
              window.location.replace('https://tms-main.webflow.io/en/account');
              }
          }
        }else{
              account_button.setAttribute('href', '/en/account');
              users_button.setAttribute('href', '/en/admin/users-table');
              companies_button.setAttribute('href', '/en/admin/companies-table');
              document.getElementById('signIn_button').style.display = 'none';
              document.getElementById('signUp_button').style.display = 'none';
              if(window.location.pathname == '/' && userData.confirmed_email != '1'){
              window.location.replace('https://tms-main.webflow.io/en/signup-form-submitted');
              }else if(window.location.pathname == '/' && userData.confirmed_email == '1'){
              window.location.replace('https://tms-main.webflow.io/en/account');
              }
            }
        }
      }

/*============================================================================================================================================================
 * This function handles URL replacement and redirection based on the sign-out status and language settings. It redirects the user to the appropriate sign-in
 * page based on the language or displays the sign-in and sign-up buttons accordingly.
===============================================================================================================================================================*/

     async function replaceUrlSignOut(user) {
      if(!user){
        if(storedLang){
          if(storedLang == "de"){
            document.getElementById('signIn_button').style.display = 'block';
            document.getElementById('signUp_button').style.display = 'block';
            if(window.location.pathname == '/'){
              window.location.replace('https://tms-main.webflow.io/de/signin-bho');
              }else if(window.location.pathname !== '/de/success-email-sent' && window.location.pathname !== '/de/forgoten-password' && window.location.pathname !== '/de/signin-bho' && window.location.pathname !== '/de/signup-bho' && window.location.pathname !== '/de/press-form' && window.location.pathname !== '/de/data-protection' && window.location.pathname !== '/de/impressum'){
                window.location.replace('https://tms-main.webflow.io/de/signin-bho');
              }
          }else{
            document.getElementById('signIn_button').style.display = 'block';
            document.getElementById('signUp_button').style.display = 'block';
            if(window.location.pathname == '/'){
              window.location.replace('https://tms-main.webflow.io/en/signin-bho');
              }else if(window.location.pathname !== '/en/success-email-sent' && window.location.pathname !== '/en/forgoten-password' && window.location.pathname !== '/en/signin-bho' && window.location.pathname !== '/en/signup-bho' && window.location.pathname !== '/en/press-form' && window.location.pathname !== '/en/data-protection' && window.location.pathname !== '/en/impressum'){
                window.location.replace('https://tms-main.webflow.io/en/signin-bho');
              }
          }
        }else{
          form_button.setAttribute('href', '/en/signin-bho');
          account_button.setAttribute('href', '/en/signin-bho');
          users_button.setAttribute('href', '/de/signin-bho');
          companies_button.setAttribute('href', '/de/signin-bho');
          document.getElementById('signIn_button').style.display = 'block';
          document.getElementById('signUp_button').style.display = 'block';
        }
        }
      }

/*======================================================================================================================================================
 * This code snippet performs several tasks on the first page load. It handles a loading overlay by setting its display to "none" after a delay. It then
 * dispatches a request, checks URL parameters, and defines an asynchronous function called changeCompanyNameToID.
=======================================================================================================================================================*/

    const loadingOverlay = document.querySelector(".loading-overlay");
    if(loadingOverlay){
    setTimeout(function() {
      loadingOverlay.style.display = "none";
    }, 2000);
  }
    dispatchRequest(false);
    checkUrlParameter();

    async function changeCompanyNameToID(user) {
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

/*========================================================================================================================================================
 *This asynchronous function initializes a start date picker and an end date picker. It sets the minimum and maximum selectable dates, language
 settings, and other configuration options. The end date picker is dependent on the selected start date, and it is initialized separately through the
 initializeEndDatePicker function.
==========================================================================================================================================================*/

async function getDateSignUp() {
  var today = new Date();
  var minDate = new Date(today.getFullYear(), 5, 22);
  var maxDate = new Date(today.getFullYear(), 6, 1);
  var minDateEndPicker = new Date(today.getFullYear(), 5, 22);
  var startDatePicker = $('[data-date-picker="datepicker-start"]');
  let endDatePicker = $('[data-date-picker="datepicker-end"]');

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

  let multiDates = false;
  let selectedStartDate = null;

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
    var selectedDate = startDatePicker.value;
    var parsedDate = new Date(selectedDates);
    minDateEndPicker = parsedDate;
    endDatePicker.value = '';
    initializeEndDatePicker();
  },
    onSelect: function(formattedDate, date, inst) {
      inst.hide();
    }
});

  function initializeEndDatePicker() {
    endDatePicker.datepicker({
      multipleDates: multiDates,
      multipleDatesSeparator: ', ',
      dateFormat: 'mm-dd-yyyy',
      minDate: minDateEndPicker,
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
  }

initializeEndDatePicker();

  if (window.innerWidth < 768) {
    $('[data-date-picker]').attr('readonly', 'readonly');
  }
}

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

    window.addEventListener('load', function(){
      var storedLang = localStorage.getItem("language");
      if(storedLang){
          currentLang = storedLang;
      }
      updateLinks();
    });

    function updateLinks() {
      console.log("Updating links");
      var baseUrl = window.location.origin;
      var currentPath = window.location.pathname;
      var pathArray = currentPath.split("/");
      if(pathArray.length < 3 || (pathArray.length >= 3 && !/^[a-z]{2}$/.test(pathArray[1]))){
          currentPath = '/'+currentLang+currentPath;
      }
      var links = document.querySelectorAll(".nav-link");
      if(links){
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
if(storedLang){
  if(storedLang == "de"){
    if(user_lang){
      document.getElementById('englishBtn').classList.remove('selected');
      document.getElementById('germanBtn').classList.add('selected');
    }
    if(sign_lang){
      document.getElementById('englishBtn2').classList.remove('selected');
      document.getElementById('germanBtn2').classList.add('selected');
    }
  }else{
    if(user_lang){
      document.getElementById('englishBtn').classList.add('selected');
      document.getElementById('germanBtn').classList.remove('selected');
    }
    if(sign_lang){
      document.getElementById('englishBtn2').classList.add('selected');
      document.getElementById('germanBtn2').classList.remove('selected');
    }
  }
}else{
  if(user_lang){
    document.getElementById('englishBtn').classList.add('selected');
    document.getElementById('germanBtn').classList.remove('selected');
  }
  if(sign_lang){
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
if(signEnBtn){
  signEnBtn.addEventListener("click", function() {
    changeLanguage("en");
    updateLinks();
    document.getElementById('germanBtn2').classList.remove('selected');
    document.getElementById('englishBtn2').classList.add('selected');
  });
}

let signDeBtn = document.getElementById("germanBtn2")
if(signDeBtn){
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

    if(window.location.pathname == '/de/press' || window.location.pathname == '/en/press' || window.location.pathname == '/de/supplier' || window.location.pathname == '/en/supplier'){
      form_button.style.borderBottom = "2px solid #B11372";
    }
    if(window.location.pathname == '/en/admin/users-table' || window.location.pathname == '/de/admin/users-table'){
      admin_users_table.style.borderBottom = "2px solid #B11372";
    }
    if(window.location.pathname == '/en/admin/companies-table' || window.location.pathname == '/de/admin/companies-table'){
      admin_companies_table.style.borderBottom = "2px solid #B11372";
    }

    let welcomeBanner = document.getElementById('welcomeBanner');
    if(welcomeBanner){
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

    async function changeAdminTypeTitle(user){
      let userInfo = await getUserInfo(user);
      let storedLang = localStorage.getItem("language");

      if(storedLang == 'en'){
        if(userInfo.user_is_admin === '0' && userInfo.company_admin === '0' && userInfo.basic_admin === '1') {
          document.getElementById('user_admin_type').innerHTML = 'Basic Admin';
        }else if(userInfo.user_is_admin === '0' && userInfo.basic_admin === '0' && userInfo.company_admin === '1') {
          document.getElementById('user_admin_type').innerHTML = 'Multi Company Admin';
        }else if(userInfo.user_is_admin === '1') {
          document.getElementById('user_admin_type').innerHTML = 'Super Admin';
        }
      }else{
        if(userInfo.user_is_admin === '0' && userInfo.company_admin === '0' && userInfo.basic_admin === '1') {
          document.getElementById('user_admin_type').innerHTML = 'Grundlegender Administrator';
        }else if(userInfo.user_is_admin === '0' && userInfo.company_admin === '1' && userInfo.basic_admin === '0') {
          document.getElementById('user_admin_type').innerHTML = 'MEHRFIRMENADMIN';
          }else if(userInfo.user_is_admin === '1') {
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



if(window.location.href == 'https://tms-main.webflow.io/'){
      window.location.href = 'https://tms-main.webflow.io/en/signin-bho'
    }

