function initMenu(){
  const ui = SpreadsheetApp.getUi()
  ui.createMenu('FamU Tools')
    .addItem('Create Badges','createBadges')
    .addItem('Create Class Attendance Sheets','createSheets')
    .addToUi()
}


function onOpen(e){
  initMenu()
}


function createBadges() {
 //Ids for docs and sheets 
  var docTemplateId = "1VYuyFS_t5ha-7fDLhhWHOFxgeELr7QOF23sMLTnzy9E"; 
  var docFinalId = DocumentApp.create('Makeup Badges').getId();
  // var docFinalId = DocumentApp.create('23-24 FamU Makeup Badges').getId();
  var ssID = "1d3hTMWIA8SIMLbuk1VtGn75CYIVRCnfqz22x_wdZRg8"; 
  
  //Get the docs and sheet 
  var docTemplate = DocumentApp.openById(docTemplateId); 
  var docFinal = DocumentApp.openById(docFinalId);
  var sheet = SpreadsheetApp.openById(ssID).getSheetByName("Makeup Badges");

  var data =  sheet.getRange(2, 1, sheet.getLastRow()-1,10).getValues();

  var templateParagraphs = docTemplate.getBody().getParagraphs();

  docFinal.getBody().clear()

  var batchSize = 6;
    for (var i = 0; i < data.length; i += batchSize) {
      var rowsToProcess = data.slice(i, i + batchSize);
      createPageWithBadges(rowsToProcess, templateParagraphs, docFinal);
    }

  const body = docFinal.getBody();
  body.setMarginLeft(42)
  body.setMarginRight(30)
  body.setMarginTop(30)
  body.setMarginBottom(6)
  Logger.log("The scrip made it this far");
  // const badgeUrl =docFinal.getUrl()
  // DocumentApp.openByUrl(badgeUrl);

  // showAlert(badgeUrl);;
}


function showAlert(url){
    var htmlOutput = HtmlService
    .createHtmlOutput(`Go to <a href="${url}" target="_blank"> this link</a> to get badges!`)
    .setWidth(250) //optional
    .setHeight(50); //optional
SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Help Dialog Title');
}


function createPageWithBadges(rows, templateParagraphs, docFinal) {
  if (docFinal.getBody().getText() !== "") {
    docFinal.getBody().appendPageBreak();
  }

  Logger.log('The createPageWithBadges function has run')
  // Create a table with two rows and two columns
  var table = docFinal.getBody().appendTable([
    ["", ""], // First row with two cells
    ["", ""],  // Second row with two cells
    ["", ""]
  ]);

  table.setColumnWidth(0, 260); // Adjust the column width as needed
  table.setColumnWidth(1, 240); // Adjust the column width as needed
  table.setBorderWidth(0)

  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    var cell = table.getCell(Math.floor(i / 2), i % 2);
    var copiedParagraphs = templateParagraphs.map(function (p) {
      return p.copy()
        .replaceText("{lastName}", row[0])
        .replaceText("{firstName}", row[1])
        .replaceText("{famNumber}", row[2])
        .replaceText("{gradeLevel}", row[3]==='Parent'?`Parent` :`Grade ${row[3]}`)
        .replaceText("{first}", row[6])
         .replaceText("{class1}",row[8])
         .replaceText("{class2}",row[9])
        .replaceText("{second}", row[7]);
    });

    copiedParagraphs.forEach(function (copiedParagraph) {
      cell.appendParagraph(copiedParagraph);
    });
  }


}

function archiveAttendance(){
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert('Archive Attendance','Are you sure you want to archive attendance?',ui.ButtonSet.YES_NO_CANCEL);

  if(response === ui.Button.YES){
       const srcSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sign In Sheet');
        const srcRange = srcSheet.getRange(2,8,srcSheet.getLastRow()-1,1);
        const attendanceValues = srcRange.getValues();
        srcSheet.getRange(2,6,srcSheet.getLastRow()-1,2).clear();

        const destSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Historic Attendance');
        const destRange = destSheet.getRange(2,5,destSheet.getLastRow()-1,1);
        const date = new Date().toLocaleDateString();
        destSheet.insertColumnAfter(4)
        destRange.setValues(attendanceValues)
        destSheet.getRange(1,5).setValue(`Attendance ${date}`);

        ui.alert(`Attedance for ${date} has been archived`);
  } else{
        ui.alert(`Attedance was NOT archived`);
  }
 
}



