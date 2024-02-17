import { SUPPLIERSTARTDATE, SUPPLIERENDDATE, EVENTDATES,  URLEMAILTEMPLATES, URLASSETS, ICON_PENCIL, ICON_TRASH, IMAGE_PROFILE, firstImageURL, firstImageStyle, secondImageURL, secondImageStyle } from './a_constants';
import {doc, db, collection, query, getDocs, getDoc, setDoc, ref, getDownloadURL, addDoc, uploadBytes, storage, user } from './a_firebaseConfig';
import { getUserInfo, createOptions, changeAdminTypeTitle } from './ab_base';
import Cropper from 'cropperjs';
import toastr from 'toastr';
import Webcam from 'webcamjs'; 
import 'tabulator-tables/dist/js/tabulator.min.js';
import 'tabulator-tables/dist/css/tabulator.min.css'; 
import 'select2';
import 'select2/dist/css/select2.min.css';
import AirDatepicker from 'air-datepicker';
import localeEn from 'air-datepicker/locale/en';
import localeDe from 'air-datepicker/locale/de';
import 'air-datepicker/air-datepicker.css';

// ---- USERS TABLE EMAILS ----

let storedLang = localStorage.getItem("language");

// Applications - EN - Subjects and UI message Label
let application_rejected_subject = 'Accreditation Rejection';
let application_rejected_label = 'User registration declined';
let application_accepted_subject = 'Accreditation Confirmation';
let application_accepted_label = 'User registration accepted';
// Applications - EN - Press Mr - URL
let press_mr_application_rejected_url = URLEMAILTEMPLATES.URLEMAILFOLDER + URLEMAILTEMPLATES.URLMRAPPLICATIONREJECT_EN;
let press_mr_application_accepted_url = URLEMAILTEMPLATES.URLEMAILFOLDER + URLEMAILTEMPLATES.URLMRAPPLICATIONACCEPT_EN;
// Applications - EN - Press Ms - URL
let press_ms_application_rejected_url = URLEMAILTEMPLATES.URLEMAILFOLDER + URLEMAILTEMPLATES.URLMSAPPLICATIONREJECT_EN;
let press_ms_application_accepted_url = URLEMAILTEMPLATES.URLEMAILFOLDER + URLEMAILTEMPLATES.URLMSAPPLICATIONACCEPT_EN;
// Applications - EN - Press Diverse - URL
let press_diverse_application_rejected_url = URLEMAILTEMPLATES.URLEMAILFOLDER + URLEMAILTEMPLATES.URLDIVERSEAPPLICATIONREJECT_EN;
let press_diverse_application_accepted_url = URLEMAILTEMPLATES.URLEMAILFOLDER + URLEMAILTEMPLATES.URLDIVERSEAPPLICATIONACCEPT_EN;
// Applications - EN - Supplier - URL
let supplier_application_rejected_url = URLEMAILTEMPLATES.URLEMAILFOLDER + URLEMAILTEMPLATES.URLSUPPLIERAPPLICATIONREJECT_EN;
let supplier_application_accepted_url = URLEMAILTEMPLATES.URLEMAILFOLDER + URLEMAILTEMPLATES.URLSUPPLIERAPPLICATIONACCEPT_EN;

