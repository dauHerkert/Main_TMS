       // ---- REGISTRATION LINK EMAILS ----

    //Registration link email - DE
    const registration_link_de_email_subject = 'Akkreditierung Bad Homburg Open';
    const registration_link_de_email_url = 'https://raw.githubusercontent.com/dauHerkert/bho/main/mails_templates/registration_link_de_email.html';
    //Registration link email - EN
    const registration_link_en_email_subject = 'Accreditation Bad Homburg Open';
    const registration_link_en_email_url = 'https://raw.githubusercontent.com/dauHerkert/bho/main/mails_templates/registration_link_en_email.html';


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
          signUpPage();
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




console.log('------------------------------------------------------------------------------------------------------');
console.log('base.js loading successfully');
console.log('------------------------------------------------------------------------------------------------------');