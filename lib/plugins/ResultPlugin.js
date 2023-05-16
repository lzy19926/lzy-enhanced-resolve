module.exports = class ResultPlugin {
    constructor(hook) {
        this.hook = hook;
        this.resolver = undefined
    }

    //todo 删除多余参数,处理结果
    hanleResult(request, callback) {
        this.resolver.hooks.result.callAsync()
    }

    apply(resolver) {
        this.resolver = resolver

        resolver
            .getHook(this.hook)
            .tapAsync("ResultPlugin", this.hanleResult.bind(this));
    }
};