if (storedLang && storedLang === 'de') {
  // Applications - DE - Subjects and UI message Label
  application_rejected_subject = 'Akkreditierung Ablehnung';
  application_rejected_label = 'Benutzerregistrierung abgelehnt';
  application_accepted_subject = 'Akkreditierungsbestätigung';
  application_accepted_label = 'Benutzerregistrierung akzeptiert';
  // Applications - DE - Press Mr - URL
  press_mr_application_rejected_url = URLEMAILTEMPLATES.URLEMAILFOLDER + URLEMAILTEMPLATES.URLMRAPPLICATIONREJECT_DE;
  press_mr_application_accepted_url = URLEMAILTEMPLATES.URLEMAILFOLDER + URLEMAILTEMPLATES.URLMRAPPLICATIONACCEPT_DE;
  // Applications - DE - Press Ms - URL
  press_ms_application_rejected_url = URLEMAILTEMPLATES.URLEMAILFOLDER + URLEMAILTEMPLATES.URLMSAPPLICATIONREJECT_DE;
  press_ms_application_accepted_url = URLEMAILTEMPLATES.URLEMAILFOLDER + URLEMAILTEMPLATES.URLMSAPPLICATIONACCEPT_DE;
  // Applications - DE - Press Diverse - URL
  press_diverse_application_rejected_url = URLEMAILTEMPLATES.URLEMAILFOLDER + URLEMAILTEMPLATES.URLDIVERSEAPPLICATIONREJECT_DE;
  press_diverse_application_accepted_url = URLEMAILTEMPLATES.URLEMAILFOLDER + URLEMAILTEMPLATES.URLDIVERSEAPPLICATIONACCEPT_DE;
  // Applications - DE - Supplier - URL
  supplier_application_rejected_url = URLEMAILTEMPLATES.URLEMAILFOLDER + URLEMAILTEMPLATES.URLSUPPLIERAPPLICATIONREJECT_DE;
  supplier_application_accepted_url = URLEMAILTEMPLATES.URLEMAILFOLDER + URLEMAILTEMPLATES.URLSUPPLIERAPPLICATIONACCEPT_DE;
}

/*=============================================================================================================================================================
 * The provided code is part of the pageAdmin function, which handles date selection and user interface manipulation on an admin page. The first block of
 * code assigns a click event to an element with the ID "open_modal_btn" to open a modal and retrieve start and end dates. The updateDates function initializes
 * the date pickers using the Air Datepicker library. Language and format options are adjusted based on the selected language. Lastly, the user interface is
 * manipulated to show or hide elements based on the user's administrative role.
==============================================================================================================================================================*/


