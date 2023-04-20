module.exports = class ResultPlugin {
    constructor(hook) {
        this.hook = hook;
    }

    apply(resolver) {
        resolver
            .getHook(this.hook)
            .tapAsync("ResultPlugin", (request, callback) => {
                console.log(`触发hook:${this.hook},ResultPlugin`);
                resolver.hooks.result.callAsync()
            });
    }
};