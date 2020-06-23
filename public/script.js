let map;
let marker;
let curLat = 0;
let curLng = 0;

function loadscreen3() {
  document.getElementById("nextFound").addEventListener("click", function() {
    addItem("Found");
  });

  // UPLOAD IMAGE
  document.querySelector("#imgUpload").addEventListener("change", () => {
    // get the file with the file dialog box
    const selectedFile = document.querySelector("#imgUpload").files[0];
    // store it in a FormData object
    const formData = new FormData();
    formData.append("newImage", selectedFile, selectedFile.name);

    // build an HTTP request data structure
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/upload", true);
    xhr.onloadend = function(e) {
      // Get the server's response to the upload
      console.log(xhr.responseText);
      sessionStorage.setItem(
        "photo",
        "http://ecs162.org:3000/images/" + xhr.responseText
      );
    };
    xhr.send(formData);
  });
}

function loadscreen6() {
  document.getElementById("nextLost").addEventListener("click", function() {
    addItem("Lost");
  });
  
  // UPLOAD IMAGE
  document.querySelector("#imgUpload").addEventListener("change", () => {
    // get the file with the file dialog box
    const selectedFile = document.querySelector("#imgUpload").files[0];
    // store it in a FormData object
    const formData = new FormData();
    formData.append("newImage", selectedFile, selectedFile.name);

    // build an HTTP request data structure
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/upload", true);
    xhr.onloadend = function(e) {
      // Get the server's response to the upload
      console.log(xhr.responseText);
      sessionStorage.setItem(
        "photo",
        "http://ecs162.org:3000/images/" + xhr.responseText
      );
    };
    xhr.send(formData);
  });
}

function loadscreen4() {
  document.getElementById("submitFound").addEventListener("click", function() {
    updateItem();
  });
}

function loadscreen7() {
  document.getElementById("submitLost").addEventListener("click", function() {
    updateItem();
  });
}

function loadscreen5() {
  document
    .getElementById("searchScreen5")
    .addEventListener("click", function() {
      searchItem("Found");
    });
}

function loadscreen8() {
  document
    .getElementById("searchScreen8")
    .addEventListener("click", function() {
      searchItem("Lost");
    });
}