async function changeCompanyNameToID(user) {
  // Comprobar si user.user_company existe y no está vacío
  if (!user.user_company || user.user_company.trim() === "") {
    console.log("User does not have a user_company");
    return "No company"; // Puedes devolver cualquier valor predeterminado que necesites aquí
  }
  
  console.log("user:", user, "user.user_company:", user.user_company);

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

export async function pageAdmin(user) {

  $(document).on( 'click' , '#open_modal_btn' , function() {
    let user_start_date = document.getElementById('Select-dates');
    let user_end_date = document.getElementById('Select-dates2');
    let startDateCell = $(this).closest('div').siblings('div[tabulator-field="user_start_date"]');
    let endDateCell = $(this).closest('div').siblings('div[tabulator-field="user_end_date"]');
    user_start_date.value = startDateCell.text();
    user_end_date.value = endDateCell.text();
    var dateStartStr = user_start_date.value;
    var dateEndStr = user_end_date.value;

    //updateDates(user, dateStartStr, dateEndStr)
  })

  async function updateDates(user, dateStartStr, dateEndStr) {
    var today = new Date();
    var minDate;
    var maxDate = new Date(today.getFullYear(), EVENTDATES.MAXDATE_MONTH, EVENTDATES.MAXDATE_DAY);
    var startDatePicker = $('[data-date-picker="datepicker-start"]');
    var endDatePicker = $('[data-date-picker="datepicker-end"]');
    let userInfo = await getUserInfo(user);

    //Change minDate depending the user type
    if(userInfo.account_type == 'Press'){
      minDate = new Date(today.getFullYear(), EVENTDATES.MINDATE_MONTH, EVENTDATES.MINDATE_DAY);
    } else {
      minDate =  new Date(today.getFullYear(), EVENTDATES.MINDATE_MONTH, EVENTDATES.MINDATE_DAY);
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
    if (storedLang && storedLang === 'de') {
        datepickerLocaleToUse = 'de';
    }

    let startDatepickerOptions = {
      defaultDate: defaultStartDate,
      multipleDates: false,
      multipleDatesSeparator: ', ',
      dateFormat: 'mm-dd-yyyy',
      minDate: minDate,
      maxDate: maxDate,
      language: datepickerLocaleToUse,
      onHide: function(inst) {
        let selectedDates = inst.selectedDates;
        console.log(selectedDates);
      },
      onSelect: function({date, formattedDate, datepicker}) {
        datepicker.hide();
      }
    };

    let endDatepickerOptions = {
      defaultDate: defaultEndDate,
      multipleDates: false,
      multipleDatesSeparator: ', ',
      dateFormat: 'mm-dd-yyyy',
      minDate: minDate,
      maxDate: maxDate,
      language: datepickerLocaleToUse,
      onHide: function(inst) {
        let selectedDates = inst.selectedDates;
        console.log(selectedDates);
      },
      onSelect: function({date, formattedDate, datepicker}) {
        datepicker.hide();
      }
    };

    let startDatepickerInstance = new AirDatepicker(startDatePicker[0], startDatepickerOptions);
    let endDatepickerInstance = new AirDatepicker(endDatePicker[0], endDatepickerOptions);

    if (dateStartStr) {
      let startDateArray = dateStartStr.split(',').map(function(dateString) {
        return new Date(dateString);
      });
      startDatepickerInstance.selectDate(startDateArray);
    }

    if (dateEndStr) {
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
  let admin_create_user_form = document.getElementById('update_user_type');
  let userInfo = await getUserInfo(user);
  const userRef = doc(db, 'users', user.uid);
  const companyNames = await changeCompanyNameToID(userInfo);
  userInfo.user_company_name = companyNames;
  
  if (userInfo.user_company_name == undefined) {
    document.getElementById("company_name").innerHTML = 'No company';
  } else {
    const companies = userInfo.user_company_name.split(",");
    const firstCompany = companies[0];
    document.getElementById("company_name").innerHTML = `${firstCompany}`;
  }

  let select_type_id = document.getElementById('select_type_id');
  let user_profile_company_update = document.getElementById('user_company_update');
  let update_user_profile = document.getElementById('update_user_profile');
  let head_user = document.getElementById('head_user');

  // Admins > basic_admin - company_admin - user_is_admin
  select_type_id.style.display = 'none';
  user_profile_company_update.style.display = 'none';
  update_user_profile.style.display = 'none';
  head_user.style.display = 'none';
  user_dates.style.display = 'none';
  basic_admin.style.display = 'none';

  // Admins > basic_admin
  if (userInfo.basic_admin) {
    document.getElementById('company-filter').parentElement.style.display = 'none';
    document.getElementById('type-filter').parentElement.style.display = 'none';
    if (companies_table) {companies_table.style.display = 'none'};
    document.getElementById('new_user_company').parentElement.style.display = 'none';
    document.getElementById('update_user_zones').style.display = 'none';
    document.getElementById('accepted_option').style.display = 'none';
    document.getElementById('accepted_option_bulk').style.display = 'none';
  }

  // Admins > company_admin
  if (userInfo.company_admin) {
  }

  // Admins > user_is_admin
  if (userInfo.user_is_admin) {
    //select_type_id.style.display = 'none';
    user_profile_company_update.style.display = 'block';
    update_user_profile.style.display = 'block';
    head_user.style.display = 'flex';
    user_dates.style.display = 'flex';
    basic_admin.style.display = 'block';
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

  let statusOptions = {
    "Ok": "OK",
    "Declined": "DECLINED",
    "Pending": "PENDING",
    "Printed": "PRINTED"
  };

  let typeOptions = {
    "Press": "PRESS",
    "Supplier": "SUPPLIER"
  };
  if (storedLang && storedLang === 'de') {
    userTableFirstnameLabel = 'VORNAME';
    userTableLastnameLabel = 'NACHNAME';
    userTableCompanyLabel = 'FIRMA';
    userTableStatusLabel = 'STATUS';
    userTableAdminLabel = 'ADMIN';
    userTableUpdateLabel = 'BEARBEITEN';
    userTableSelectLabel = 'AUSWÄHLEN';
    userTableEditLabel = 'BEARBEITEN';

    statusOptions = {
      "Ok": "OK",
      "Declined": "DECLINED",
      "Pending": "PENDING",
      "Printed": "PRINTED"
    };

    typeOptions = {
      "Press": "PRESSE",
      "Supplier": "ANBIETER"
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
      if (userInfo.company_admin) {
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
        {title:"Press locker", field:"press_locker", sorter:"string", width:0, cssClass:"hidden-column"},
        {title:"Press hotel info", field:"press_hotel_info", sorter:"string", width:0, cssClass:"hidden-column"},
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
        {title: userTableFirstnameLabel, field:"name", sorter:"string", width:180, cssClass:"first_column",
          formatter: function(cell) {
            let value = cell.getValue();
            let name = value;
            if (value === (userInfo.user_firstname + ' ' + userInfo.user_lastname)) {
              name = '<span style="color:#E85B0F;"> > ' + value + '<span>';
            }
            return name;
          }
        },
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
            if (storedLang && storedLang === 'de') {
              if (value === "Ok") {
                label = "Accepted";
                color = "#27AE60";
              } else if (value === "Declined") {
                label = "Declined";
                color = "#E74C3C";
              } else if (value === "Pending") {
                label = "Pending";
                color = "#F39C12";
              } else if (value === "Printed") {
                label = "Printed";
                color = "#2980B9";
              }
            } else {
              if (value === "Ok") {
                label = "Accepted";
                color = "#27AE60";
              } else if (value === "Declined") {
                label = "Declined";
                color = "#E74C3C";
              } else if (value === "Pending") {
                label = "Pending";
                color = "#F39C12";
              } else if (value === "Printed") {
                label = "Printed";
                color = "#2980B9";
              }
            }
            return '<div style="display:flex;align-items:center;justify-content:flex-start"><div style="width:12px;height:12px;border-radius:50%;background-color:' + color + ';margin-right:0px;"></div><div style="margin-left:6px;">' + label + '</div></div>';
          },
          headerFilter: "list",
          headerFilterParams: {
            values: true,
            valuesSort: "asc",
            values: statusOptions,
            clearable: true,
          },
          headerFilterPlaceholder: "Status",
          cssClass: "small_columns",
        },
        {title:"USER TYPE", field: "account_type", sorter: "string", cssClass:"hidden-column", width:0, headerFilter: "list",
          headerFilterParams: {
            values: true,
            valuesSort: "asc",
            values: typeOptions,
            clearable: true,
          }},
        {title: userTableAdminLabel, field:"user_admin", width:0, cssClass:"hidden-column", formatter:function(cell, formatterParams, onRendered) {
            return cell.getValue() == 1 ? "Admin" : "";
          }},
        {title: userTableUpdateLabel, formatter:function(cell, formatterParams) {
            // Create first button
            let button1 = document.createElement("button");
            button1.setAttribute("onclick","openModal()");
            button1.setAttribute("id","open_modal_btn");
            button1.innerHTML = "<img src='" + URLASSETS + ICON_PENCIL + "' alt='Edit'/>";
            // Create second button
            let button2 = document.createElement("button");
            button2.setAttribute("onclick","openModal10()");
            button2.setAttribute("id","delete_btn");
            button2.innerHTML = "<img src='" + URLASSETS + ICON_TRASH + "' alt='Delete'/>";
            // Create a div to contain the buttons
            let buttonContainer = document.createElement("div");
            buttonContainer.appendChild(button1);
            buttonContainer.appendChild(button2);
            // Return the container with the buttons
            return buttonContainer;
          }, align: "center", cssClass:"center_col small_columns edit_delete_col", width: 120},
        {title: userTableSelectLabel, cssClass:"center_col tiny_columns", width: 105, formatter:function(cell, formatterParams) {
          let checkbox = document.createElement("input");
          checkbox.style.accentColor="#E85B0F";
          checkbox.style.height="18px";
          checkbox.style.width="18px";
          checkbox.type = "checkbox";
          checkbox.addEventListener("click", function() {
            let row = cell.getRow();
            let rowData = row.getData();
            let rowId = rowData.id;
            if (checkbox.checked) {
                selectedData.push(rowId);
            } else {
              selectedData = selectedData.filter(function(value) {
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
      if (storedLang && storedLang === 'de') {
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
        document.querySelector('#type-filter').value = "clear";

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
        document.querySelector('#type-filter-mob').value = "clear";

        table.clearHeaderFilter();
      });
    }

    const companyAdmin = userInfo.company_admin;
    const basicAdmin = userInfo.basic_admin;
    const adminCompanyName = userInfo.user_company;
    console.log('admin:', adminCompanyName);

    getDocs(q)
      .then((snapshot) => {
        let data = [];
        let promises = [];
        snapshot.docs.forEach((doc) => {
          let user = doc.data();

          promises.push(changeCompanyNameToID(user).then(userCompanyName => {
            if (!user.user_deleted) { 
              data.push({
                id: doc.id,
                user_fullname: user.user_fullname,
                special_requests: user.supplier_special_request,
                user_itwa: user.user_itwa,
                press_id: user.press_card_number,
                press_workspot: user.press_workspot,
                press_locker: user.press_locker,
                press_hotel_info: user.press_hotel_info,
                press_form_user: user.press_form_user,
                user_title: user.user_title,
                press_media_type: user.press_media_type,
                press_media: user.press_media,
                email: user.user_email,
                company_admin: user.company_admin,
                basic_admin: user.basic_admin,
                companyID: [user.user_company],
                user_company: user.company,
                user_type: user.user_type,
                account_type: user.account_type,
                user_zones: user.user_zones,
                user_start_date: user.supplier_start_date,
                user_end_date: user.supplier_end_date,
                language: user.language,
                name: user.user_firstname + ' ' + user.user_lastname,
                lastname: user.user_lastname,
                company: userCompanyName,
                status: user.user_status,
                user_admin: user.user_is_admin,
                nationality: user.user_nationality,
                address: user.user_address,
                city: user.user_city,
                zip: user.user_zip_code,
                country: user.user_country,
                phone: user.user_phone});
            }
          }));
        });
        return Promise.all(promises).then(() => data);
      })
      .then(data => {
        // Filter and set user data for the table based on admin privileges and company
        console.log(data, 'admin', adminCompanyName);
        table.setData((companyAdmin || basicAdmin) ? data.filter(user => user.companyID && user.companyID != ' ' && user.companyID != '' && user.companyID.some(x => adminCompanyName.includes(x))) : data);
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
  let user_specific_name = document.getElementById('user_specific_name');
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

    img.setAttribute('src', URLASSETS + IMAGE_PROFILE);

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
    } else if (isPhotoUploaded != true) {
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

  if (span7 || modal7) {
    span7.onclick=function() {
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
        basic_admin_update.value = false;
      }
      console.log('basic admin variable', basic_admin_update);
      console.log('basic admin value', (String(basic_admin_update.value).toLowerCase() === 'true'));

      setDoc(userRef, {
        user_type: userTypeUpdate.value,
        account_type: accountTypeUpdate.value,
        user_status: user_status_update.value,
        user_company: selectedUserCompaniesString,
        user_zones: selectedUserZonesString,
        company_admin: (String(company_admin.value).toLowerCase() === 'true'),
        supplier_visit_dates: updated_dates.value,
        basic_admin: (String(basic_admin_update.value).toLowerCase() === 'true'),
        user_itwa: update_itwa.value,
        press_workspot: update_workspace.value,
        press_card_number: update_card_number.value,
        press_media_type: update_media_type.value,
        user_address: update_user_address.value,
        supplier_special_request: update_special_request.value
      }, { merge: true })
        .then(() => {
          console.log('sending email... status is ', user_status_update.value);
          console.log('stored lang for email is ', storedLang);

          // URL By Gender - Mr
          let genderPressRejectedURL = press_mr_application_rejected_url;
          let genderPressAcceptedURL = press_mr_application_accepted_url;
          if (press_user_title.textContent == 'Ms') {
            // URL By Gender - Ms
            genderPressRejectedURL = press_ms_application_rejected_url;
            genderPressAcceptedURL = press_ms_application_accepted_url;
          } else if (press_user_title.textContent == 'Diverse') {
            // URL By Gender - Diverse
            genderPressRejectedURL = press_diverse_application_rejected_url;
            genderPressAcceptedURL = press_diverse_application_accepted_url;
          }

          // Final Email info - Application Accepted
          let emailSubject = application_accepted_subject;
          let emailLabel = application_accepted_label;
          var emailURL = genderPressAcceptedURL;
          let fullName = `${admin_user_name.value}`;
          let lastName = `${admin_user_lastname.value}`;
          let nameToDisplay = lastName;

          // Final Email info - Application Rejected
          if (user_status_update.value == 'Declined') {
            emailSubject = application_rejected_subject;
            emailLabel = application_rejected_label;
          }

          // URL: Press or Supplier and Rejected or Accepted
          console.log('admin_user_name.value >>>>>> ', admin_user_name.value);
          console.log('press_user_title.textContent >>>>>> ', press_user_title.textContent);
          console.log('user_status_update.value >>>>>> ',press_user.account_type);
          console.log('press_user.textContent >>>>>> ', press_user.textContent);
          
          if (userData.data().account_type == "Press") {
            if (user_status_update.value == 'Declined') {
              emailURL = genderPressRejectedURL;
            }
          } else {
            nameToDisplay = fullName;
            if (user_status_update.value == 'Declined') {
              emailURL = supplier_application_rejected_url;
            } else {
              emailURL = supplier_application_accepted_url;
            }
          }

          // TODO: review user_specific_name in the email sended
          // Application action email send
          (async () => {
            if (send_email.checked) {
              try {
                const html = await fetch(emailURL)
                  .then(response => response.text())
                  .then(html => html.replaceAll('${fullName}', nameToDisplay))
                  .then(html => html.replace('${firstImageURL}', firstImageURL))
                  .then(html => html.replace('${firstImageStyle}', firstImageStyle))
                  .then(html => html.replace('${secondImageURL}', secondImageURL))
                  .then(html => html.replace('${secondImageStyle}', secondImageStyle));
                const docRef = addDoc(collection(db, "mail"), {
                  to: ['juan.torres@dauherkert.de',`${user_specific_email.value}`],
                  message: {
                    subject: emailSubject,
                    html: html,
                  }
                });
                console.log("Document written with ID: ", docRef.id);
              } catch (e) {
                console.error("Error adding document: ", e);
              }
            }
            toastr.success(emailLabel);
            document.getElementById('update_user_modal').style.display = 'none';
            $('body').css("overflow", "unset");
          })();
          saveUserZones();
          setTimeout(function() {
            window.location.reload();
          }, 2000);
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
        user_deleted: true,
        confirmed_email: false
      }, { merge: true })
        .then(() => {
          toastr.success('User succesfully deleted');
          setTimeout(function() {
            window.location.reload();
          }, 2000);
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
      if (userData.exists) {
        setDoc(userRef, {
          user_status: bulk_status_update.value,
        }, { merge: true })
          .then(() => {

            // URL By Gender - Mr
            let genderPressRejectedURL = press_mr_application_rejected_url;
            let genderPressAcceptedURL = press_mr_application_accepted_url;
            if (userData.data().user_title == 'Ms') {
              // URL By Gender - Ms
              genderPressRejectedURL = press_ms_application_rejected_url;
              genderPressAcceptedURL = press_ms_application_accepted_url;
            } else if (userData.data().user_title == 'Diverse') {
              // URL By Gender - Diverse
              genderPressRejectedURL = press_diverse_application_rejected_url;
              genderPressAcceptedURL = press_diverse_application_accepted_url;
            }

            // Final Email info - Application Accepted
            let emailSubject = application_accepted_subject;
            let emailLabel = application_accepted_label;
            let emailURL = genderPressAcceptedURL;
            let fullName = `${userData.data().user_firstname} ${userData.data().user_lastname}`;
            let lastName = `${userData.data().user_lastname}`;
            let nameToDisplay = lastName;

            // Final Email info - Application Rejected
            if (bulk_status_update.value == 'Declined') {
              emailSubject = application_rejected_subject;
              emailLabel = application_rejected_label;
            }

            // URL: Press or Supplier and Rejected or Accepted
            if (userData.data().account_type == "Press") {
              if (bulk_status_update.value == 'Declined') {
                emailURL = genderPressRejectedURL;
              }
            } else {
              nameToDisplay = fullName;
              if (bulk_status_update.value == 'Declined') {
                emailURL = supplier_application_rejected_url;
              } else {
                emailURL = supplier_application_accepted_url;
              }
            }

            // TODO: review body modal-open
            // Application action email send
            (async () => {
              try {
                const html = await fetch(emailURL)
                  .then(response => response.text())
                  .then(html => html.replaceAll('${fullName}', nameToDisplay))
                  .then(html => html.replace('${firstImageURL}', firstImageURL))
                  .then(html => html.replace('${firstImageStyle}', firstImageStyle))
                  .then(html => html.replace('${secondImageURL}', secondImageURL))
                  .then(html => html.replace('${secondImageStyle}', secondImageStyle));
                const docRef = addDoc(collection(db, "mail"), {
                  to: ['juan.torres@dauherkert.de',`${user_specific_email.value}`],
                  message: {
                    subject: emailSubject,
                    html: html,
                  }
                });
                console.log("Document written with ID: ", docRef.id);
              } catch (e) {
                console.error("Error adding document: ", e);
              }
              toastr.success(emailLabel);
              document.getElementById('update_user_modal').style.display = 'none';
              $('body').css("overflow", "unset");
            })();
            setTimeout(function() {
              window.location.reload();
            }, 2000);
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
    console.log('company(s) selected', newUserCompaniesString);
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
        // set admin company as default company 
        if (userInfo.user_company != '' && company.company_id == userInfo.user_company) {
          opt.selected = true;
        }
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

  let newUserCompany = document.getElementById('new_user_company');
  // Admins > basic_admin
  if (userInfo.basic_admin) {
    // Dafault Admin data to create users
    console.log('userInfo.user_company ', userInfo.user_company);
    //newUserCompany.value = userInfo.user_company;

    const adminCompanyRef = doc(db, 'companies', userInfo.user_company);
    const adminCompanySnapshot = await getDoc(adminCompanyRef);
    if (adminCompanySnapshot.exists()) {
      const adminProfile = adminCompanySnapshot.data().company_profile;
      document.getElementById('new_user_profile').value = adminProfile;
      console.log('adminProfile ', adminProfile);

      const adminProfileRef = doc(db, 'profiles', adminProfile);
      const adminProfileSnapshot = await getDoc(adminProfileRef);
      if (adminProfileSnapshot.exists()) {
        const adminZone = adminProfileSnapshot.data().zones;
        //document.getElementById('createUserZones').value = adminZone.split(",")[0];
        console.log('adminZone ', adminZone);
        console.log('adminZone ', adminZone.split(","));

        // Update the options for the zones select
        const allOptions = create_user_zone.options;
        for (let i = 0; i < allOptions.length; i++) {
          const option = allOptions[i];
          console.log('option ', option);
          if (adminZone.split(",").includes(option.value)) {
            option.selected = true;
          } else if (option.selected) {
            option.selected = false;
          }
        }
      }
    }
  }

  async function createUser(user) {
    if (!upload_cropper) {
      toastr.error('Please select an image to upload');
      return;
    }
    if (new_user_firstname.value && new_user_lastname.value) {
      new_user_fullname = (new_user_firstname.value + new_user_lastname.value).toLowerCase().replace(/\s/g, '');
    }

    let selectedNewUserCompanies = $('#new_user_company').val();
    newUserCompaniesString = selectedNewUserCompanies.join(', ');
    console.log('company(s) selected', newUserCompaniesString);

    let storedLang = localStorage.getItem("language");
    if (!storedLang) {storedLang = userInfo.language}
    let companyRef;
    companyRef = await addDoc(collection(db, "users"), {
      user_firstname: new_user_firstname.value,
      user_lastname: new_user_lastname.value,
      account_type: new_user_account_type.value,
      user_company: newUserCompaniesString,
      user_type: new_user_profile.value,
      user_status: 'Pending',
      company_admin: false,
      basic_admin: false,
      confirmed_email: true,
      language: storedLang,
      press_form_user: false,
      press_media: '',
      press_media_type: '',
      press_workspot: false,
      press_locker: false,
      press_hotel_info: false,
      user_address: '',
      user_city: '',
      user_country: '',
      user_email: '',
      user_is_admin: false,
      user_itwa: false,
      user_nationality:'',
      user_phone:'',
      user_title:'',
      user_zip_code:'',
      user_fullname: new_user_fullname,
      user_zones: selectedCreateUserZonesString,
      supplier_start_date: SUPPLIERSTARTDATE,
      supplier_end_date: SUPPLIERENDDATE,
      user_deleted: false
    })
      .then((companyRef) => {
        userUploadImage(companyRef.id);
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

  // Upload profile picture
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