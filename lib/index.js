const { logger } = require("../../utils/logger")
const ResolverFactory = require("./ResolverFactory");

const nodeFileSystem = {}

// 默认的asyncResolver
const asyncResolver = ResolverFactory.createResolver({
    conditionNames: ["node"],      // 环境
    extensions: [".js", ".json", ".node"], // 拓展名
    fileSystem: nodeFileSystem     //todo 文件系统
});


// 入口方法
function resolve(path, request, callback) {

    if (typeof path !== "string"
        || typeof request !== "string"
        || typeof callback !== 'function') {
        return logger.warn("参数类型错误 : function resolve(path:string, request:string, callback:function){}")
    }

    asyncResolver.resolve(path, request, callback)
}



// 返回freeze后的object
const mergeExports = (obj, exports) => {
    const descriptors = Object.getOwnPropertyDescriptors(exports);
    Object.defineProperties(obj, descriptors);
    return Object.freeze(obj)
};

module.exports = mergeExports(resolve, {
    ResolverFactory
})