async function createSendinblueUser(email, firstName, lastName) {
  try {
    // Define the payload for the API request, using the user information extracted from the Firestore doc
    const payload = {
      email: email,
      attributes: {
        FIRSTNAME: firstName,
        LASTNAME: lastName
      }
    };

    // Send the API request to create a new user in your email marketing campaign list
    const response = await fetch('https://api.sendinblue.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': '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'
      },
      body: JSON.stringify(payload)
    });

    // Check if the API request was successful
    if (response.status === 201) {
      console.log('User added to email marketing campaign list.');
    } else {
      console.log('Failed to add user to email marketing campaign list.');
    }
  } catch (error) {
    console.error(error);
  }
}
