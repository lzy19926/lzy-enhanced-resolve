module.exports = class TestPlugin {
    constructor(hook, targetHook) {
        this.hook = hook;
        this.targetHook = targetHook;
    }

    apply(resolver) {
        const targetHook = resolver.ensureHook(this.targetHook);
        resolver
            .getHook(this.hook)
            .tapAsync("TestPlugin", (request, callback) => {
                // console.log(`触发hook:${this.hook},TestPlugin`);
                // console.log("处理request,流转到下个插件", request);
                // request.request += "-"
                callback()
                // resolver.doResolve(targetHook, request, null, callback);
            });
    }
};