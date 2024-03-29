import { BenchmarkKind, MemoryBenchmarkResult, ComparisonInfo, MemoryBenchmarkCategory } from "./benchmark_types";
import { compareNumericBenchmarks } from "./benchmark_util";
import { toFixed, json } from "./util";

export function runMemoryBenchmark(benchmarkFunction: () => void): MemoryBenchmarkResult {
    const result: MemoryBenchmarkResult = {
        kind: BenchmarkKind.Memory,
        benchmarkName: "NO_NAME",
        categories: {
            [MemoryBenchmarkCategory.Garbage]: 0,
            [MemoryBenchmarkCategory.TotalMemory]: 0,
        },
    };

    // collect before running benchmark
    collectgarbage("collect");

    // stop automatic gc
    collectgarbage("stop");

    const preExecMemoryUsage = collectgarbage("count");

    // store return value this allows benchmark functions
    // to prevent "useful" result data from being garbage collected
    let temp = benchmarkFunction();

    const postExecMemoryUsage = collectgarbage("count");

    collectgarbage("restart");
    collectgarbage("collect");

    // get the amount of garbage collected
    result.categories[MemoryBenchmarkCategory.Garbage] = postExecMemoryUsage - collectgarbage("count");

    // make sure result isn't garbage collected until now and supress unused var warning
    temp = temp;

    result.benchmarkName = debug.getinfo(benchmarkFunction).short_src;

    result.categories[MemoryBenchmarkCategory.TotalMemory] = postExecMemoryUsage - preExecMemoryUsage;

    return result;
}

const formatMemory = (memInKB: number) => toFixed(memInKB / 1024, 3);

export function compareMemoryBenchmarks(
    oldResults: MemoryBenchmarkResult[],
    newResults: MemoryBenchmarkResult[]
): ComparisonInfo {
    // Can not use Object.values because we want a fixed order.
    const categories = [MemoryBenchmarkCategory.TotalMemory, MemoryBenchmarkCategory.Garbage];

    const summary = categories
        .map(category => `### ${category}\n\n${compareCategory(newResults, oldResults, category)}`)
        .join("\n");

    const text = `### master:\n\`\`\`json\n${json.encode(oldResults)}\n\`\`\`\n### commit:\n\`\`\`json\n${json.encode(
        newResults
    )}\n\`\`\``;

    return { summary, text };
}

function compareCategory(
    newResults: MemoryBenchmarkResult[],
    oldResults: MemoryBenchmarkResult[],
    category: MemoryBenchmarkCategory
): string {
    return compareNumericBenchmarks(newResults, oldResults, "mb", result => result.categories[category], formatMemory);
}
