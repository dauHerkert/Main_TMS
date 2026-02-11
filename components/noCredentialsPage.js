import { URLASSETS, ICON_PENCIL, DEVEMAIL, EVENTDATES, URLEMAILTEMPLATES } from './a_constants';
import { doc, setDoc, addDoc, collection, getDownloadURL, ref, storage, db, getDocs, user } from './a_firebaseConfig';
import { getUserInfo, getAdminInfo, createOptions } from './ab_base';
import toastr from 'toastr';
import 'tabulator-tables/dist/js/tabulator.min.js';
import 'tabulator-tables/dist/css/tabulator.min.css';

export async function pageNoCredentials(user) {

  let userInfo = await getUserInfo(user);
  let adminInfo = await getAdminInfo(user);
  let storedLang = localStorage.getItem("language");

  /*==================================================================================================================================================================
   * Page context labels
  ===================================================================================================================================================================*/

  if (userInfo.user_company_name == undefined) {
    document.getElementById("company_name").innerText = 'No company';
  } else {
    const companies = userInfo.user_company_name.split(",");
    const firstCompany = companies[0];
    document.getElementById("company_name").innerText = `${firstCompany}`;
  }
  /*=================================================================================================================================================================
  * This code segment handles the creation of No credentials user forms. 


  TO CHECK
  It dynamically populates select dropdowns with options from the database, such as companies and profiles.
  * It also includes event listeners to capture user input and trigger actions accordingly. The createUser function creates a new user in the database using the
  * provided form inputs. It also handles the upload of a profile picture and associates it with the newly created user. Overall, this code enables the creation of
  * user accounts with various details and functionalities.
  ==================================================================================================================================================================*/

  let create_blocked_user_form = document.getElementById('create_blocked_user_form');
  let blocked_user_firstname = document.getElementById('blocked_user_firstname');
  let blocked_user_lastname = document.getElementById('blocked_user_lastname');
  let blocked_user_fullname = '';
  let blocked_user_role = document.getElementById('blocked_user_role');
  let blocked_user_department = document.getElementById('blocked_user_department');
  let blocked_user_reason = document.getElementById('blocked_user_reason');
  let blocked_user_date_added = document.getElementById('blocked_user_date_added');

  async function createBlockedUser(user) {
    if (blocked_user_firstname.value && blocked_user_lastname.value) {
      blocked_user_fullname = (blocked_user_firstname.value + blocked_user_lastname.value).toLowerCase().replace(/\s/g, '');
    }

    let storedLang = localStorage.getItem("language");
    if (!storedLang) {storedLang = userInfo.language}
    let docRef;

    if (adminInfo.super_admin) {
      docRef = await addDoc(collection(db, "blockedUsers"), {
        user_firstname: escapeHtml(blocked_user_firstname.value),
        user_lastname: escapeHtml(blocked_user_lastname.value),
        user_fullname: escapeHtml(blocked_user_fullname),
        user_role: escapeHtml(blocked_user_role),
        user_department: escapeHtml(blocked_user_department),
        blocking_reason: escapeHtml(blocked_user_reason),
        date_added: escapeHtml(blocked_user_date_added),
        user_ids: '',
        account_types: '',
        user_statuses: '',
        user_firstcompanies: '',
        user_emails: '',
        user_card_ids: '',
        profileImagePaths: '',
        times_found: 0,
        datesFound: ''
      })
      .then((docRef) => {
        if (storedLang && storedLang === 'de') {
          toastr.success('Benutzer wurde erfolgreich erstellt');
        } else {
          toastr.success('User has been successfully created');
        }
        setTimeout(function() {
          window.location.reload();
        }, 2000);
      })
      .catch((err) => {
        toastr.error('There was an error creating the user');
        console.log('error creating user', err);
      });
    }
  }

  /*==================================================================================================================================================================
   * Print blocked users table
  ===================================================================================================================================================================*/

  const blocked_user_colRef = collection(db, 'blockedUsers');

  let tableFirstnameLabel = 'NAME';
  let tableLastnameLabel = 'LAST NAME';
  let tableDateAddedLabel = 'DATE ADDED';
  let tableTimesFoundLabel = 'TIMES FOUND';
  let updateLabel = 'ACTION';

  if (storedLang && storedLang === 'de') {
    tableFirstnameLabel = 'VORNAME';
    tableLastnameLabel = 'NACHNAME';
    tableDateAddedLabel = 'DATE ADDED'; // TODO translate
    tableTimesFoundLabel = 'TIMES FOUND'; // TODO translate
    updateLabel = 'AKTION';
  }

  let blocked_users_table = new Tabulator("#admin-blocked-users-list", {
    //options here
    layout:"fitData",
    addRowPos:"top",
    history:true,
    pagination:"local",
    paginationSize:10,
    paginationSizeSelector:[10, 25, 50],
    paginationCounter:"rows",
    columns:[
      {title: tableFirstnameLabel, field:"firstname", sorter:"string", width:250, cssClass:"first_column", headerFilter: "list"},
      {title: tableLastnameLabel, field:"lastname", sorter:"string", width:250, cssClass:"other_columns", headerFilter: "list"},
      {title: tableDateAddedLabel, field:"dateAdded", width:250, cssClass:"other_columns"},
      {title: tableTimesFoundLabel, field:"timesFound", width:250, cssClass:"other_columns"}
      /*
      {title: updateLabel, width: 195, cssClass: "center_col tiny_columns", formatter: function(cell, formatterParams) {
        let value = cell.getValue();
        let buttonContainer = document.createElement("div");
        buttonContainer.setAttribute("class","actionBtnContainer");

        let editButton = document.createElement("button");
        editButton.setAttribute("onclick", "openModal2()");
        editButton.setAttribute("id", "open_companies_modal");
        let icon = document.createElement("img");
        icon.setAttribute("alt","Edit");
        icon.setAttribute("src",URLASSETS + ICON_PENCIL);
        editButton.appendChild(icon);

        buttonContainer.appendChild(editButton);

        return buttonContainer;
      }}
      */
    ],
  });

  $(document).ready(function() {
    $(".tabulator-paginator").find(".tabulator-page[data-page='prev']").html("&lt;");
    $(".tabulator-paginator").find(".tabulator-page[data-page='next']").html("&gt;");
    if (storedLang && storedLang === 'de') {
      $(".tabulator-paginator").find(".tabulator-page[data-page='first']").html("Zurück");
      $(".tabulator-paginator").find(".tabulator-page[data-page='last']").html("Vor");
    }
  });

  getDocs(blocked_user_colRef)
    .then((snapshot) => {
      let data = [];
      snapshot.docs.forEach((doc) => {
        let blockedUser = doc.data();
        data.push({firstname: blockedUser.user_firstname, lastname: blockedUser.user_lastname, dateAdded: blockedUser.date_added, timesFound: blockedUser.times_found});
        if (adminInfo.super_admin) {
          blocked_users_table.setData(data);
        } else {
          blocked_users_table.setData([]);
        }
      });
  })
  .catch(err => {
    console.log('error fetching blocked users list', err);
  });

  /*==================================================================================================================================================================
   * This function set the admin permissions for the page functionalities
  ===================================================================================================================================================================*/

  // TODO - set all up
  /*
  // Admins > basic_admin - company_admin - super_admin
  select_type_id.style.display = 'none';
  create_user_profile.style.display = 'none';
  head_user.style.display = 'none'; // TODO: Remove
  select_user.style.display = 'none';
  if (blocked_users_table) {
    blocked_users_table.style.display = 'none';
  }
  
  // Admins > basic_admin
  if (adminInfo.basic_admin) {
    user_profile_company_update.style.display = 'none';
    update_user_profile.style.display = 'none';
    user_dates.style.display = 'none';
    document.getElementById('company-filter').parentElement.style.display = 'none';
    document.getElementById('type-filter').parentElement.style.display = 'none';
    document.getElementById('new_user_company').parentElement.style.display = 'none';
      //document.getElementById('new_user_company').parentElement.classList.add('input-field-hidden');
    document.getElementById('create_user_zones').style.display = 'none';
    document.getElementById('update_user_zones').style.display = 'none';
    document.getElementById('accepted_option').style.display = 'none';
    document.getElementById('accepted_option_bulk').style.display = 'none';
  }

  // Admins > company_admin
  if (adminInfo.company_admin) {
    document.getElementById('create_user_zones').style.display = 'none';
  }

  // Admins > super_admin
  if (adminInfo.super_admin) {
    //select_type_id.style.display = 'none';
    if (blocked_users_table) {
      blocked_users_table.style.display = 'block';
    }
    create_user_profile.style.display = 'block';
    //head_user.style.display = 'grid'; // TODO: Remove
    //select_user.style.display = 'flex';
  }
    */

  /*==================================================================================================================================================================
   * Trigger Blocked user creation
  ===================================================================================================================================================================*/

  create_blocked_user_form.addEventListener('submit', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (adminInfo.super_admin) {
      await createBlockedUser();
    }
  });
}