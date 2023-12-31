import { collection, doc, getDocs, setDoc, addDoc, updateDoc, query, where, db, storage, user } from './a_firebaseConfig';
import { getUserInfo, createOptions, changeAdminTypeTitle } from './ab_base';
import toastr from 'toastr';
import 'tabulator-tables/dist/js/tabulator.min.js';
import 'tabulator-tables/dist/css/tabulator.min.css';
import 'select2';
import 'select2/dist/css/select2.min.css';
 
//Registration link email - DE
const registration_link_de_email_subject = 'Akkreditierung Bad Homburg Open';
const registration_link_de_email_url = 'https://raw.githubusercontent.com/dauHerkert/bho/main/mails_templates/registration_link_de_email.html';
//Registration link email - EN
const registration_link_en_email_subject = 'Accreditation Bad Homburg Open';
const registration_link_en_email_url = 'https://raw.githubusercontent.com/dauHerkert/bho/main/mails_templates/registration_link_en_email.html';

/*================================================================================================================================================================
 * This code snippet handles the functionality related to the companies table, including data retrieval, filtering, pagination, creation, updating,
 * and deletion of companies. It also includes the creation and updating of profiles and zones, as well as the display of selected company and zone information.
=================================================================================================================================================================*/

let storedLang = localStorage.getItem("language");

export async function pageCompaniesTable(user){
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
          let company_link_en = `https://tms-main.webflow.io/en/signup-ptgp?company=${doc.id}`;
          let company_link_de = `https://tms-main.webflow.io/de/signup-ptgp?company=${doc.id}`; 
              data.push({companyLink: company_link_en,companyLinkDe: company_link_de, company_profile: company.company_profile,  id:doc.id, userHead: company.user_head, company: company.company_name, zone: company.company_zones});
              companies_table.setData(data);
      });
  })
  .catch(err => {
      console.log('error fetching companies', err);
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