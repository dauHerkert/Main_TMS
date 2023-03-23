const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fetch = require('node-fetch');

admin.initializeApp();

exports.createContactInSendinblue = functions.firestore
  .document('users/{userId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();
    const name = data.user_firstname;
    const lastname = data.user_lastname;
    const email = data._useremail;

    try {
      const response = await fetch('https://api.sendinblue.com/v3/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': '1ffcea85ac55ee30cd4b41e2c1dc91d1bdfb458339ff44b45367a9dd6718fcd6-xtF8KJWVLQEhk2n7'
        },
        body: JSON.stringify({
          email: email,
          attributes: {
            FIRSTNAME: name,
            LASTNAME: lastname
          }
        })
      });

      const jsonResponse = await response.json();
      console.log(jsonResponse);
    } catch (error) {
      console.error(error);
    }
  });
