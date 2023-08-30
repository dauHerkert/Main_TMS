import {doc, db, collection, query, getDocs, getDoc, setDoc, ref, getDownloadURL, addDoc, uploadBytes, storage } from './a_firebaseConfig';
import { getUserInfo, createOptions, changeCompanyNameToID, changeAdminTypeTitle } from './ab_base';
import Cropper from 'cropperjs';
import toastr from 'toastr';

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

    /*=============================================================================================================================================================
 * The provided code is part of the pageAdmin function, which handles date selection and user interface manipulation on an admin page. The first block of
 * code assigns a click event to an element with the ID "open_modal_btn" to open a modal and retrieve start and end dates. The updateDates function initializes
 * the date pickers using the Air Datepicker library. Language and format options are adjusted based on the selected language. Lastly, the user interface is
 * manipulated to show or hide elements based on the user's administrative role.
==============================================================================================================================================================*/

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