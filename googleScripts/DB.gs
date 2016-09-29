function DB(name){
  var _this = this;
  var DBs = DriveApp.getFilesByName(name);
  if ( DBs.hasNext() ) _this.ss = SpreadsheetApp.open(DBs.next());
  else { 
    _this.ss = SpreadsheetApp.create(name);
    var sheet = _this.ss.getSheets()[0]
    sheet.deleteColumns(2, sheet.getMaxColumns() - 1);
  }
  _this.sheet = _this.ss.getSheets()[0];
}

DB.prototype.hash = function(name){
  var hash = Utilities.newBlob(name)
    .getBytes()
    .map(function(e){return e<0?e+256:e})
    .reduce(function(l,e){ return (l*33+e)%2000000 }, 5381)
  return hash + 1
}

DB.prototype.getRow = function(name){
  return new Row(this.sheet, this.hash(name))
}

DB.prototype.get = function(name){
  var res = []
  var offset = 0, current
  var row = this.getRow(name);
  do{
    next = false
    var raw = row.next()
    var headerSize, header, data
    if(raw.length > 0){
      headerSize = parseInt(raw.slice(0,5), 10)
      header = JSON.parse(raw.slice(5, headerSize + 5))
      data = raw.slice(5 + headerSize)
      if(header.hasOwnProperty(name)){
        next = header[name].next
        if(header[name].hasOwnProperty('pos'))
          res.push(data.slice(header[name].pos, header[name].end))
      }
    }
    offset += 1;
  } while (next === true)
  return res.join('')
}

DB.prototype.set = function(name, val){
  var offset = 0, current, next
  var row = this.getRow(name);
  row.fetch(Math.ceil(val.length+1 / 45000))
  do{
    next = false
    var raw = row.next()
    var headerSize, header, data
    if(raw.length == 0){
      header = {}
      data = ""
    }else{
      headerSize = parseInt(raw.slice(0,5), 10)
      header = JSON.parse(raw.slice(5, headerSize+5))
      data = raw.slice(5 + headerSize)
      if(header.hasOwnProperty(name)){
        next = header[name].next
        if(header[name].hasOwnProperty('pos'))
          data = data.slice(0, header[name].pos) + data.slice(header[name].end)
        delete header[name]
      }
    }
    if(val.length > 0){
      header[name] = {}
      var len = 45000 - JSON.stringify(header).length - data.length;
      if(len > 0){
        header[name].pos = data.length
        data += val.slice(0, len)
        header[name].end = data.length
        val = val.slice(len)
      }
      if(val.length > 0){
        header[name].next = true
      }
    }
    var headerStr = JSON.stringify(header)
    row.set(("00000" + headerStr.length).slice(-5) + headerStr + data)
    offset  = offset + 1
  } while ((next === true) || (val.length > 0))
  row.save()
  return true
}
