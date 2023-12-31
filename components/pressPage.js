  import { addDoc, collection, ref, uploadBytes, db, storage, user } from './a_firebaseConfig';
  import Cropper from 'cropperjs';
  import toastr from 'toastr';
  
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

    var storedLang = localStorage.getItem("language");


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

export async function pagePress() {
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