//screen9.html & screen10.html
function loadscreenEnd() {
  let lostFound = sessionStorage.getItem("lostFound");
  let startDate = sessionStorage.getItem("startDate");
  let startTime = sessionStorage.getItem("startTime");
  let endDate = sessionStorage.getItem("endDate");
  let endTime = sessionStorage.getItem("endTime");
  let category = sessionStorage.getItem("category");
  let location = sessionStorage.getItem("location");
  let month = new Array();
  month[0] = "January";
  month[1] = "February";
  month[2] = "March";
  month[3] = "April";
  month[4] = "May";
  month[5] = "June";
  month[6] = "July";
  month[7] = "August";
  month[8] = "September";
  month[9] = "October";
  month[10] = "November";
  month[11] = "December";

  let searchInf = "";
  let startMonth = month[startDate.slice(5, 7) - 1];
  let startDay = startDate.slice(8, 10);
  let endMonth = month[endDate.slice(5, 7) - 1];
  let endDay = endDate.slice(8, 10);

  if (startDay[1] == "1") {
    startDay = startDay + "st";
  } else if (startDay == "02") {
    startDay = startDay + "nd";
  } else if (startDay[1] == "3") {
    startDay = startDay + "rd";
  } else {
    startDay = startDay + "th";
  }

  if (endDay[1] == "1") {
    endDay = endDay + "st";
  } else if (endDay == "02") {
    endDay = endDay + "nd";
  } else if (endDay[1] == "3") {
    endDay = endDay + "rd";
  } else {
    endDay = endDay + "th";
  }

  if (startDate != "") {
    searchInf =
      searchInf + startMonth + " " + startDay + " - " + endMonth + " " + endDay;
    if (category != "" || location != "") {
      searchInf = searchInf + ", ";
    }
  }

  if (category != "") {
    searchInf = searchInf + category;
    if (location != "") {
      searchInf = searchInf + ", ";
    }
  }
  if (location != "") {
    searchInf = searchInf + location;
  }
  document.getElementById("searchInf").textContent = searchInf;

  let data = {
    lostFound: lostFound,
    startDate: startDate,
    startTime: startTime,
    endDate: endDate,
    endTime: endTime,
    category: category,
    location: location
  };

  let xhr = new XMLHttpRequest();
  xhr.open("POST", "/searchItem");
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.addEventListener("load", function() {
    if (xhr.status == 200) {
      let listOfItems = JSON.parse(xhr.responseText);

      var table = document.createElement("TABLE");
      document.body.appendChild(table);
      table.className = "table";
      var rowCount = listOfItems.length;

      var row, cell1, cell2;

      for (let i = 0; i < rowCount; i++) {
        row = table.insertRow(i);
        if (listOfItems.lostFound === "lost") {
          row.className = "rowOfLost";
        } else {
          row.className = "rowOfFound";
        }

        cell1 = row.insertCell(0);
        cell2 = row.insertCell(1);
        cell1.innerHTML = listOfItems[i].title;
        cell1.className = "titlesCell";
        cell2.innerHTML = "<b>MORE<b>";
        cell2.className = "moreCell";
        cell2.addEventListener("click", function() {
          showHide(i);
        });        
                //inner table, hidden unless more is pressed
        var innerRow = table.insertRow(-1);
        var innerTable = document.createElement("TABLE");
        cell2.appendChild(innerRow);

        innerRow.appendChild(innerTable);
        innerTable.id = "hidden" + i;
        innerTable.className = "hide";
        innerTable.style.display = "none";
        
        if (listOfItems[i].photoURL != '' && listOfItems[i].photoURL != null && listOfItems[i].photoURL != "null") {
          var img = document.createElement("img");
          img.src = listOfItems[i].photoURL;
          img.className = "collapseImg";
          innerTable.appendChild(img);
        }
        
        var categor = innerTable.insertRow(0); //row 0 is category
        var categor1 = categor.insertCell(0);
        var categor2 = categor.insertCell(1);
        categor1.className = "infoDes";
        categor1.innerHTML = "Category ";
        categor2.innerHTML = listOfItems[i].category;
        categor2.className = "info";

        var locat = innerTable.insertRow(1); //row 1 is location
        var locat1 = locat.insertCell(0);
        var locat2 = locat.insertCell(1);
        locat1.className = "infoDes";
        locat1.innerHTML = "Location ";
        locat2.innerHTML = listOfItems[i].location;
        locat2.className = "info";

        var dateDisplay = innerTable.insertRow(2); //row 2 is date
        var date1 = dateDisplay.insertCell(0);
        var date2 = dateDisplay.insertCell(1);
        date1.className = "infoDes";
        date1.innerHTML = "Date ";
        let finalDate;
        if (listOfItems[i].date != ""){
            let month = new Array();
              month[0] = "January";
              month[1] = "February";
              month[2] = "March";
              month[3] = "April";
              month[4] = "May";
              month[5] = "June";
              month[6] = "July";
              month[7] = "August";
              month[8] = "September";
              month[9] = "October";
              month[10] = "November";
              month[11] = "December";
        let fullDate = listOfItems[i].date;
        let collapsemonth = month[fullDate.slice(5,7)-1];
        let day = fullDate.slice(8,10);
        if (day[1] == "1") {
          day = day + "st";
      } else if (day == "02") {
        day = day + "nd";
      } else if (day[1] == "3") {
        day = day + "rd";
      } else {
        day = day + "th";
      }
      finalDate = collapsemonth + " " + day;
        }
        date2.innerHTML = finalDate + " " + listOfItems[i].time;
        date2.className = "info";

        var descript = innerTable.insertRow(3); //row 3 is description
        descript.className = "desRow";
        var descript1 = descript.insertCell(0);
        descript1.className = "des";
        descript1.colSpan = 2;
        descript1.innerHTML = listOfItems[i].description;
      }

      console.log(xhr.responseText);
    } else {
      console.log(xhr.responseText);
    }
  });
  xhr.send(JSON.stringify(data));

  // The edit search button redirects to the page 8 and page 5 respectively.
  let editscreen9 = document.querySelector("#editSearch");
  if (editscreen9) {
    editscreen9.addEventListener("click", function(e) {
      window.location.href = "/screen8.html";
    });
  }

  let editscreen10 = document.querySelector("#editSearch1");
  if (editscreen10) {
    editscreen10.addEventListener("click", function(e) {
      window.location.href = "/screen5.html";
    });
  }
}

