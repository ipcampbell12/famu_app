function doGet(e) {

  //when you have multiple files you are including, you neeed createTemplateFromFile and evaluate to run the include scripts
  const output = HtmlService.createTemplateFromFile("index").evaluate();
  output
    .setTitle('FamU Web App')
  // .setFaviconUrl("https://resources.finalsite.net/images/f_auto,q_auto/v1665159970/woodburnsdorg/nkl3byyl3stazmgik9pk/WSDLogo.jpg")

  return output;
}


//next time need to make sure that every last name starts with a capital 
//phone numbers and time stamps (any number really) will throw off text finder and potentially return the wrong row
function getSs() {
  const app = SpreadsheetApp;
  // const ss = app.openByUrl('https://docs.google.com/spreadsheets/d/1tFyd--6hlnCPqmuM6Tdi2LAljiURnocXSJ3ECPu-lqg/edit#gid=1829392235');
  const ss = app.openByUrl('https://docs.google.com/spreadsheets/d/12avH5SfqHnYYBIj6DCxfgl5KIRH-25-K6k-mlfcRYfw/edit#gid=1829392235');
  return ss;
}

function getSheet(name = "Sign In Sheet") {
  const ss = getSs();
  const sheet = ss.getSheetByName(name);
  return sheet;
}

function serverGetData() {
  // const data = "Here is some data"
  const sheet = getSheet("Sign In Sheet");
  const range = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn())
  const data = range.getValues()
  //console.log(data)
  return data;
}


function serverSideGetFamily(name, date) {
  const data = serverGetData();
  const searchKey = `Number of Adults - ${date}`
  const dateIndex = data[0].indexOf(searchKey)
  Logger.log(dateIndex)
  const familyData = data.filter(row => row[1].includes(name));
  // Logger.log(family)
  const familyReturnArr = familyData.map(family => [family[0], family[1], family[2], family[3], family[dateIndex], family[dateIndex + 1], family[dateIndex + 2]]);
  Logger.log(familyReturnArr)
  if (familyData) {

    return familyReturnArr;
  }

  return "No Family found"


}

function serverSideGetFamilyByNumber(number, date) {
  const data = serverGetData();
  const searchKey = `Number of Adults - ${date}`
  const dateIndex = data[0].indexOf(searchKey)
  Logger.log(dateIndex)
  const familyData = data.filter(row => row[0] === Number(number));
  // Logger.log(family)
  const familyReturnArr = familyData.map(family => [family[0], family[1], family[2], family[3], family[dateIndex], family[dateIndex + 1], family[dateIndex + 2]]);
  Logger.log(familyReturnArr)
  if (familyData) {

    return familyReturnArr;
  }

  return "No Family found"
}

function logFamily() {
  const val = serverSideGetFamilyByNumber(4489, '01/09/2024')
  Logger.log(val)
}

function markAttendance(familyNum, adults, students, date) {
  Logger.log(familyNum)
  Logger.log(date)
  Logger.log(adults)
  Logger.log(students)
  const sheet = getSheet("Sign In Sheet");
  // const data = serverGetData();
  const tf = sheet.createTextFinder(familyNum)
  const row = tf.findNext().getRow();
  //const dateTf = sheet.createTextFinder(`Number of Adults  - ${date}`);
  const dateTf = sheet.createTextFinder(date)
  Logger.log(dateTf)
  const column = dateTf.findNext().getColumn();
  const timestamp = Utilities.formatDate(new Date(), "PST", "MM/dd/yyyy HH:mm");
  Logger.log(`row is ${row}`);
  Logger.log(`column is ${column}`);
  const range = sheet.getRange(row, column, 1, 3)
  let times = sheet.getRange(row, column + 2, 1, 1).getValue();
  sheet.getRange(row, column + 3, 1, 1).setFormula(`=SUM(${[String.fromCharCode(column + 64), row].join('')}:${[String.fromCharCode((column + 1) + 64), row].join('')})`)
  Logger.log(times)
  range.setValues([[adults, students, times += 1]])

}

function findFamily(sheet, date, familyNum) {
  if (sheet === "Web App Responses") {
    Logger.log("No column needed");
    return;
  }
  console.log(familyNum)
  const tf = sheet.createTextFinder(familyNum)
  const row = tf.findNext().getRow();
  Logger.log(`The row for ${familyNum} is ${row}`)
  const dateTf = sheet.createTextFinder(date)
  const column = dateTf.findNext().getColumn();
  Logger.log(`The column for ${familyNum} is ${column}`)
  return [row, column]
}

function serverSideGetSheets(session) {
  const ss = getSs();
  let sheets;
  Logger.log(session)
  if (session === "Session1") sheets = ss.getSheets().filter(sheet => sheet.getName().startsWith("S1-")).map(sheet => sheet.getName());
  if (session === "Session2") sheets = ss.getSheets().filter(sheet => sheet.getName().startsWith("S2-")).map(sheet => sheet.getName());
  return sheets;
  // const sheetList = [...["Select a class"], ...sheets]
  // return sheetList;
}