function createRandomValues(){
   const srcSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sign In Sheet');
   const srcRange = srcSheet.getRange(2,6,srcSheet.getLastRow()-1,2);
   srcRange.setFormula("=RANDBETWEEN(0,5)");
}



function createPrimarySignIn(){
   //Ids for docs and sheets 
    var docTemplateId = "1VYuyFS_t5ha-7fDLhhWHOFxgeELr7QOF23sMLTnzy9E"; 
    var docFinalId = DocumentApp.create('23-24 FamU Badges').getId();
    var ssID = "1d3hTMWIA8SIMLbuk1VtGn75CYIVRCnfqz22x_wdZRg8"; 
    
    //Get the docs and sheet 
    var docTemplate = DocumentApp.openById(docTemplateId); 
    var docFinal = DocumentApp.openById(docFinalId);
    var sheet = SpreadsheetApp.openById(ssID).getSheetByName("Adults and Students");

    var data =  sheet.getRange(2, 1, sheet.getLastRow()-1,6).getValues().slice(0,4);

    var templateParagraphs = docTemplate.getBody().getParagraphs();

    docFinal.getBody().clear()
}



function createSheets() {
    const ss = getSs();
    //const famuSS = app.getActiveSpreadsheet();
    const classSheet = ss.getSheetByName('Classes');
    const adultValues = classSheet.getRange(2,2,classSheet.getLastRow()-1,1).getValues()
    const studentValues = classSheet.getRange(2,4,classSheet.getLastRow()-1,1).getValues()
    const dates = serverSideGetClassDates().filter(date => !date.includes('Select')).map(date => [date]);
    const headers = [...["FamU Id"],...["Last Name"],...["First Name"],...["Family Number"],...["Active?"],...dates];

    const adultSession1 = Array.from(new Set(adultValues.map(row => `S1-${row[0]}`))).filter(row => row !== "S1-");
    const adultSsession2 = Array.from(new Set(adultValues.map(row => `S2-${row[0]}`))).filter(row => row !== "S2-");
    const studentSession1 = Array.from(new Set(studentValues.map(row => `S1-${row[0]}`))).filter(row => row !== "S1-");
    const studentSession2 = Array.from(new Set(studentValues.map(row => `S2-${row[0]}`))).filter(row => row !== "S2-");


    adultSession1.map(course => ss.insertSheet().setName(course))
    adultSsession2.map(course => ss.insertSheet().setName(course))
    studentSession1.map(course => ss.insertSheet().setName(course))
    studentSession2.map(course => ss.insertSheet().setName(course))

   const sessionSheets = ss.getSheets().filter(sheet => sheet.getName().startsWith("S2-")||sheet.getName().startsWith("S1-"));

   for (let sheet of sessionSheets){
      sheet.getRange(1,1).setValue(sheet.getSheetName()).setFontSize(15).setFontWeight('bold')
      sheet.getRange(2,1,1,headers.length).setValues([headers]).setFontWeight('bold').setFontSize(12).setBorder(null,null,true,null,null,null).setWrap(true).setBackground("gold")
      sheet.setFrozenColumns(5)
      sheet.setFrozenRows(2)
   }
  //  sessionSheets.forEach(sheet => sheet.getRange(1,1,1,headers.length).setValues([headers]).setFontWeight('bold').setFontSize(18).setBorder(null,null,true))
  //  sessionSheets.forEach(sheet => sheet.setFrozenRows(1))
    // const allClasses = session1.concat(session2)

    // session1.forEach(sheet => setFormula(sheet,"session1",signInSs))
    // session2.forEach(sheet => setFormula(sheet,"session2",signInSs))

    // allClasses.forEach(sheet => setColors(sheet)) 

}

function removeSheets(){
  const ss = getSs();
  
  const sheetsArr = ss.getSheets().filter(sheet => sheet.getName().startsWith("S2-")||sheet.getName().startsWith("S1-"));

  sheetsArr.forEach(sheet => ss.deleteSheet(sheet))
}














