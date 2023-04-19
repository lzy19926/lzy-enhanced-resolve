const { resolve, createResolver } = require('../lib/index')


// ------------默认resolve方法测试-----------
//TODO 此时传入的回调会在resultPlugin中执行
function resolve_Test() {
    resolve("/some/path/to/folder", "module/dir", (err, result) => {
        console.log('plugins流转完毕', err, result);
    });
}

// ------------通过配置创建resolver,执行相关方法测试-----------
function createResolver_Test() {
    const defaultOptions = {
        descriptionFiles: ["package.json"],
        extensions: [".js", ".json", ".node"],
        indexFiles: ["index"],
        mainFields: ["main"],
        fileSystem: undefined
    }


    const resolver = createResolver(defaultOptions)

    resolver.resolve("/some/path/to/folder", "module/dir", (err, result) => {
        console.log('plugins流转完毕', err, result);
    });
}


// ---------执行测试------------
// resolve_Test()
createResolver_Test()