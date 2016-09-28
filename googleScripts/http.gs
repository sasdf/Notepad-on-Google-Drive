function doGet(e) {
  var db = new DB('Database')
  var file = e.parameter.file;
  var res = db.val(file)
  if(res === undefined) res = ""
  return ContentService.createTextOutput(res);
}

function doPost(e) {
  var db = new DB('Database')
  var file = e.parameter.file;
  var value = e.parameter.value;
  var res = value === undefined ? false : db.val(file, value)
  return ContentService.createTextOutput(JSON.stringify(res));
}
