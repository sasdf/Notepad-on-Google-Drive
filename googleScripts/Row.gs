var RowLimit = 2000000
function Row(sheet, base) {
  var _this = this
  _this.sheet = sheet
  _this.base = base % RowLimit
  _this.data = []
  _this.now = -1
}

Row.prototype.fetch = function(len){
  if(this.data.length == RowLimit) return
  var cur = (this.base + this.data.length) % RowLimit
  var tar = cur + len
  if(tar > RowLimit){
    // loop
    this.fetch(RowLimit - cur)
    this.fetch(tar - RowLimit)
    return
  }
  Logger.log([cur, 1, len, 1])
  var vals = this.sheet.getRange(cur, 1, len, 1).getValues().map(function(e){return e[0]})
  this.data = this.data.concat(vals)
}

Row.prototype.next = function(){
  var _this = this
  _this.now = (_this.now + 1) % RowLimit
  if(_this.data.length === _this.now) _this.fetch(1)
  return _this.data[_this.now]
}

Row.prototype.get = function(){
  var _this = this
  if(_this.now == -1) throw new Error('No Rows')
  return _this.data[_this.now]
}

Row.prototype.set = function(val){
  if(this.now == -1) throw new Error('No Rows')
  this.data[this.now] = val
}

Row.prototype.seek = function(i){
  this.now = i % RowLimit
  if(this.data.length <= this.now) this.fetch(this.now - this.data.length + 1)
}

Row.prototype.save = function(){
  var tar = this.base + this.data.length
  if(tar > RowLimit){
    var len = RowLimit - this.base
    this.sheet.getRange(this.base, 1, len, 1).setValues(this.data.slice(0, len).map(function(e){return [e]}))
    var len2 = this.base + this.data.length - RowLimit
    this.sheet.getRange(0, 1, len2, 1).setValues(this.data.slice(len).map(function(e){return [e]}))
    return
  }else{
    this.sheet.getRange(this.base, 1, this.data.length, 1).setValues(this.data.map(function(e){return [e]}))
  }
}