function getStudents(course, session, date) {
  const ss = getSs();
  Logger.log(course)
  const sheetName = serverSideGetSheets(session).find(sheet => sheet.includes(course))
  Logger.log(sheetName)
  Logger.log(date)
  const ws = ss.getSheetByName(sheetName);
  const dates = ws.getRange(2, 1, 1, ws.getLastColumn()).getValues()[0].map(dateVal => Utilities.formatDate(new Date(dateVal), "GMT", "MM/dd/yyyy"));
  const dateCol = dates.indexOf(date) + 1;
  Logger.log(dateCol)
  const priorAttendanceVals = ws.getRange(3, dateCol, ws.getLastRow() - 1, 1).getValues()
  Logger.log(priorAttendanceVals)
  const range = ws.getRange(3, 1, ws.getLastRow() - 1, 5);
  const values = range.getValues().filter(val => val[0] !== '');
  Logger.log(values)
  const valuesWithPrior = values.map((row, idx) => row.concat(priorAttendanceVals[idx]))
  Logger.log(valuesWithPrior)
  return valuesWithPrior;
}

function markClassAttendance(course, attendance, date, type, session) {
  Logger.log(attendance)
  const ss = getSs();
  const sheetName = serverSideGetSheets(session).find(sheet => sheet.includes(course))
  if (date.length === 0) return;
  const sheet = ss.getSheetByName(sheetName);
  Logger.log(`the sheet is ${sheetName}`)
  Logger.log(`The date is ${date}`)
  const tf = sheet.createTextFinder(date)
  const column = tf.findNext().getColumn();
  Logger.log(column)
  const range = sheet.getRange(3, column, attendance.length, 1)
  const check = range.getValues();
  const timesRange = sheet.getRange(1, column, 1, 1);
  let times = timesRange.getValue()
  Logger.log(check.length)
  const marks = attendance.map(val => [val[1]])
  range.setValues(marks)
  timesRange.setValue(times += 1)
  return [course, date, times];

}

function serverSideGetClassDates() {
  const ss = getSs();
  const sheet = ss.getSheetByName('Dates');

  const dates = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues()
  Logger.log(dates)
  const formattedDates = dates.map(date => Utilities.formatDate(date[0], "GMT", "MM/dd/yyyy"))
  const updatedDates = [...["Select a date"], ...formattedDates]
  Logger.log(formattedDates)
  return updatedDates;

}


function getServerSideGetClassLists(type, id, number = 1) {
  const ss = getSs();
  const sheet = ss.getSheetByName('Classes');

  let list;

  if (type === "adults") {
    const adultList = sheet.getRange(2, 2, sheet.getLastRow() - 1, 1).getValues();
    list = adultList;
  }

  if (type === "students") {
    const session1List = sheet.getRange(2, 6, sheet.getLastRow() - 1, 1).getValues();
    const session2List = sheet.getRange(2, 7, sheet.getLastRow() - 1, 1).getValues();
    list = [session1List, session2List];

  }

  Logger.log(list)
  const toReturn = {
    "adults": [...["Select a class"], ...list],
    "session1": [...["Select a class"], ...list[0]],
    "session2": [...["Select a class"], ...list[1]],
    "id": id,
    "number": number
  };

  return toReturn;
}


function serverSideRegisterFamily(data) {
  const ss = getSs();
  //Add family to response sheet
  const sheet = getSheet('Web App Responses');
  const timestamp = new Date();
  const range = sheet.getRange(sheet.getLastRow() + 1, 1, data.length, data[0].length + 4)
  let id = sheet.getRange(1, 1, sheet.getLastRow()).getValues().length;
  const user = Session.getActiveUser().getEmail();
  console.log(id)
  const stampedData = data.map((row, index) => [...[timestamp], ...[id + index], ...row, ...[user], ...[true]])
  range.setValues(stampedData)

  //Add family to sign in sheet
  const adults = data.filter(row => row[6] === "parent").map(row => row[1])
  const lastNames = data.filter(row => row[6] === "parent").map(row => row[2]).join(' ');
  const children = data.filter(row => row[6] !== "parent").map(row => row[1])
  const signInSheet = getSheet("Sign In Sheet");
  const signInRange = signInSheet.getRange(signInSheet.getLastRow() + 1, 1, 1, 4)
  const familyArr = [...[data[0][0]], ...[lastNames], ...[adults.join()], ...[children.join()]]
  //console.log(familyArr)
  signInRange.setValues([familyArr])
  const sheets = ss.getSheets().filter(sheet => sheet.getName().startsWith("S2-") || sheet.getName().startsWith("S1-"));



  // Add family members to classes
  stampedData.forEach(person => addStudentToClass(person, sheets))

}

function addStudentToClass(person, sheets) {
  console.log(person[5])
  console.log(person[6])
  const firstClassname = `S1-${person[5]}`;
  console.log(firstClassname)
  const secondClassName = `S2-${person[6]}`;
  console.log(secondClassName)

  const class1 = sheets.find(sheet => sheet.getName() === firstClassname);
  const class2 = sheets.find(sheet => sheet.getName() === secondClassName);
  const familyId = person[2]
  const famUId = person[1]
  const firstName = person[3]
  const lastName = person[4]
  const regArr = [famUId, lastName, firstName, familyId, true]
  console.log(regArr)

  class1.getRange(class1.getLastRow() + 1, 1, 1, 5).setValues([regArr])
  class2.getRange(class2.getLastRow() + 1, 1, 1, 5).setValues([regArr])
}


function serverSideMarkInactive(num, date) {
  const ss = getSs();
  const signIn = getSheet("Sign In Sheet");
  const responses = getSheet("Web App Responses");
  const signInRow = findFamily(signIn, date, num)[0];
  const responsesRow = findFamily(responses, date, num)[0];
  // Logger.log(signInRow)
  // Logger.log(responsesRow)

}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent()

};








