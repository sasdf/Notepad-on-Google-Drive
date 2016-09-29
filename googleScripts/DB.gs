function DB(name){
  var _this = this;
  var DBs = DriveApp.getFilesByName(name);
  if ( DBs.hasNext() ) _this.ss = SpreadsheetApp.open(DBs.next());
  else _this.ss = SpreadsheetApp.create(name);
  _this.sheet = _this.ss.getSheets()[0];
}

DB.prototype.hash = function(name){
  var hash = Utilities.newBlob(name)
    .getBytes()
    .map(function(e){return e<0?e+256:e})
    .reduce(function(l,e){ return (l*256+e)%2000000 }, 0)
  return [Math.floor(hash / 26) + 1, hash % 26 + 1]
}

DB.prototype.getRecord = function(name){
  return this.sheet.getRange.apply(this.sheet, this.hash(name));
}

DB.prototype.val = function(name, val){
  var current, record = this.getRecord(name);
  try{ current = JSON.parse(record.getValue()); }
  catch(e){ current = {} }
  
  if(val === undefined) return current[name]
  else {
    current[name] = val
    var str = JSON.stringify(current)
    if(str.length >= 50000) return false
    record.setValue(str)
    return true
  }
}
