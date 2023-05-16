const fs = require('fs')
const path = require('path')

module.exports = class AddSuffixPlugin {
    constructor(hook, targetHook) {
        this.hook = hook;
        this.targetHook = targetHook;
    }


    addSuffix(request, callback) {
        const relativePath = request.path
        const dirname = request.request

        if (relativePath[0] === '.') {
            let absolutePath = path.join(dirname, relativePath)

            let isFile = fs.existsSync(absolutePath) && fs.statSync(absolutePath).isFile()
            let isFileWithoutSuffix = !isFile && fs.existsSync(absolutePath + '.js') && fs.statSync(absolutePath + '.js').isFile()
            let isDir = !isFile && !isFileWithoutSuffix && fs.existsSync(absolutePath) && fs.statSync(absolutePath).isDirectory()

            if (isFile) {
                absolutePath = absolutePath
            }
            else if (isFileWithoutSuffix) {
                absolutePath = absolutePath + '.js'
            }
            else if (isDir) {
                absolutePath = path.join(absolutePath, 'index.js')
            }

            // 修改传入下个包的结果
            request.path = absolutePath
            request.processArgs = { isNpmpackage: false }
        } else {
            // 修改传入下个包的结果
            request.processArgs = { isNpmpackage: true }
        }

        // 继续执行
        callback()
    }

    apply(resolver) {
        const targetHook = resolver.ensureHook(this.targetHook);
        resolver
            .getHook(this.hook)
            .tapAsync("AddSuffixPlugin", this.addSuffix.bind(this));
    }
};
