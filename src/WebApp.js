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
function getSs(){
    const app = SpreadsheetApp;
    const ss = app.openByUrl('https://docs.google.com/spreadsheets/d/1tFyd--6hlnCPqmuM6Tdi2LAljiURnocXSJ3ECPu-lqg/edit#gid=1829392235');
    return ss;
}

function getSheet(name="Sign In Sheet"){
  const ss = getSs();
  const sheet = ss.getSheetByName(name);
  return sheet;
}

function serverGetData(){
  // const data = "Here is some data"
  const sheet = getSheet("Sign In Sheet");
  const range = sheet.getRange(1,1,sheet.getLastRow(),sheet.getLastColumn())
  const data = range.getValues()
  //console.log(data)
  return data;
}


function getFamily(name,date){
    const data = serverGetData();
    const searchKey = `Number of Adults - ${date}`
    const dateIndex = data[0].indexOf(searchKey)
    Logger.log(dateIndex)
    const familyData = data.filter(row => row[1].includes(name));
   // Logger.log(family)
    const familyReturnArr = familyData.map(family => [family[0],family[1],family[2],family[3],family[dateIndex],family[dateIndex+1],family[dateIndex+2]]);
    Logger.log(familyReturnArr)
    if(familyData){
      
        return familyReturnArr;
    }

    return "No Family found"
  

}

function logFamily(){
  const val = getFamily('Sanchez')
  Logger.log(val)
}

function markAttendance(familyNum, adults,students,date){
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
  const timestamp = Utilities.formatDate(new Date(),"PST","MM/dd/yyyy HH:mm");
  Logger.log(`row is ${row}`);
  Logger.log(`column is ${column}`);
  const range = sheet.getRange(row,column,1,3)
  let times = sheet.getRange(row,column+2,1,1).getValue();
  sheet.getRange(row,column+3,1,1).setFormula(`=SUM(${[String.fromCharCode(column+64),row].join('')}:${[String.fromCharCode((column+1)+64),row].join('')})`)
  Logger.log(times)
  range.setValues([[adults,students,times+=1]])
 
}

function getSheets(type){
  Logger.log(type)
  const app = SpreadsheetApp;
  if(type==="adults"){
    const ss = app.openByUrl('https://docs.google.com/spreadsheets/d/1cv8kIR6YtmO8bXzerDEZMbxqiNiOrVHoCc3RLZt3sfM/edit#gid=1005068214');
    const sheets = ss.getSheets().filter(sheet => sheet.getName().startsWith('S')).map(sheet => sheet.getName());
    const updatedSheets = [...["Select a class"],...sheets]
    Logger.log(updatedSheets)
    return updatedSheets;
  } else if(type==="students"){
    const ss =app.openByUrl('https://docs.google.com/spreadsheets/d/1EHpeAvAKNWwrsBLfqGAS93eczmF5uYOJImvF4Td9Jes/edit#gid=1005068214')
    const sheets = ss.getSheets().slice(2).map(sheet => sheet.getName());
    const updatedSheets = [...["Select a class"],...sheets]
    Logger.log(updatedSheets)
    return updatedSheets;
  }
  
}

function logIt(){
  getSheets('students')
}

function getStudents(sheet,type){
  if(type==="adults"){
    const app = SpreadsheetApp;
    const ss = app.openByUrl('https://docs.google.com/spreadsheets/d/1cv8kIR6YtmO8bXzerDEZMbxqiNiOrVHoCc3RLZt3sfM/edit#gid=1005068214');
    const ws = ss.getSheetByName(sheet);
    const range = ws.getRange(3,1, ws.getLastRow()-1,3);
    const values = range.getValues().filter(val => val!=='');
    return values;
  } else if(type==="students"){
     const app = SpreadsheetApp;
    const ss = app.openByUrl('https://docs.google.com/spreadsheets/d/1EHpeAvAKNWwrsBLfqGAS93eczmF5uYOJImvF4Td9Jes/edit#gid=2110217227');
    const ws = ss.getSheetByName(sheet);
    const range = ws.getRange(3,1, ws.getLastRow()-1,3);
    const values = range.getValues().filter(val => val!=='');
    return values;
  }
 
}

