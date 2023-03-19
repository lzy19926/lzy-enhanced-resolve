## 仿写webpack中的enhanced-resolve库
enhanced-resolve专门用于解析路径，例如我们写了require('./index')，Webpack在打包时就会用它来解析出./index的完整路径。

## 功能
1. node的reqire.resolve也做解析路径,但只能用在node环境下
### 扩展名查询配置:  
例如解析./index时由于没有提供扩展名，node会去尝试路径下是否有.js .json .node文件，
而Webpack需要面对的文件扩展不止这三种，可通过配置扩展。
### 文件夹查询  
require.resolve只会去解析文件的完整路径，但是enhanced-resolve既可以查询文件也可以查询文件夹

### 丰富的返回结果
在解析成功时，require.resolve的返回值只有一个完整路径，enhanced-resolve的返回值还包含了描述文件等较为丰富的数据。

## 其他
1. 提供高度可配置的异步require.resolve函数(执行解析函数)
2. 在函数执行各节点插入webpack的plugins
3. enhanced-resolve(增强resolve)
4. 该库只做路径解析!!!  只插入部分plugins,这部分plugins只做路径解析

## 使用方法  用于路径解析

```js

// 使用自带的默认resolver
const resolve = require("enhanced-resolve");

resolve("/myWebpack/src/", "lzy-react", (err, result) => {
	result; // === "/myWebpack/node_modules/lzy-react/out/index.js"
});

// 配置自定义resolver
const myResolve = resolve.create({
	extensions: [".ts", ".js"]
});

myResolve("/some/path/to/folder", "ts-module", (err, result) => {
	result; // === "/some/node_modules/ts-module/index.ts"
});
```