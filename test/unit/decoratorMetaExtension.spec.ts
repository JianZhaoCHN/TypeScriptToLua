import { Expect, Test, TestCase } from "alsatian";
import * as util from "../src/util";

import { TranspileError } from "../../src/Transpiler";

export class DecoratorMetaExtension {

    @Test("MetaExtension")
    public metaExtension(): void {
        // Transpile
        const lua = util.transpileString(
            `
            declare class _LOADED;
            declare namespace debug {
                function getregistry(): any;
            }
            /** !MetaExtension */
            class LoadedExt extends _LOADED {
                public static test() {
                    return 5;
                }
            }
            return debug.getregistry()["_LOADED"].test();
            `
        );
        console.log(lua);
        console.log("\n");
        console.log("\n");
        console.log("\n");
        const result = util.executeLua(lua);
        // Assert
        Expect(result).toBe(5);
    }

    @Test("IncorrectUsage")
    public incorrectUsage(): void {
        Expect(() => {
            util.transpileString(
                `
                /** !MetaExtension */
                class LoadedExt {
                    public static test() {
                        return 5;
                    }
                }
                `
            );
        }).toThrowError(TranspileError,
                        "!MetaExtension requires the base class to have the name of the metatable beeing extended.");
    }
}
