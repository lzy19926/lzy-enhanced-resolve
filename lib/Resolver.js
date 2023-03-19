const { SyncHook, AsyncSeriesHook } = require('../../lzy_tapable/lib/index')

// 将一个以 - 分隔的字符串转换为驼峰命名法。
function toCamelCase(str) {
    return str.replace(/-([a-z])/g, str => str.substr(1).toUpperCase());
}


class Resolver {
    constructor(options) {
        this.fileSystem = options.fileSystem;
        this.options = options;
        // 初始时有四个hook
        this.hooks = {
            // hook用法; 传入参数名和hook名
            resolveStep: new SyncHook(["request"], "resolveStep"),// resolve的单步调用
            resolve: new AsyncSeriesHook(["request"], "resolve"),// 正常resolve流程,内部有多个resolveStep
            noResolve: new SyncHook(["request"], "noResolve"),  //  resolve错误时调用
            result: new AsyncSeriesHook(["result"], "result")//? 未知 
        }
    }

    // 注册hook 转驼峰 并根据name调整hook调用顺序 
    ensureHook(name) {
        if (typeof name !== "string") return name;

        name = toCamelCase(name)

        // before开头的hook调整到其他hook之前执行(stage: -10 )
        if (/^before/.test(name)) {
            const hookName = name[6].toLowerCase() + name.substr(7)
            return this.ensureHook(hookName).withOptions({ stage: -10 })
        }
        // after开头的hook调整到其他hook之后执行(stage: 10 )
        if (/^after/.test(name)) {
            const hookName = name[5].toLowerCase() + name.substr(6)
            return this.ensureHook(hookName).withOptions({ stage: 10 })
        }

        // 如果没有hook则创建一个
        const hook = this.hooks[name];
        if (!hook) {
            return this.hooks[name] = new AsyncSeriesHook(["request"], name)
        }
        return hook
    }

    //! 实际入口方法 resolver.resolve
    resolve(path, request, callback) {
        if (typeof path !== "string")
            return callback(new Error("path argument is not a string"));
        if (typeof request !== "string")
            return callback(new Error("request argument is not a string"));

        const requestObj = {
            path,
            request
        }

        const message = `resolve '${request}' in '${path}'`;

        return this.doResolve(
            this.hooks.resolve, // 首先从resolveHook开始执行
            requestObj,
            message,
            callback
        )
    }


    //! 这里的callback是asyncSeriesHook的cb,用于触发下一个hook回调
    doResolve(hook, request, message, callback) {
        // step1  resolveStep(每一个hook执行前执行的hook)
        this.hooks.resolveStep.call(request);

        // step2 执行plugin传来的下一个hook , 如果hook没有被使用,直接执行cb,触发下一个hook回调
        if (hook.isUsed()) {
            return hook.callAsync(request, (err, result) => {
                if (err) return callback(err)
                if (result) return callback(null, result)
                callback()
            })
        } else {
            callback()
        }
    }


    // 获取身上对应的hook
    getHook(name) {
        if (typeof name !== "string") return name;

        name = toCamelCase(name);
        const hook = this.hooks[name];

        if (!hook) {
            throw new Error(`Hook ${name} doesn't exist`);
        }
        return hook;
    }
}

module.exports = Resolver