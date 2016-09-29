function doGet(e) {
  if(e.parameter.form){
    return HtmlService.createHtmlOutput('<form method="POST" action="https://script.google.com/macros/s/AKfycbzusPtaiE-aQigLHVhqkCWV82VqPnUZPJ0-SxnmLZ_7c1XPpr4/dev"><input type="text" name="file"><textarea name="value"></textarea><input type="submit"></form>')
  }
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
