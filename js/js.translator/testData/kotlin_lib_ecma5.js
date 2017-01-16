/*
 * Copyright 2010-2014 JetBrains s.r.o.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function () {
    Kotlin.TYPE = {
        CLASS: "class",
        TRAIT: "trait",
        OBJECT: "object",
        INIT_FUN: "init fun"
    };

    Kotlin.classCount = 0;
    Kotlin.newClassIndex = function () {
        var tmp = Kotlin.classCount;
        Kotlin.classCount++;
        return tmp;
    };

    function isNativeClass(obj) {
        return !(obj == null) && obj.$metadata$ == null;
    }

    Kotlin.callGetter = function (thisObject, klass, propertyName) {
        var propertyDescriptor = Object.getOwnPropertyDescriptor(klass, propertyName);
        if (propertyDescriptor != null) {
            if (propertyDescriptor.get != null) {
                return propertyDescriptor.get.call(thisObject);
            }
            else if ("value" in propertyDescriptor) {
                return propertyDescriptor.value;
            }
        }
        else {
            return Kotlin.callGetter(thisObject, Object.getPrototypeOf(klass), propertyName);
        }
        return null;
    };

    Kotlin.callSetter = function (thisObject, klass, propertyName, value) {
        var propertyDescriptor = Object.getOwnPropertyDescriptor(klass, propertyName);
        if (propertyDescriptor != null) {
            if (propertyDescriptor.set != null) {
                propertyDescriptor.set.call(thisObject, value);
            }
            else if ("value" in propertyDescriptor) {
                throw new Error("Assertion failed: Kotlin compiler should not generate simple JavaScript properties for overridable " +
                                "Kotlin properties.");
            }
        }
        else {
            return Kotlin.callSetter(thisObject, Object.getPrototypeOf(klass), propertyName, value);
        }
    };

    function isInheritanceFromTrait(metadata, trait) {
        // TODO: return this optimization
        /*if (metadata == null || metadata.classIndex < trait.$metadata$.classIndex) {
            return false;
        }*/
        var baseClasses = metadata.baseClasses;
        var i;
        for (i = 0; i < baseClasses.length; i++) {
            if (baseClasses[i] === trait) {
                return true;
            }
        }
        for (i = 0; i < baseClasses.length; i++) {
            if (isInheritanceFromTrait(baseClasses[i].$metadata$, trait)) {
                return true;
            }
        }
        return false;
    }

    /**
     *
     * @param {*} object
     * @param {Function|Object} klass
     * @returns {Boolean}
     */
    Kotlin.isType = function (object, klass) {
        if (klass === Object) {
            switch (typeof object) {
                case "string":
                case "number":
                case "boolean":
                case "function":
                    return true;
                default:
                    return object instanceof Object;
            }
        }

        if (object == null || klass == null || (typeof object !== 'object' && typeof object !== 'function')) {
            return false;
        }

        if (typeof klass === "function" && object instanceof klass) {
            return true;
        }

        var proto = Object.getPrototypeOf(klass);
        var constructor = proto != null ? proto.constructor : null;
        if (constructor != null && "$metadata$" in constructor) {
            var metadata = constructor.$metadata$;
            if (metadata.type === Kotlin.TYPE.OBJECT) {
                return object === klass;
            }
        }

        // In WebKit (JavaScriptCore) for some interfaces from DOM typeof returns "object", nevertheless they can be used in RHS of instanceof
        if (isNativeClass(klass)) {
            return object instanceof klass;
        }

        if (isTrait(klass) && object.constructor != null) {
            metadata = object.constructor.$metadata$;
            if (metadata != null) {
                return isInheritanceFromTrait(metadata, klass);
            }
        }

        return false;
    };

    function isTrait(klass) {
        var metadata = klass.$metadata$;
        return metadata != null && metadata.type === Kotlin.TYPE.TRAIT;
    }

    Kotlin.getCallableRef = function(name, f) {
        f.callableName = name;
        return f;
    };

    Kotlin.getCallableRefZeroArg = function(name, getter, setter) {
        getter.get = getter;
        getter.set = setter;
        getter.callableName = name;
        return getPropertyRefClass(getter, setter, propertyRefClassMetadataCache.zeroArg);
    };

    Kotlin.getCallableRefOneArg = function(name, getter, setter) {
        getter.get = getter;
        getter.set = setter;
        getter.callableName = name;
        return getPropertyRefClass(getter, setter, propertyRefClassMetadataCache.oneArg);
    };

    function getPropertyRefClass(obj, setter, cache) {
        obj.$metadata$ = getPropertyRefMetadata(typeof setter === "function" ? cache.mutable : cache.immutable);
        obj.constructor = obj;
        return obj;
    }

    var propertyRefClassMetadataCache = {
        zeroArg: {
            mutable: { value: null, implementedInterface: function () {
                return Kotlin.kotlin.reflect.KMutableProperty0 }
            },
            immutable: { value: null, implementedInterface: function () {
                return Kotlin.kotlin.reflect.KProperty0 }
            }
        },
        oneArg: {
            mutable: { value: null, implementedInterface: function () {
                return Kotlin.kotlin.reflect.KMutableProperty1 }
            },
            immutable: { value: null, implementedInterface: function () {
                return Kotlin.kotlin.reflect.KProperty1 }
            }
        }
    };

    function getPropertyRefMetadata(cache) {
        if (cache.value === null) {
            cache.value = {
                baseClasses: [cache.implementedInterface()],
                baseClass: null,
                classIndex: Kotlin.newClassIndex(),
                functions: {},
                properties: {},
                types: {},
                staticMembers: {}
            };
        }
        return cache.value;
    }

////////////////////////////////// packages & modules //////////////////////////////

    Kotlin.modules = {};

    /**
     * @param {string} id
     * @param {Object} declaration
     */
    Kotlin.defineModule = function (id, declaration) {
        Kotlin.modules[id] = declaration;
    };

    Kotlin.defineInlineFunction = function(tag, fun) {
        return fun;
    };

    Kotlin.isTypeOf = function(type) {
        return function (object) {
            return typeof object === type;
        }
    };

    Kotlin.isInstanceOf = function (klass) {
        return function (object) {
            return Kotlin.isType(object, klass);
        }
    };

    Kotlin.orNull = function (fn) {
        return function (object) {
            return object == null || fn(object);
        }
    };
    
    Kotlin.andPredicate = function (a, b) {
        return function (object) {
            return a(object) && b(object);
        }
    };

    Kotlin.kotlinModuleMetadata = function (abiVersion, moduleName, data) {
    };

    Kotlin.imul = Math.imul || imul;

    Kotlin.imulEmulated = imul;

    function imul(a, b) {
        return ((a & 0xffff0000) * (b & 0xffff) + (a & 0xffff) * (b | 0)) | 0;
    }
})();
