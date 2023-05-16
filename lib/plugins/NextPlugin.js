


module.exports = class NextPlugin {

    constructor(hook, targetHook) {
        this.hook = hook;
        this.targetHook = targetHook;
    }

    apply(resolver) {
        const targetHook = resolver.ensureHook(this.targetHook);
        resolver
            .getHook(this.hook)
            .tapAsync("NextPlugin", (request, callback) => {
                // console.log(`触发hook:${this.hook},NextPlugin,流转到${this.targetHook}`);
                resolver.doResolve(targetHook, request, null, callback);
            });
    }
};