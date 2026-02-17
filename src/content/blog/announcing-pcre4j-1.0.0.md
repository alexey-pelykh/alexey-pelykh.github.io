---
title: "Announcing pcre4j 1.0.0: PCRE2 Power for Java with a Drop-In API"
slug: announcing-pcre4j-1.0.0
date: "2026-02-16"
excerpt: "Java's regex engine hasn't changed since 2002. No recursive patterns, no JIT, no ReDoS protection. pcre4j brings PCRE2 to the JVM with a drop-in java.util.regex-compatible API."
pillar: problem-solving-expertise
tags:
  - Java
  - PCRE2
  - Open Source
  - Regex
---

## The Problem

Java's regex engine hasn't fundamentally changed since JDK 1.4. That was 2002. It works for the common cases - matching email formats, extracting date components, splitting strings. But it has blind spots that surface the moment you push beyond simple pattern matching.

No recursive patterns. No JIT compilation. No built-in protection against catastrophic backtracking. And a regex dialect that's subtly different from what Nginx, PHP, R, and `grep -P` use.

That last one is the silent killer. If you've ever had a regex that works perfectly in PHP and fails silently in Java - that's not your regex being wrong. That's two different engines interpreting the same pattern differently. `java.util.regex` implements a Java-specific flavor. PCRE2, which powers most of the infrastructure you interact with daily, implements another. They overlap enough to create false confidence, and diverge enough to create real bugs.

The practical impact hits in multiple places. You can't share patterns between systems without retesting every edge case. You can't port validation logic from your Nginx config to your Java backend and trust it'll behave the same way. You can't use recursive patterns to parse nested structures like JSON, HTML fragments, or mathematical expressions - patterns that are straightforward in PCRE2 are mathematically impossible in Java's engine.

And then there's the security angle. If someone feeds your application a crafted input designed to trigger exponential backtracking, `java.util.regex` has no circuit breaker. No match limit. No depth limit. No heap limit. It'll just spin until you kill the thread - or until it takes down the service. This is ReDoS (Regular Expression Denial of Service), and it's a real attack vector. OWASP lists it. CVEs reference it. And Java's standard library offers zero mitigation.

These aren't theoretical concerns. They're the kind of problems you discover in production, after the regex that "tested fine" meets real-world input at scale.

## Why PCRE2

PCRE2 is the regex engine behind half the internet's infrastructure. Nginx uses it. PHP uses it. R uses it. `grep -P` uses it. It's been in continuous development since 1997, battle-tested across billions of matches per day in production systems worldwide.

What makes it different from `java.util.regex` isn't just features - it's a fundamentally different approach to the problem. PCRE2 JIT-compiles patterns to native machine code, turning regex matching into a tight native loop rather than interpreted bytecode. It provides configurable safety limits - match limit, depth limit, heap limit - so you can bound the worst-case cost of any match operation. It supports recursive patterns, atomic groups, conditional patterns, `\K` match reset, and a feature set that's genuinely comprehensive.

The PCRE2 dialect is also the de facto standard. When someone writes a regex, they're usually thinking in PCRE2 syntax. Stack Overflow answers, regex101.com defaults, documentation examples - they all assume PCRE2. Having the same engine in Java means patterns are portable. Write once, match everywhere.

I wanted that in Java. It didn't exist. So I built it. Sometimes the only path forward is actualizing the thing that should have existed all along.

## What pcre4j 1.0.0 Brings

The headline feature: change `import java.util.regex.*` to `import org.pcre4j.regex.*`. Same `Pattern`/`Matcher` contract. Your existing code works. No migration guide needed, no API to relearn, no behavioral surprises where the feature sets overlap.

Under the hood, everything changes.

**Full PCRE2 API coverage.** Every PCRE2 function is exposed through Java bindings. Nothing gated behind "we'll add this later." The complete feature set - compile options, match options, JIT controls, callouts, pattern info, serialization - available from day one. If PCRE2 can do it, pcre4j can do it.

**JIT compilation by default.** PCRE2's JIT compiler translates patterns to native machine code on first compile. For repeated pattern matching - the kind you do in log processing, data validation, text extraction - this puts regex matching in a different performance class. The pattern compiles once, then every match runs as optimized native code.

**Built-in ReDoS protection.** Configure a match limit, a recursion depth limit, and a heap limit. PCRE2 will abort a match that exceeds any threshold instead of spinning forever. This is the catastrophic backtracking protection that `java.util.regex` simply doesn't have. Set your limits, deploy with confidence, and stop worrying about regex-based denial of service.

**Recursive patterns.** `(?R)` for full-pattern recursion. `(?1)` for numbered subroutine calls. Named subroutines. Parse nested parentheses, balanced brackets, recursive grammars - patterns that are mathematically impossible with Java's standard engine because `java.util.regex` doesn't support recursion at all.