function showHide(index) {
  var element = document.getElementById("hidden" + index);
  if (element.style.display === "flex") {
    element.style.display = "none";
  } else {
    element.style.display = "flex";
  }
}

//screen3.html & screen6.html//
function addItem(lostFound) {
  sessionStorage.setItem("lostFound", lostFound);
  sessionStorage.setItem("title", document.getElementById("title").value);
  sessionStorage.setItem("category", document.getElementById("category").value);
  sessionStorage.setItem("description", document.getElementById("description").value);
  sessionStorage.setItem("photo", sessionStorage.getItem("photo"));
  //let photo = sessionStorage.getItem('photo');
  //console.log("in add item: ", photo);

  if (lostFound === "Found") {
    location.href = "https://spiral-north-plough.glitch.me/screen4.html";
  } else {
    location.href = "https://spiral-north-plough.glitch.me/screen7.html";
  }
}

//screen 4 & screen 7//
function updateItem() {
  let lostFound = sessionStorage.getItem("lostFound");
  let title = sessionStorage.getItem("title");
  let category = sessionStorage.getItem("category");
  let description = sessionStorage.getItem("description");
  let photo = sessionStorage.getItem("photo");

  let date = document.getElementById("date").value;
  let time = document.getElementById("time").value;
  let location = document.getElementById("location").value;

  let data = {
    lostFound: lostFound,
    title: title,
    category: category,
    description: description,
    photoURL: photo,
    date: date,
    time: time,
    location: location
  };
  let xhr = new XMLHttpRequest();
  xhr.open("POST", "/updateItem");
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.addEventListener("load", function() {
    if (xhr.status == 200) {
      console.log(xhr.responseText);
    } else {
      console.log(xhr.responseText);
    }
  });
  xhr.send(JSON.stringify(data));
}
//screen 4 & screen 7//

//screen 5 & 8//
function searchItem(lostFound) {
  sessionStorage.setItem("lostFound", lostFound);
  sessionStorage.setItem(
    "startDate",
    document.getElementById("startDate").value
  );
  sessionStorage.setItem(
    "startTime",
    document.getElementById("startTime").value
  );
  sessionStorage.setItem("endDate", document.getElementById("endDate").value);
  sessionStorage.setItem("endTime", document.getElementById("endTime").value);
  sessionStorage.setItem("category", document.getElementById("category").value);
  sessionStorage.setItem("location", document.getElementById("location").value);

  //if one element of Date and Time is full all of it should be too. This checks for that
  if (
    (document.getElementById("startDate").value == "" ||
      document.getElementById("endDate").value == "" ||
      document.getElementById("startTime").value == "" ||
      document.getElementById("endTime").value == "") &&
    (document.getElementById("startDate").value != "" ||
      document.getElementById("endDate").value != "" ||
      document.getElementById("startTime").value != "" ||
      document.getElementById("endTime").value) != ""
  ) {
    alert("Please complete all date entries");
    return;
  }
  //check to see if all categories are empty
  if (
    document.getElementById("startDate").value == "" &&
    document.getElementById("endDate").value == "" &&
    document.getElementById("startTime").value == "" &&
    document.getElementById("endTime").value == "" &&
    document.getElementById("category").value == "" &&
    document.getElementById("location").value == ""
  ) {
    alert("Please provide some information on your item");
    return;
  }
  if (lostFound === "Found") {
    location.href = "https://spiral-north-plough.glitch.me/screen10.html";
  } else {
    location.href = "https://spiral-north-plough.glitch.me/screen9.html";
  }
}

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 38.537, lng: -121.754 },
    zoom: 16
  });
  marker = new google.maps.Marker({
    position: { lat: 38.537, lng: -121.754 },
    map: map,
    draggable: true
  });

  marker.addListener("dragend", function() {
    map.setCenter(marker.getPosition());

    curLat = marker.getPosition().lat();
    curLng = marker.getPosition().lng();

    let data = {
      lat: marker.getPosition().lat(),
      lng: marker.getPosition().lng()
    };
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/getAddress");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.addEventListener("load", function() {
      if (xhr.status == 200) {
        let info = JSON.parse(xhr.responseText);
        let formAddress = info.results[0].formatted_address;
        document.getElementById("location").value = formAddress;
      } else {
        console.log(xhr.responseText);
      }
    });
    xhr.send(JSON.stringify(data));
  });
}

