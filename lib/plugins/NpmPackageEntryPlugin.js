const fs = require('fs')
const path = require('path')


module.exports = class NpmPackageEntryPlugin {
    constructor(hook, targetHook) {
        this.hook = hook;
        this.resolver = undefined
        this.targetHook = targetHook;
    }

    // 如果是npmPackage,则读取入口
    getNpmPackageEntry(request, callback) {
        const depName = request.path
        const isNpmpackage = request.processArgs.isNpmpackage
        const rootPath = this.resolver.options.rootPath

        if (isNpmpackage) {
            const packageEntry = _getNpmPackageEntry(depName, rootPath)

            // 修改传入下个包的结果
            request.path = packageEntry
        }

        // 继续执行
        callback()
    }

    apply(resolver) {
        this.resolver = resolver
        const targetHook = resolver.ensureHook(this.targetHook);
        resolver
            .getHook(this.hook)
            .tapAsync("NpmPackageEntryPlugin", this.getNpmPackageEntry.bind(this));
    }
};





// ! ----------------抽离出来的path加载方法-----------------
// 模块的加载循序为：_browser+mjs > module > browser+cjs > main_>deno这个加载顺序是大部分构建工具默认的加载顺序
function findEntryFromExportsObj(exportObj) {

    let exportPath = ''

    if (typeof exportObj === 'string') {
        exportPath = exportObj
    }
    // 如果是数组,取最后一个默认值(需要修改)
    else if (Array.isArray(exportObj)) {
        exportPath = exportObj[exportObj.length - 1]
    }
    // 有broswer直接为字符串或分为require和default两种情况
    else if (typeof exportObj === 'object') {
        const broswer = typeof exportObj?.browser === 'string'
            ? exportObj?.browser
            : void 0
        const browserRequire = exportObj?.browser?.require
        const browserDefault = exportObj?.browser?.default

        const node = typeof exportObj?.default === 'string'
            ? exportObj?.default
            : void 0
        const nodeRequire = exportObj?.default?.require
        const nodeDefault = exportObj?.default?.default

        const deno = typeof exportObj?.deno === 'string'
            ? exportObj?.deno
            : void 0
        const denoRequire = exportObj?.deno?.require
        const denoDefault = exportObj?.deno?.default

        exportPath = broswer
            || browserRequire
            || browserDefault
            || node
            || nodeRequire
            || nodeDefault
            || deno
            || denoRequire
            || denoDefault
    }


    return exportPath
}

// 层层往上翻查找package.json文件,获取dep文件夹路径,
function checkPackageJson(depName, rootPath) {

    let restPath = depName // 当前目录
    let packageJSON;
    let depDirPath;

    // 检查当前目录是否有packageJson,给package.json赋值
    const checkLoop = (restPath) => {
        if (!packageJSON) {
            const pDir = path.join(rootPath, '/node_modules', restPath)
            const packageJsonPath = path.join(pDir, 'package.json')
            if (fs.existsSync(packageJsonPath)) {
                packageJSON = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
                depDirPath = pDir
                return true
            }
        }
        return false
    }

    while (restPath.indexOf('/') !== -1) {
        if (checkLoop(restPath)) break

        let lastP = restPath.lastIndexOf('/')
        restPath = restPath.slice(0, lastP)
    }

    // 从剩下的主目录找package.json
    checkLoop(restPath)

    return [packageJSON, restPath, depDirPath]
}

// 从mode_modules中找到对应的入口文件路径
//todo 包一般有两个入口  main和browser, main是通用入口(有可能有node模块),broswer是浏览器入口
// 模块的加载循序为：_browser+mjs > module > browser+cjs > main_这个加载顺序是大部分构建工具默认的加载顺序
function _getNpmPackageEntry(depName, rootPath) {

    // 层层往上翻查找获取package.json文件(倒序查找),并获取需要的path
    const [packageJSON, restPath, depDirPath] = checkPackageJson(depName, rootPath)

    //! dep可能是'react', 'react/client', 需要从package.json的export属性中找到对应的路径
    const subName = depName.replace(restPath, '')

    // 没有exports对象时 分为三种情况
    if (!packageJSON.exports) {
        const isFileWithoutSuffix = fs.existsSync(path.join(depDirPath, subName) + '.js') // 无.js尾缀文件
        const exportFromDirectory = !isFileWithoutSuffix && !packageJSON.main             // 从文件夹index.js获取
        const exportFromMainProp = packageJSON.main                                       // 从main获取

        if (isFileWithoutSuffix) return path.join(depDirPath, subName) + '.js'
        if (exportFromDirectory) return path.join(depDirPath, 'index.js')
        if (exportFromMainProp) return path.join(depDirPath, packageJSON.main)
    }
    // 有exports对象时主要从exports对象中查找入口 分为四种情况
    else {
        // 分为子模块和主模块
        let exportObj = subName
            ? packageJSON.exports['.' + subName]
            : packageJSON.exports['.']

        // 如果没有从obj中找到,使用main兜底
        let raletivePath = findEntryFromExportsObj(exportObj)

        return raletivePath
            ? path.join(depDirPath, raletivePath)
            : path.join(depDirPath, packageJSON.main)
    }
}