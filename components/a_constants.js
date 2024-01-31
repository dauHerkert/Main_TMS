/*===================================================================================================================================
 * Dev variables and constants
 ====================================================================================================================================*/

 const PSNAME = '-ptgp'; // Project slug name
 export const DEVEMAIL = 'juan.torres@dauherkert.de'; // Dev admin email
 
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
export const URLEMAILTEMPLATES = {
  URLEMAILFOLDER: 'https://raw.githubusercontent.com/dauHerkert/bho/main/mails_templates/',
  URLREGISTER_EN: 'register_en_email.html',
  URLREGISTER_DE: 'register_de_email.html',
  URLREGISTRATIONLINK_EN: 'registration_link_en_email.html',
  URLREGISTRATIONLINK_DE: 'registration_link_de_email.html',
  
  /* Press */
  URLMRAPPLICATIONREJECT_EN: 'press_en_mr_application_rejected.html',
  URLMRAPPLICATIONREJECT_DE: 'press_de_mr_application_rejected.html',
  URLMSAPPLICATIONREJECT_EN: 'press_en_ms_application_rejected.html',
  URLMSAPPLICATIONREJECT_DE: 'press_de_ms_application_rejected.html',
  URLDIVERSEAPPLICATIONREJECT_EN: 'press_en_diverse_application_rejected.html',
  URLDIVERSEAPPLICATIONREJECT_DE: 'press_de_diverse_application_rejected.html',
  
  URLMRAPPLICATIONACCEPT_EN: 'press_en_mr_application_accepted.html',
  URLMRAPPLICATIONACCEPT_DE: 'press_de_mr_application_accepted.html',
  URLMSAPPLICATIONACCEPT_EN: 'press_en_ms_application_accepted.html',
  URLMSAPPLICATIONACCEPT_DE: 'press_de_ms_application_accepted.html',
  URLDIVERSEAPPLICATIONACCEPT_EN: 'press_en_diverse_application_accepted.html',
  URLDIVERSEAPPLICATIONACCEPT_DE: 'press_de_diverse_application_accepted.html',
  
  URLMRMSCONFIRMEMAIL_EN: 'form_en_mr_ms_confirmation_form_to_admin.html',
  URLMRCONFIRMEMAIL_DE: 'form_de_mr_confirmation_email_to_admin.html',
  URLMSCONFIRMEMAIL_DE: 'form_de_ms_confirmation_email_to_admin.html',
  URLDIVERSECONFIRMEMAIL_EN: 'form_en_diverse_confirmation_form_to_admin.html',
  URLDIVERSECONFIRMEMAIL_DE: 'form_de_diverse_confirmation_email_to_admin.html',
  
  URLMRMSAPPLICATIONRECEIVED_EN: 'press_en_mr_ms_application_received.html',
  URLMRAPPLICATIONRECEIVED_DE: 'press_de_mr_application_received.html',
  URLMSAPPLICATIONRECEIVED_DE: 'press_de_ms_application_received.html',
  URLDIVERSEAPPLICATIONRECEIVED_EN: 'press_en_diverse_application_received.html',
  URLDIVERSEAPPLICATIONRECEIVED_DE: 'press_de_diverse_application_received.html',
  
  /* Supplier */
  URLSUPPLIERAPPLICATIONREJECT_EN: 'supplier_en_application_rejected.html',
  URLSUPPLIERAPPLICATIONREJECT_DE: 'supplier_de_application_rejected.html',
  
  URLSUPPLIERAPPLICATIONACCEPT_EN: 'supplier_en_application_accepted.html',
  URLSUPPLIERAPPLICATIONACCEPT_DE: 'supplier_de_application_accepted.html',
  
  URLSUPPLIERFORMCONFIRM_EN: 'supplier_en_form_confirmation.html',
  URLSUPPLIERFORMCONFIRM_DE: 'supplier_de_form_confirmation.html',
  URLSUPPLIERFORMCHANGE_EN: 'supplier_en_form_changes.html',
  URLSUPPLIERFORMCHANGE_DE: 'supplier_de_form_changes.html'
};