let buildings = [
  "Academic Surge",
  "Activities & Recreation Center (ARC)",
  "Advanced Materials Research Laboratory",
  "Aggie Surplus (Bargain Barn) & Custodial",
  "Advanced Transportation Infrastructure Research Center",
  "Agriculture Field Station",
  "Agriculture Service Office",
  "Animal Husbandry Beef Barn",
  "Animal Husbandry Feed Scales",
  "Animal Husbandry Sheep",
  "Animal Resource Service V (AH Goat)",
  "Animal Resources Service Headquarters",
  "Animal Science Horse Barn",
  "Animal Sciences Teaching Facility 1",
  "Animal Sciences Teaching Facility 2",
  "Ann E. Pitzer Center",
  "Annual Fund Trailer",
  "Aquaculture Facility Hatchery",
  "Aquatic Biology & Environmental Science Bldg",
  "Aquatic Weed Laboratory",
  "Arboretum Headquarters (Valley Oak Cottage)",
  "Arboretum Teaching Nursery",
  "Art Annex",
  "Art Building",
  "Art Studio-Graduate Building",
  "Asmundson Hall",
  "Bainer Hall",
  "Bike Barn",
  "Bowley Plant Science Teaching Facility",
  "Briggs Hall",
  "California Hall",
  "California Raptor Museum",
  "Center for Companion Animal Health",
  "Center for Comparative Medicine",
  "Center for Equine Health",
  "Center for Health & Environment Office & Laboratory",
  "Center for Neuroscience",
  "Center for Vectorborne Diseases, Laboratory",
  "Center for Vectorborne Diseases, Main Office",
  "Center for Vectorborne Diseases, Staff Offices",
  "Chancellor's Residence",
  "Chemistry",
  "Chemistry Annex",
  "Civil & Industrial Services",
  "116 A Street",
  "Conference Center & Welcome Center",
  "Contained Research Facility",
  "Cottonwood Cottage (Temporary Classroom 30)",
  "Cowell Building",
  "Cruess Hall",
  "Dairy",
  "Davis 501 Oak Ave",
  "Design & Construction Management (DCM)",
  "Dutton Hall",
  "Earth and Physical Sciences Building",
  "Earth & Planetary Sciences Shockwave Lab",
  "East House",
  "Educational Opportunity Program (EOP)",
  "Eichhorn Family House",
  "Elderberry Cottage",
  "Enology Laboratory Building",
  "Environmental Horticulture",
  "Environmental Services Facility Headquarters",
  "Equestrian Center Covered Arena",
  "Everson Hall",
  "Facilities Mechanical Operations",
  "Facilities Services",
  "Facilities Structural Trailer",
  "Fire & Police Building",
  "Fleet Services Central Garage Campus",
  "FOA: 1050 Extension Center Drive",
  "FPS Facility (Main Lab & Office)",
  "Freeborn Hall",
  "Gallagher Hall",
  "Gateway Parking Structure",
  "Genome & Biomedical Sciences Facility",
  "Geotechnical Centrifuge",
  "Germplasm Laboratory",
  "Ghausi Hall",
  "Giedt Hall",
  "Gourley Clinical Teaching Center",
  "Grounds",
  "Music Annex",
  "Guilbert House",
  "Hangar",
  "Hangar Office",
  "Haring Hall",
  "Harry H. Laidlaw Jr. Honey Bee Research Facility",
  "Hart Hall",
  "Heitman Staff Learning Center",
  "Hickey Gym",
  "Hoagland Annex",
  "Hoagland Hall",
  "Hopkins Building",
  "Hopkins Svcs Complex Auxiliary",
  "Hopkins Svcs Complex Receiving",
  "Human and Community Development Administration",
  "Human Resources Administration Building",
  "Hunt Hall",
  "Hutchison Child Development Center",
  "Hutchison Hall",
  "Hyatt Place",
  "International Center",
  "International House",
  "Jackson Sustainable Winery",
  "John A. Jungerman Hall (formerly Crocker Nuclear Lab)",
  "Kemper Hall",
  "Kerr Hall",
  "King Hall",
  "Kleiber Hall",
  "Latitude Dining Commons",
  "Life Sciences",
  "Maddy Lab",
  "Manetti Shrem Museum",
  "Mann Laboratory",
  "Mathematical Sciences Building",
  "Meat Laboratory, Cole Facility Building C",
  "Medical Sciences 1 B (Carlson Health Sciences Library)",
  "Medical Sciences 1 C",
  "Medical Sciences 1 D",
  "Memorial Union",
  "Meyer Hall",
  "Mondavi Center for the Performing Arts",
  "Mondavi Center for the Performing Arts - Administration",
  "Mrak Hall",
  "Music Building",
  "Nelson Hall (University Club)",
  "Neurosciences Building",
  "Noel-Nordfelt Animal Science Goat Dairy and Creamery",
  "North Hall",
  "Olson Hall",
  "Orchard House",
  "Outdoor Adventures",
  "Parsons Seed Certification Center",
  "Pavilion at the ARC",
  "Peter A. Rock Hall",
  "Peter J. Shields Library",
  "Pavilion Parking Structure",
  "Physical Sciences & Engineering Library",
  "Physics Building",
  "Plant & Environmental Sciences",
  "Plant Reproductive Biology Facility",
  "Pomology Field House C",
  "Poultry Headquarters",
  "Pritchard VMTH",
  "Putah Creek Lodge",
  "Quad Parking Structure",
  "Regan Central Commons",
  "Reprographics",
  "Robbins Hall",
  "Robbins Hall Annex",
  "Robert Mondavi Institute Brewery, Winery, and Food Pilot Facility",
  "Robert Mondavi Institute - North",
  "Robert Mondavi Institute - Sensory",
  "Robert Mondavi Institute - South",
  "Roessler Hall",
  "Schaal Aquatic Center",
  "Schalm Hall",
  "School of Education Building",
  "Sciences Lab Building",
  "Sciences Lecture Hall",
  "Scrub Oak Hall (Auditorium)",
  "Scrubs Cafe",
  "Segundo Dining Commons",
  "Segundo Services Center",
  "Silo",
  "Silo South",
  "Social Sciences & Humanities",
  "Social Sciences Lecture Hall (1100)",
  "South Hall",
  "Sprocket Annex",
  "Sprocket Building",
  "Sproul Hall",
  "Storer Hall",
  "Student Community Center",
  "Student Health & Wellness Center",
  "Student Housing",
  "Surge II",
  "Surge IV (TB 200,TB 201,TB 202,TB 203)",
  "Swine Teaching and Research Facility",
  "TB 009",
  "TB 16",
  "TB 116",
  "TB 117",
  "TB 118",
  "TB 119",
  "TB 120",
  "TB 123",
  "TB 124",
  "TB 140",
  "TB 188",
  "TB 189",
  "TB 206",
  "TB 207",
  "Temporary Classroom 1",
  "Temporary Classrooms 2 & 3",
  "Tercero Services Center",
  "The Barn",
  "The Grove (Surge III)",
  "Thermal Energy Storage",
  "Thurman Laboratory",
  "Toomey Weight Room",
  "Transportation and Parking Services",
  "Trinchero Family Estates Building",
  "Tupper Hall",
  "UC Davis Health Stadium East",
  "UC Davis Health Stadium North",
  "UC Davis Health Stadium North",
  "UC Davis Health Stadium West",
  "Unitrans Maintenance Facility",
  "University Extension Building",
  "University House & Annex",
  "University Services Building",
  "Urban Forestry",
  "Utilities Headquarters",
  "Valley Hall",
  "Veihmeyer Hall",
  "Vet Med 3A",
  "Vet Med 3A - MPT",
  "Vet Med 3B",
  "Vet Med Equine Athletic Performance Lab",
  "Vet Med Laboratory Facility Large Animal Holding",
  "Veterinary Medicine 2",
  "Veterinary Medicine Student Services and Administrative Center",
  "Veterinary Genetics Lab",
  "Viticulture Relocation C",
  "Voorhies Hall",
  "Walker Hall",
  "Walnut Cottage",
  "Walter A. Buehler Alumni Center",
  "Water Science & Engineering Hydraulic L2",
  "Watershed Science Facility",
  "Wellman Hall",
  "West House",
  "Western Center for Agricultural Equipment",
  "Western Human Nutrition Research Center (WHNRC)",
  "Wickson Hall",
  "Willow Cottage",
  "Wright Hall",
  "Wyatt Deck",
  "Wyatt Pavilion",
  "Young Hall",
  "Young Hall Annex"
];

