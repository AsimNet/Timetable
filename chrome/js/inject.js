// Start our script by adding the import button(s) to the page
showImportButton();

/**
 * Shows buttons to allow the user to import subjects into the timetabler
 */
function showImportButton() {

  console.log("ASiiim");

  // Add import button to each subject
  var importButton = crel("button",
    { "class": "btn importButton" },
    "+"
  );
  $("#myForm\\:offeredCoursesTable.rowFlow tbody tr.ROW1").prepend(importButton);
  $("#myForm\\:offeredCoursesTable.rowFlow tbody tr.ROW2").prepend(importButton);

}

/**
 * Handles the importing of class times. Grabs the data from the table and sends it to the timetabler page
 */
function exportUnitData(table) {
  // Get the unit ID and subject name from above the table
  var td = $(table).find('td');



  // Extract the unit ID (e.g. MAB126) and name (e.g. Mathematics)
  var unitID = td.eq(0).text().trim()
  console.log("unitID: " + unitID);

  var unitName = td.eq(1).text().trim()
  console.log("unitID: " + unitName);

  // Create a new array for the unit
  var unitData = {
    "unitID": unitID,
    "unitName": unitName,
    "classes": []
  };

  // Extract all of the row data from the table
  console.log("td.eq(6): ");
  console.log(td.eq(6).children().text());
  td.eq(6).each(function (i, v) {
    console.log(i);
    var details = $(v).children().eq(0).children();

    //console.log(" 2 @t 11:00 ص - 12:40 م @r 201 د (D) @n  3 @t 04:00 م - 04:50 م @r 204 أ (A)");
    //console.log(" 5 @t 01:00 م - 02:40 م @r ");.
    //console.log("01:00 م - 02:40 م @r ");
    //  1 @t 01:00 م - 02:40 م @r 204 أ (A) @n  4 @t 03:00 م - 03:50 م @r 204 أ (A)

    for (var i = 0; i < (details.eq(1).val().match(/@t/g) || []).length; i++) {
      var detailsCopy = details.eq(1).val();
      if (detailsCopy.indexOf('@n ') != -1) {
        //there is more than one timeslot
        var oneSlot = detailsCopy.substring(0, detailsCopy.indexOf('@n ') + 3)
        detailsCopy = detailsCopy.substring(0, detailsCopy.indexOf('@n ') + 3)

      } else {
        var oneSlot = detailsCopy.substring(0, detailsCopy.indexOf('@t ') + 3)
      }
      console.log(JSON.stringify(oneSlot));


      oneSlot = oneSlot.replace(/\s/g,'')
      console.log(JSON.stringify(oneSlot));

      oneSlot = oneSlot.replace("1@t", 'U')
      oneSlot = oneSlot.replace("2@t", 'M')
      oneSlot = oneSlot.replace("3@t", 'T')
      oneSlot = oneSlot.replace("4@t", 'W')
      oneSlot = oneSlot.replace("5@t", "R")
      oneSlot = oneSlot.replace("6@t", 'F')
      oneSlot = oneSlot.replace("7@t", 'S')
      oneSlot = oneSlot.replace("ص", 'am')
      oneSlot = oneSlot.replace("م", 'pm')

      console.log("new String: " + oneSlot)
      var day = oneSlot.slice(0, 1)
      oneSlot = oneSlot.substring(1);
      console.log("oneSlot: " + oneSlot);

      var rawTime = oneSlot
      console.log(oneSlot.replace("5 @t ", 'R'));


      var classData = {
        "className": td.eq(1).text().trim(),
        "classType": td.eq(3).text(),
        "day": day,
        "time": { // raw = "11:00AM-01:00PM" or "11:00am - 01:00pm"
          "raw": td.eq(3).text().toLowerCase().replace("m-", "m - "),
          "start": td.eq(3).text().split("-")[0].trim(),
          "end": td.eq(3).text().split("-")[1].trim(),
        },
        "location": td.eq(4).text().trim(),
        "staff": td.eq(5).text().replace(/(\r\n|\n|\r)/gm, "")
      };

      // Push the row data into our classInfo object
      unitData.classes.push(classData);

    }



  })


  sendUnit(unitData);
}

/**
 * Send the unit information via Chrome Messages to the timetabler
 */
function sendUnit(unitData) {
  chrome.runtime.sendMessage({
    type: "unit_import",
    class_info: JSON.stringify(unitData)
  });
}

/**
 * Add an event listener for the import button
 */
$("button.importButton").css("position", "absolute");
$("button.importButton").bind("click", function () {
  // Check the timetabler is running
  var sender = $(this);

  chrome.runtime.sendMessage({ type: "checkTab" }, function (response) {
    if (response == "Done!") {
      // Set the button to show the class has been imported
      sender.css("background-color", "#4CAF50");
      sender.text("Imported!");

      // Import the classes into the timetabler
      console.log(sender.parent());

      exportUnitData(sender.parent());
    }
  });
});

/*
 * Add an event listener for the import all button
 */
$("button.importAllButton").bind("click", function () {
  // Check the timetabler is running
  chrome.runtime.sendMessage({ type: "checkTab" }, function (response) {
    // Wait for the timetabler to say it has finished loading
    if (response == "Done!") {
      // Set the butten to show the class has been imported
      $(".btn").each(function () {
        $(this).css("background-color", "#4CAF50");
        $(this).text("Imported!");
      });

      // Import the classes into the timetabler
      $(".rowFlow").each(function () {
        exportUnitData(this);
      });
    }
  });
});