**Everything else you'd expect from PCRE2.** `\K` match reset for variable-length lookbehinds. DFA (Deterministic Finite Automaton) matching for finding all matches at a position. Callouts for custom match-time logic. Pattern serialization for pre-compiled pattern distribution. The full PCRE2 option set, not a subset.

**Two native backends.** JNA (Java Native Access) for maximum compatibility - works everywhere Java runs, any architecture, any OS with a PCRE2 library. FFM (Foreign Function & Memory API) for Java 22+ with zero-copy memory semantics and no external dependencies beyond the JDK.

**GraalVM native-image support.** Platform-specific native bundles included, so pcre4j works in ahead-of-time compiled applications without runtime library discovery. Build your native image, and PCRE2 is bundled in.

**JPMS (Java Platform Module System) modules throughout.** Every pcre4j artifact ships with proper Java module declarations. No split packages, no automatic module hacks.

Backend selection happens via `ServiceLoader`. Add the JNA or FFM dependency to your classpath, and pcre4j auto-discovers it. No configuration flags, no system properties, no runtime switches.

## Architecture

Three API layers, each serving a different use case:

**Low-level: Direct PCRE2 function calls.** One-to-one mapping of the PCRE2 C API to Java methods. You allocate memory, you manage lifecycle, you get exactly what PCRE2 provides with no abstraction overhead. This layer exists for library authors building their own abstractions, or for performance-critical code paths where every allocation matters and you want full control over when compilation and matching happen.

**Mid-level: Managed wrappers.** The same PCRE2 API surface, but with automatic memory lifecycle tied to Java's garbage collector. Compiled patterns and match data are managed objects. This is the layer for code that needs PCRE2-specific features - callouts, DFA matching, pattern info queries - without manual resource management. It exposes PCRE2's full capability with Java ergonomics.

**`java.util.regex` drop-in: Familiar Pattern and Matcher.** API-compatible with the standard library. If your code compiles against `java.util.regex`, it compiles against `org.pcre4j.regex` with an import change. For teams that want PCRE2's engine, PCRE2's features, and PCRE2's performance without changing how their code uses regex. This is where most users should start.

The layers are independent. You can mix them in the same application. Start with the drop-in for existing code. Drop to mid-level when you need PCRE2-specific features like callouts or DFA matching. Drop to low-level when you need direct control over memory and compilation.

## The Hard Part

The native binding layer was straightforward. JNA and FFM are well-documented, and PCRE2's C API is clean and consistent. Mapping C functions to Java methods is mechanical work - tedious, but predictable.

The hard part was `java.util.regex` compatibility. `Pattern` and `Matcher` have over two decades of behavioral expectations baked in. Developers don't just use the documented API - they rely on undocumented edge cases. What happens when you call `find()` after `matches()` returns false? What does `replaceAll` do with zero-length matches at the boundary? How does `split` handle trailing empty strings with different limit values?

Every one of these behaviors had to match. Every flag had to work correctly. `split`, `replaceAll`, `find`, `matches`, `lookingAt`, `hitEnd`, named groups, group counts - all had to produce identical results where the feature sets overlap.

Where PCRE2 and Java diverge - where PCRE2 supports features Java doesn't - the drop-in API extends naturally. Where they overlap, the behavior had to be indistinguishable. That's the contract: your code works the same, but the engine underneath is PCRE2.

Getting that contract right was the bulk of the engineering effort. And it's what makes the "just change your import" promise real.

## Quick Start

Add the dependency:

```xml
<dependency>
    <groupId>org.pcre4j</groupId>
    <artifactId>regex</artifactId>
    <version>1.0.0</version>
</dependency>
```

Use it:

```java
import org.pcre4j.regex.Pattern;
import org.pcre4j.regex.Matcher;

Pattern pattern = Pattern.compile("(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})");
Matcher matcher = pattern.matcher("2026-02-16");
if (matcher.find()) {
    System.out.println(matcher.group("year")); // 2026
}
```

That's it. Same API you already know. The only change is the import.

## What's Next

The 1.0.0 milestone means API stability. The contract is set. From here, breaking changes don't happen without a major version bump.

What I'm focused on now: expanding `java.util.regex` API compatibility even further, publishing performance benchmarks comparing JIT-compiled PCRE2 against Java's engine, and listening to what use cases people bring.

If you work with regex in Java and have ever wished for recursive patterns, JIT performance, or catastrophic backtracking protection - I'd like to hear from you. Challenges welcomed. 🚀

[https://github.com/alexey-pelykh/pcre4j](https://github.com/alexey-pelykh/pcre4j)