function autocomplete(inp, arr) {
  /*the autocomplete function takes two arguments,
  the text field element and an array of possible autocompleted values:*/
  var currentFocus;
  inp.addEventListener("input", function(e) {
    var a,
      b,
      i,
      val = this.value;
    closeAllLists();
    if (!val) {
      return false;
    }
    currentFocus = -1;
    a = document.createElement("DIV");
    a.setAttribute("id", this.id + "autocomplete-list");
    a.setAttribute("class", "autocomplete-items");
    this.parentNode.appendChild(a);
    for (i = 0; i < arr.length; i++) {
      if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
        b = document.createElement("DIV");
        b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
        b.innerHTML += arr[i].substr(val.length);
        b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
        b.addEventListener("click", function(e) {
          inp.value = this.getElementsByTagName("input")[0].value;
          closeAllLists();
        });
        a.appendChild(b);
      }
    }
  });
  /*execute a function presses a key on the keyboard:*/
  inp.addEventListener("keydown", function(e) {
    var x = document.getElementById(this.id + "autocomplete-list");
    if (x) x = x.getElementsByTagName("div");
    if (e.keyCode == 40) {
      currentFocus++;
      addActive(x);
    } else if (e.keyCode == 38) {
      currentFocus--;
      addActive(x);
    } else if (e.keyCode == 13) {
      e.preventDefault();
      if (currentFocus > -1) {
        if (x) x[currentFocus].click();
      }
    }
  });
  function addActive(x) {
    if (!x) return false;
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = x.length - 1;
    x[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(x) {
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }
  function closeAllLists(elmnt) {
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  document.addEventListener("click", function(e) {
    closeAllLists(e.target);
  });
}

function loadscreen2() {
  let finder = document.getElementsByClassName("finder");
  finder[0].addEventListener("click", function(e) {
    console.log("Hello");
    window.location.href = "/screen3.html";
  });

  let seeker = document.getElementsByClassName("seeker");
  seeker[0].addEventListener("click", function(e) {
    console.log("Hello");
    window.location.href = "/screen6.html";
  });
}

function imageRedirect() {
  window.location.href = "/screen2.html";
}

function existingRequestRedirect() {
  window.location.href = "/screen5.html";
}

function existingItemRedirect() {
  window.location.href = "/screen8.html";
}

//******** google login code begins******
function loadScreen1() {
  // console.log('SCRIPT WORKING');
  let urlParams = window.location.search;
  let getQuery = urlParams.split("?")[1];
  let params = getQuery.split("&");
  console.log("urlParams", params);
  if (params[0] === "email=notUCD") {
    document.querySelector("#message").innerHTML =
      "Login with your UC Davis email account";
  }
}

// ********google login code ends*********

