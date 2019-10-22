const fs = require('fs')
const path = require('path')

class GenHtml{
  constructor(opt = {}) {
    this.options = opt
    this.init()
  }
  init() {
    // todo 监听事件
  }
  run(ctx) {
    const {output: {path: outputPath, filename: outputFilename}} = ctx
    const {template, filename, inject} = this.options
    let content = fs.readFileSync(template, 'utf8')
    if (inject) {
      content = content.replace(/<\/body/g, ':::</body').split(':::')
      content = `${content[0]}<script src="${path.join(outputPath, outputFilename)}"></script>${content[1]}`
    }
    fs.writeFileSync(path.join(outputPath, filename), content)
  }
}

module.exports = GenHtml