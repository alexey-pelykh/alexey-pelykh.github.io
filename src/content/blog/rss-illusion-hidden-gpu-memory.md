---
title: "The RSS Illusion: 63 GB Process on a 32 GB Machine"
slug: rss-illusion-hidden-gpu-memory
date: "2026-03-18"
excerpt: "macOS reported 64 GB memory usage on a 32 GB machine. The cause: RSS underestimates by 15x when processes accumulate compressed dirty pages. A deep dive into IOAccelerator slab allocation in Claude Code and why your ps output is wrong."
pillar: systems-craft
tags:
  - macOS
  - Memory Management
  - Claude Code
  - Bun
  - Debugging
---

macOS displayed "Apps out of memory - iTerm2: 63.89 GB" on my 32 GB machine.

iTerm2 is my terminal. It doesn't do anything that should consume 64 GB. So I went looking.

## The real culprit

Every Claude Code session runs as a child process of iTerm2. macOS attributes all descendant memory to the parent application. That's why the dialog blamed iTerm2.

I had 37 iTerm tabs open, each with a Claude Code session. Most were idle. Finished conversations I never closed.

`ps aux` reported 4.1 GB total RSS across all 95 Claude processes. The macOS `footprint` tool reported 62.7 GB.

A 15x gap.

## How RSS misleads on macOS

RSS (Resident Set Size) counts pages physically resident in RAM. When macOS compresses or swaps dirty pages, RSS drops. The process *appears* to shrink.

But `footprint` tracks dirty pages regardless of compression state. Those pages are still attributed to the process. They still count against system memory pressure. Activity Monitor and the "out of memory" dialog use `footprint`, not RSS.

The result: a process can show 7 MB RSS while holding 1.3 GB of dirty, non-reclaimable memory. RSS doesn't just undercount. It creates a dangerous illusion. The process looks like it's using *less* memory over time while actually consuming *more*.

If you're monitoring macOS workloads with `ps` or anything RSS-based, you're flying blind.

## Decomposing the footprint

Using `footprint -p <pid>`, each Claude Code process breaks down into memory categories. The pattern across sessions of different ages tells the story:

| Session Age | WebKit malloc | IOAccelerator | Total Footprint |
|-------------|--------------|---------------|-----------------|
| Fresh (3 hrs) | 343 MB (77%) | 48 MB (11%) | 443 MB |
| 8 days idle | 231 MB (23%) | 711 MB (71%) | 996 MB |
| 15 days idle | 265 MB (20%) | 968 MB (73%) | 1,324 MB |

IOAccelerator starts small and grows to dominate. Every allocation is marked dirty and non-reclaimable. macOS cannot free this memory without killing the process.

## 128 MB slabs that never get freed

`vmmap` reveals the IOAccelerator memory is structured as 128 MB slabs:

```
Address Range                    VSIZE    RSDNT  DIRTY   SWAP
54db4000000-54dbc000000  128.0M  1440K  1440K  95.7M   ← oldest slab
54dbc000000-54dc4000000  128.0M     0K     0K  95.3M
54dc4000000-54dcc000000  128.0M     0K     0K 126.3M
...
54dfc000000-54e04000000  128.0M     0K     0K    80K   ← newest slab
(reserved)                768.0M     0K     0K     0K   ← pre-allocated
```

The oldest slabs fill to 95-128 MB. When one fills, a new one is allocated. They are never freed or reused. A reserved block pre-allocates VM address space for future growth.

After 15 days idle: 10 slabs, 966 MB swapped, 1.4 MB resident. Peak footprint for this single session hit 2.8 GB.

## Where does the GPU stack come from?

Claude Code is built on Bun, which uses JavaScriptCore from WebKit. It renders its TUI using Ink, a React-based terminal rendering framework.

Despite being a terminal REPL that outputs ANSI escape codes, the process loads a full GPU stack:

- Metal.framework
- MetalPerformanceShaders.framework (MPSNeuralNetwork, MPSNDArray, MPSImage)
- IOAccelerator.framework
- IOSurface.framework
- GPUWrangler.framework
- GPUCompiler.framework
- WebCore.framework

No explicit Metal API calls exist in the binary. So where does this come from?

My first hypothesis was JSC/WebKit's rendering infrastructure. Testing disproved it. Loading JSC and WebKit directly via `dlopen()` in a C test program produced zero IOAccelerator allocations and zero GPU frameworks. Standalone Bun also loads zero Metal or GPU frameworks.

The GPU framework stack is loaded specifically by Claude Code. Something in its dependency tree triggers it. What's proven: it's not JSC and it's not Bun's baseline runtime. The exact dependency remains unidentified.

## Isolation testing

To narrow the cause, I ran control tests at multiple layers:

| Test | IOAccel Slabs | IOAccel Dirty | Footprint |
|------|--------------|---------------|-----------|
| C + dlopen(JSC) + eval | 0 | 0 | 3.7 MB |
| C + dlopen(WebKit) | 0 | 0 | 2.0 MB |
| Bun idle (sleep) | 1 | 1.3 MB | 6.5 MB |
| Bun + heavy JSON parsing | 1 | 1.4 MB | 6.7 MB |
| Bun + HTTP streaming (20 req) | 1 (2 regions) | 2.3 MB | 13 MB |
| Claude Code (3 hrs active) | 4 | 46 MB | 443 MB |
| Claude Code (15 days idle) | 10 | 966 MB | 1,324 MB |

Two layers emerged.

**Layer 1 - Bun baseline**: Bun allocates a 128 MB IOAccelerator slab on startup. JSC alone (via `dlopen`) doesn't. This is Bun-specific, small, and fixed. No Metal or GPU frameworks are loaded. I tested 12 JSC/Bun environment variables and flags. None affected the allocation.

**Layer 2 - Claude Code growth**: Claude Code loads the full Metal/GPU framework stack and grows from 1 slab to 10+ over its lifetime. HTTP streaming in standalone Bun caused growth from 1 to 2 IOAccelerator regions in 20 seconds, suggesting sustained network I/O is a contributor. Claude Code streams API responses for hours, which would amplify this.

Running `leaks` on the 15-day idle session reported 175,613 leaked objects totaling 13.5 MB in the standard malloc zone alone. The WebKit malloc zone was unreadable due to security restrictions. The actual leak count is likely much higher.

The session's file descriptors were all revoked. No GPU device handles remained open. The IOAccelerator memory was orphaned. Buffers allocated with no active GPU connections.

## What this means

**For monitoring**: If you monitor macOS workloads using RSS, you can get a 15x underestimate for long-running processes with IOAccelerator allocations. Use `footprint` or `kern.memorystatus_level` instead.

```bash
# Real memory cost per process
footprint -p <pid>

# System memory pressure as percentage
sysctl -n kern.memorystatus_level
```

**For runtime selection**: Bun allocates IOAccelerator-tagged memory on startup that JSC alone doesn't. It's small at baseline, but Claude Code shows what happens when a large application runs on top for hours: the allocation grows to nearly 1 GB and is never reclaimed. If your Bun application does sustained network I/O, monitor with `footprint`, not RSS.

**For Claude Code users**: Close idle sessions. Each one accumulates ~1 GB of non-reclaimable footprint after a few hours of active use. If macOS reports "out of memory" for your terminal, check for accumulated Claude processes.

**What's still open**: Which Claude Code dependency loads the Metal/GPU framework stack that standalone Bun doesn't? Is the slab growth driven by sustained network streaming, terminal rendering, or both? These questions are tracked at [oven-sh/bun#28234](https://github.com/oven-sh/bun/issues/28234) and [anthropics/claude-code#35804](https://github.com/anthropics/claude-code/issues/35804). Corrections to the original reports have been issued.
