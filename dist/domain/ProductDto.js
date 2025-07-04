"use strict";
/**
 * ProductDto - Data Transfer Object
 *
 * Following powerview-admin patterns for DTO structure.
 * Generated by DomainGenerator.
 */
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductDto = void 0;
const uuid_1 = require("uuid");
const react_1 = require("@archbase/react");
let ProductDto = (() => {
    var _a;
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _code_decorators;
    let _code_initializers = [];
    let _code_extraInitializers = [];
    let _version_decorators;
    let _version_initializers = [];
    let _version_extraInitializers = [];
    let _createEntityDate_decorators;
    let _createEntityDate_initializers = [];
    let _createEntityDate_extraInitializers = [];
    let _updateEntityDate_decorators;
    let _updateEntityDate_initializers = [];
    let _updateEntityDate_extraInitializers = [];
    let _createdByUser_decorators;
    let _createdByUser_initializers = [];
    let _createdByUser_extraInitializers = [];
    let _lastModifiedByUser_decorators;
    let _lastModifiedByUser_initializers = [];
    let _lastModifiedByUser_extraInitializers = [];
    let _id_decorators_1;
    let _id_initializers_1 = [];
    let _id_extraInitializers_1 = [];
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _price_decorators;
    let _price_initializers = [];
    let _price_extraInitializers = [];
    let _active_decorators;
    let _active_initializers = [];
    let _active_extraInitializers = [];
    return _a = class ProductDto {
            constructor(data) {
                this.id = __runInitializers(this, _id_initializers, void 0);
                this.code = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _code_initializers, void 0));
                this.version = (__runInitializers(this, _code_extraInitializers), __runInitializers(this, _version_initializers, void 0));
                this.createEntityDate = (__runInitializers(this, _version_extraInitializers), __runInitializers(this, _createEntityDate_initializers, void 0));
                this.updateEntityDate = (__runInitializers(this, _createEntityDate_extraInitializers), __runInitializers(this, _updateEntityDate_initializers, void 0));
                this.createdByUser = (__runInitializers(this, _updateEntityDate_extraInitializers), __runInitializers(this, _createdByUser_initializers, void 0));
                this.lastModifiedByUser = (__runInitializers(this, _createdByUser_extraInitializers), __runInitializers(this, _lastModifiedByUser_initializers, void 0));
                this.id = (__runInitializers(this, _lastModifiedByUser_extraInitializers), __runInitializers(this, _id_initializers_1, void 0));
                this.name = (__runInitializers(this, _id_extraInitializers_1), __runInitializers(this, _name_initializers, void 0));
                this.price = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _price_initializers, void 0));
                this.active = (__runInitializers(this, _price_extraInitializers), __runInitializers(this, _active_initializers, void 0));
                // New record flag
                this.isNovoProduct = __runInitializers(this, _active_extraInitializers);
                this.id = data.id;
                this.code = data.code;
                this.version = data.version;
                this.createEntityDate = data.createEntityDate;
                this.updateEntityDate = data.updateEntityDate;
                this.createdByUser = data.createdByUser;
                this.lastModifiedByUser = data.lastModifiedByUser;
                this.id = data.id;
                this.name = data.name;
                this.price = data.price;
                this.active = data.active;
                this.isNovoProduct = data.isNovoProduct || false;
            }
            // Audit helper methods
            isNewRecord() {
                return this.isNovoProduct || !this.id;
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _id_decorators = [(0, react_1.IsNotEmpty)({
                    message: "mentors:id product dever ser informado",
                })];
            _code_decorators = [(0, react_1.IsOptional)()];
            _version_decorators = [(0, react_1.IsOptional)()];
            _createEntityDate_decorators = [(0, react_1.IsOptional)()];
            _updateEntityDate_decorators = [(0, react_1.IsOptional)()];
            _createdByUser_decorators = [(0, react_1.IsOptional)()];
            _lastModifiedByUser_decorators = [(0, react_1.IsOptional)()];
            _id_decorators_1 = [(0, react_1.IsOptional)()];
            _name_decorators = [(0, react_1.IsOptional)()];
            _price_decorators = [(0, react_1.IsOptional)()];
            _active_decorators = [(0, react_1.IsOptional)()];
            __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
            __esDecorate(null, null, _code_decorators, { kind: "field", name: "code", static: false, private: false, access: { has: obj => "code" in obj, get: obj => obj.code, set: (obj, value) => { obj.code = value; } }, metadata: _metadata }, _code_initializers, _code_extraInitializers);
            __esDecorate(null, null, _version_decorators, { kind: "field", name: "version", static: false, private: false, access: { has: obj => "version" in obj, get: obj => obj.version, set: (obj, value) => { obj.version = value; } }, metadata: _metadata }, _version_initializers, _version_extraInitializers);
            __esDecorate(null, null, _createEntityDate_decorators, { kind: "field", name: "createEntityDate", static: false, private: false, access: { has: obj => "createEntityDate" in obj, get: obj => obj.createEntityDate, set: (obj, value) => { obj.createEntityDate = value; } }, metadata: _metadata }, _createEntityDate_initializers, _createEntityDate_extraInitializers);
            __esDecorate(null, null, _updateEntityDate_decorators, { kind: "field", name: "updateEntityDate", static: false, private: false, access: { has: obj => "updateEntityDate" in obj, get: obj => obj.updateEntityDate, set: (obj, value) => { obj.updateEntityDate = value; } }, metadata: _metadata }, _updateEntityDate_initializers, _updateEntityDate_extraInitializers);
            __esDecorate(null, null, _createdByUser_decorators, { kind: "field", name: "createdByUser", static: false, private: false, access: { has: obj => "createdByUser" in obj, get: obj => obj.createdByUser, set: (obj, value) => { obj.createdByUser = value; } }, metadata: _metadata }, _createdByUser_initializers, _createdByUser_extraInitializers);
            __esDecorate(null, null, _lastModifiedByUser_decorators, { kind: "field", name: "lastModifiedByUser", static: false, private: false, access: { has: obj => "lastModifiedByUser" in obj, get: obj => obj.lastModifiedByUser, set: (obj, value) => { obj.lastModifiedByUser = value; } }, metadata: _metadata }, _lastModifiedByUser_initializers, _lastModifiedByUser_extraInitializers);
            __esDecorate(null, null, _id_decorators_1, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers_1, _id_extraInitializers_1);
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _price_decorators, { kind: "field", name: "price", static: false, private: false, access: { has: obj => "price" in obj, get: obj => obj.price, set: (obj, value) => { obj.price = value; } }, metadata: _metadata }, _price_initializers, _price_extraInitializers);
            __esDecorate(null, null, _active_decorators, { kind: "field", name: "active", static: false, private: false, access: { has: obj => "active" in obj, get: obj => obj.active, set: (obj, value) => { obj.active = value; } }, metadata: _metadata }, _active_initializers, _active_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        // Static factory method for new instances
        _a.newInstance = () => {
            return new _a({
                id: (0, uuid_1.v4)(),
                isNovoProduct: true
            });
        },
        _a;
})();
exports.ProductDto = ProductDto;
//# sourceMappingURL=ProductDto.js.map