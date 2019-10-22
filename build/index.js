#! usr/bin/env node

const traverse = require('@babel/traverse').default
const t = require('@babel/types')
const babel = require('@babel/core')
const fs = require('fs')
const path = require('path')

const exec = require('child_process').execSync

const config = require('./build.config.js')

const loaders = require('./loaders/index.js')

// 解析文件，并收集相应依赖(搜集依赖的过程就是遍历 ast 的过程)
// 入口为第0个模块
let depNum = 0
function parseAndDep(filename) {
  const dependencies = {}
  let content = fs.readFileSync(filename, 'utf8')

  content = runLoaders(filename, content, config)


  const ast = babel.parseSync(content, {
    sourceType: 'module'
  })

  traverse(ast, {
    enter({node}) {
      if (t.isImportDeclaration(node)) {
        depNum ++
        const f = node.source.value
        node.source.value = depNum + ''
        dependencies[depNum] = path.join(path.dirname(filename), f)
      }
    }
  })

  const {code} = babel.transformFromAst(ast, '', {
    presets: ['@babel/preset-env'],
  })

  return {
    code, dependencies
  }
}


// 生成依赖图谱（从入口开始，编译文件，并分析当前文件需要依赖的模块）
function generatorGraph(entry) {
  // 解析入口文件
  const entryModule = parseAndDep(entry)
  const graphArray = [entryModule]

  for(let i = 0; i < graphArray.length; i++) {
    const item = graphArray[i]
    const {dependencies} = item

    Object.keys(dependencies).forEach(dep => {
      graphArray.push(parseAndDep(dependencies[dep]))
    })
  }
  return graphArray.map(i => i.code)
}

// 生成字符串代码文件（将所有模块文件拼接成一个bundle）
function generatorCode(entry) {
  runPlugins(config)

  const modules = JSON.stringify(generatorGraph(entry))
  const output = `
    (function(modules) {
      function require(moduleId) {

        function localRequire(moduleId) {
          return require(moduleId)
        }

        var exports = {};
        // 每个模块有自己的作用域
        (function(require, exports, code) {
          eval(code)
        })(require, exports, modules[moduleId])

        return exports
      }
      require(0)
    })(${modules})
  `
  return output
}

// 插件
function runPlugins(ctx) {
  const {plugins} = ctx
  plugins.forEach(pl => pl.run(ctx))
}

// loaders
function runLoaders(filename, source, ctx) {
  const {rules} = ctx.module
  const rule = rules.find(r => r.test.test(filename))
  rule && rule.use.forEach(i => (source = loaders[i](source)))

  return source
}

// 编译构建，并输出至指定文件
function build(entry, outputPath, filename) {
  exec(`rm -rf ${outputPath}`)
  exec(`mkdir ${outputPath}`)

  const code = generatorCode(entry)
  const bundle = path.join(outputPath, filename)
  fs.writeFile(bundle, code, err => {
    if (err) throw err
    console.log('success')
  })
}

const {entry, output: {filename, path: outputPath}} = config
build(entry, outputPath, filename)




