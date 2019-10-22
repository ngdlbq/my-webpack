function cssLoader(source) {
  source = escape(source)
  return `
    (function (source){
      source = unescape(source)
      var style = document.createElement('style')
      style.innerText = source
      document.head.appendChild(style)
    })('${source}')
  `
}

module.exports = cssLoader