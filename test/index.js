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

    let outRes = undefined
    resolver.resolve("/some/path/to/folder", "module/dir", (err, result) => {
        console.log('plugins流转完毕', err, result);
        outRes = result
    });
    //! 如果是async类型的resolver,则cb会在最后执行,可以变量提升 
    console.log(outRes, '---');
}


// ---------执行测试------------
// resolve_Test()
createResolver_Test()