function markClassAttendance(course,attendance,date,type){
  //Logger.log(type)
  const ss = getSs();
  
  if(date.length===0) return;
  const sheet = ss.getSheetByName(course)
  Logger.log(`the sheet is ${sheet.getName()}`)
  Logger.log(`The date is ${date}`)
  const tf = sheet.createTextFinder(date)
  const column = tf.findNext().getColumn();
  const range = sheet.getRange(3,column,attendance.length,1)
  const check = range.getValues();
  const filtered = check.filter(check => check[0].includes('X') || check.includes("x"))

  if(filtered.length !==0) {
    Logger.log("Attendance already taken!")
    return "Attendance already taken for that date!"
  }

  Logger.log(check.length)
  const marks = attendance.map(val =>[val[1]])
  range.setValues(marks)

   return [course,date];

 

  
}

function serverSideGetClassDates(){
  const ss = getSs();
  const sheet =ss.getSheetByName('Dates');
 
  const dates = sheet.getRange(2,1,sheet.getLastRow()-1,1).getValues()
  Logger.log(dates)
  const formattedDates = dates.map(date => Utilities.formatDate(date[0],"GMT","MM/dd/yyyy"))
  const updatedDates = [...["Select a date"],...formattedDates]
 Logger.log(formattedDates)
 return updatedDates;

}


function getServerSideGetClassLists(type,id,number){
  const ss = getSs();
  const sheet =ss.getSheetByName('Classes');

  let list;

  if(type==="adults"){
      const adultList = sheet.getRange(2,2,sheet.getLastRow()-1,1).getValues();
      list = adultList;
  }

  if(type==="students"){
     const session1List = sheet.getRange(2,6,sheet.getLastRow()-1,1).getValues();
     const session2List = sheet.getRange(2,7,sheet.getLastRow()-1,1).getValues();
      list = [session1List,session2List];

  }

  Logger.log(list)
  const toReturn = {
    "adults":[...["Select a class"],...list],
    "session1":[...["Select a class"],...list[0]],
    "session2":[...["Select a class"],...list[1]],
    "id":id,
    "number":number
    };

  return toReturn;
}


function serverSideRegisterFamily(data){
    const ss = getSs();
    //Add family to response sheet
    const sheet =getSheet('Web App Responses');
    const timestamp = new Date();
    const range = sheet.getRange(sheet.getLastRow()+1,1,data.length,data[0].length+4)
    let id = sheet.getRange(1,1,sheet.getLastRow()).getValues().length;
    const user = Session.getActiveUser().getEmail();
    console.log(id)
    const stampedData = data.map((row,index) => [...[timestamp],...[id+index],...row,...[user],...[true]])
    range.setValues(stampedData)

    //Add family to sign in sheet
    const adults = data.filter(row=>row[6]==="parent").map(row=>row[1])
    const lastNames = data.filter(row=>row[6]==="parent").map(row => row[2]).join(' ');
    const children = data.filter(row=>row[6]!=="parent").map(row=>row[1])
    const signInSheet = getSheet("Sign In Sheet");
    const signInRange = signInSheet.getRange(signInSheet.getLastRow()+1,1,1,4)
    const familyArr = [...[data[0][0]],...[lastNames],...[adults.join()],...[children.join()]]
    //console.log(familyArr)
    signInRange.setValues([familyArr])
    const sheets = ss.getSheets().filter(sheet => sheet.getName().startsWith("S2-")||sheet.getName().startsWith("S1-"));

    

    // Add family members to classes
    stampedData.forEach(person => addStudentToClass(person,sheets)) 
    
}

function addStudentToClass(person,sheets){
    console.log(person[5])
    console.log(person[6])
    const firstClassname = `S1-${person[5]}`;
    console.log(firstClassname)
    const secondClassName = `S2-${person[6]}`;
    console.log(secondClassName)

    const class1 = sheets.find(sheet => sheet.getName()===firstClassname);
    const class2 = sheets.find(sheet => sheet.getName()===secondClassName);
    const familyId = person[2]
    const famUId = person[1]
    const firstName = person[3]
    const lastName = person[4]
    const regArr = [famUId,lastName,firstName,familyId,true]
    console.log(regArr)    

    class1.getRange(class1.getLastRow()+1,1,1,5).setValues([regArr])
    class2.getRange(class2.getLastRow()+1,1,1,5).setValues([regArr])
}


function include(filename){
  return HtmlService.createHtmlOutputFromFile(filename).getContent()

};








