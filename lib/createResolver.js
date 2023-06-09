const Resolver = require('./Resolver')

const TestPlugin = require('./plugins/TestPlugin')
const NextPlugin = require('./plugins/NextPlugin')
const ResultPlugin = require('./plugins/ResultPlugin')
const AddSuffixPlugin = require('./plugins/AddSuffixPlugin')
const NpmPackageEntryPlugin = require('./plugins/NpmPackageEntryPlugin')

// 配置默认options
function createOptions(options) {
    return {
        descriptionFiles: options?.descriptionFiles || ["package.json"],
        extensions: options?.extensions || [".js", ".json", ".node"],
        indexFiles: options?.indexFiles || ["index"],
        mainFields: options?.mainFields || ["main"],
        rootPath: options?.rootPath || [""],
        fileSystem: options?.fileSystem || undefined
    }
}

function createResolver(options) {
    const normalizedOptions = createOptions(options)

    const {
        descriptionFiles,
        extensions,
        indexFiles,
        mainFields,
        conditionNames,
        rootPath,
        fileSystem,
    } = normalizedOptions

    const resolver = new Resolver(normalizedOptions)
    const plugins = []

    //! ---------注册各生命周期钩子-------------------
    resolver.ensureHook("resolve");          //解析模块路径
    resolver.ensureHook("parsed-resolve");   //解析 解析后的模块路径
    resolver.ensureHook("internal");         // 内部模块
    resolver.ensureHook("resolveInPackage"); //包内解析
    resolver.ensureHook("existingDirectory");// 已存在目录
    resolver.ensureHook("rawFile");          // 原始文件
    resolver.ensureHook("finalFile");// 最终文件
    resolver.ensureHook("resolved");// 解析后


    //! -------------各阶段hook订阅plugin---------------------
    //resolve
    plugins.push(
        new AddSuffixPlugin(`resolve`, "parsed-resolve")
    );
    plugins.push(
        new NextPlugin(`resolve`, "parsed-resolve")
    );

    //parsed-resolve
    plugins.push(
        new TestPlugin(`parsed-resolve`, "internal")
    );
    plugins.push(
        new NextPlugin(`parsed-resolve`, "internal")
    );

    //internal
    plugins.push(
        new TestPlugin(`internal`, "resolveInPackage")
    );
    plugins.push(
        new NextPlugin(`internal`, "resolveInPackage")
    );

    //resolveInPackage
    plugins.push(
        new NpmPackageEntryPlugin(`resolveInPackage`, "existingDirectory")
    );
    plugins.push(
        new NextPlugin(`resolveInPackage`, "existingDirectory")
    );

    //existingDirectory
    plugins.push(
        new TestPlugin(`existingDirectory`, "rawFile")
    );
    plugins.push(
        new NextPlugin(`existingDirectory`, "rawFile")
    );

    //rawFile
    plugins.push(
        new TestPlugin(`rawFile`, "finalFile")
    );
    plugins.push(
        new NextPlugin(`rawFile`, "finalFile")
    );

    //finalFile
    plugins.push(
        new TestPlugin(`finalFile`, "resolved")
    );
    plugins.push(
        new NextPlugin(`finalFile`, "resolved")
    );

    //finalFile
    plugins.push(
        new ResultPlugin("resolved")
    );


    //todo ------统一执行生命周期钩子--------------
    for (const plugin of plugins) {
        plugin.apply(resolver);
    }

    return resolver
}

module.exports = { createResolver }