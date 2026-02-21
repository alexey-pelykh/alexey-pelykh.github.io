---
title: "Why I Built puppeteer-capture"
slug: why-i-built-puppeteer-capture
date: "2026-02-21"
excerpt: "Standard browser screen recording is non-deterministic - every run produces slightly different output. puppeteer-capture uses Chrome's HeadlessExperimental CDP domain for frame-perfect, reproducible video capture from any website."
pillar: problem-solving-expertise
tags:
  - Puppeteer
  - Open Source
  - Video Capture
  - Chrome DevTools Protocol
  - JavaScript
---

## The Problem Nobody Talks About

If you've ever tried to generate video from a browser programmatically, you know the dirty secret: every run produces a slightly different result.

Standard screen recording approaches - whether through Puppeteer's built-in screencast or third-party recorders - capture frames in real time. That means frame timing depends on system load, CPU scheduling, and whatever else your machine happens to be doing. Run the same script twice. Get two different videos. The frames land at slightly different moments. Animations stutter or stretch depending on how fast Chrome can actually render.

For most use cases, this is fine. A demo recording with a few dropped frames is still a demo recording.

But if you're generating video content programmatically - automated product demos, tutorial generation, visual regression baselines - "slightly different every time" is not fine. It's a fundamental problem.

## Why Screencast Approaches Fail for Deterministic Output

The root cause is straightforward: real-time capture means the capture tool is racing against the renderer.

Puppeteer's `Page.screencast()` and similar approaches subscribe to frame events as Chrome produces them. Chrome renders when it can, the capture tool grabs what's available. If the system is under load, Chrome renders slower. The capture tool gets fewer frames. The output is shorter, or frames are spaced unevenly.

This creates three specific problems:

1. **Non-reproducible output.** The same page with the same animations produces different video files across runs. CI pipelines can't reliably compare outputs.
2. **Lost frames under load.** Heavy pages or constrained environments (CI runners, containers) drop frames. The output degrades exactly when you need it most.
3. **No timing control.** You can't say "capture exactly 60 frames per second for exactly 5 seconds." You get whatever the system gives you.

The usual workarounds - adding delays, reducing resolution, over-provisioning hardware - are band-aids. They reduce the problem without solving it.

## How Chrome's HeadlessExperimental Domain Changes Everything

Chrome has an experimental CDP (Chrome DevTools Protocol) domain called `HeadlessExperimental` that most developers never encounter. It exposes a method called `beginFrame` that fundamentally changes the capture model.

Instead of subscribing to frames as Chrome produces them, `beginFrame` lets you *request* frames on demand. You tell Chrome: render a frame now. Chrome renders it. You get the result. No racing, no timing dependencies, no dropped frames.

Here's the mental model. In normal operation, Chrome runs a rendering loop: layout, paint, composite, display. The timing of this loop depends on system resources, vsync, and whatever else is happening on the machine. A screencast tool hooks into this loop and captures whatever Chrome happens to produce.

With `beginFrame`, you replace Chrome's internal rendering loop with your own. You send a CDP command. Chrome runs exactly one layout-paint-composite cycle. You get the frame buffer back. Nothing happens until you send the next command. The browser is essentially frozen between your requests.

Combined with Chrome's deterministic mode (`--deterministic-mode` and `--enable-begin-frame-control`), this gives you full control over the rendering pipeline:

- **You control the clock.** The page's `setTimeout`, `requestAnimationFrame`, and CSS animations advance when you tell them to, not when wall-clock time elapses. A page with a 2-second CSS transition doesn't take 2 wall-clock seconds to capture. It takes however long Chrome needs to render the frames you request.
- **You control the frame rate.** Want 60fps? Request 60 frames per second of virtual time. Want 30? Request 30. The math is exact. No approximation, no "close enough."
- **Every run is identical.** Same inputs produce byte-identical frame sequences. No system load variance, no dropped frames, no timing jitter. Run it on a fast machine or a slow CI runner. Same output.

This is what puppeteer-capture is built on. The CDP primitives exist in Chrome. The library wraps them into something you'd actually want to use.

## Quick Start

Ten lines to your first deterministic video capture:

```javascript
import { capture, launch } from 'puppeteer-capture';

const browser = await launch();
const page = await browser.newPage();
const recorder = await capture(page);

await page.goto('https://example.com', { waitUntil: 'networkidle0' });
await recorder.start('output.mp4');
await recorder.waitForTimeout(3000);
await recorder.stop();
await browser.close();
```

The key difference from normal Puppeteer: `recorder.waitForTimeout()` advances the page's virtual timeline instead of waiting for wall-clock time. The page "experiences" 3 seconds passing. Chrome renders each frame on demand. FFmpeg encodes the result. The output is identical every time you run it.

One important detail: standard `page.waitForTimeout()` won't work in deterministic mode. The page's clock is frozen until you advance it. This is by design - it's what makes the output reproducible - but it means you need to use the recorder's timing methods for anything that depends on the passage of time.

## Configuration

The defaults (60fps, H.264, MP4) work for most cases. When you need more control:

```javascript
import { capture, launch, PuppeteerCaptureFormat } from 'puppeteer-capture';

const recorder = await capture(page, {
  fps: 30,
  size: '1920x1080',
  format: PuppeteerCaptureFormat.MP4('slow'),
});
```

FFmpeg resolution follows a practical chain: `FFMPEG` environment variable, then system PATH, then `ffmpeg-static` as an npm fallback. In CI environments where FFmpeg installation is uncertain, the npm fallback keeps things working without extra setup.

## Real-World Use Cases

**Automated demo recordings.** Product changes? Re-run the capture script. Get a pixel-perfect demo video that matches the current UI exactly. No manual screen recording sessions, no "let me redo that, I clicked the wrong thing," no "the animation was laggy because Slack decided to sync." The script is the source of truth. The video is a build artifact.

**Tutorial generation.** Script the user journey step by step, capture the video. When the product UI changes, update the script and regenerate. Every tutorial stays current without a human re-recording anything. For teams maintaining documentation across product versions, this turns video tutorials from a maintenance burden into an automated pipeline.

**Visual regression testing.** This is where deterministic output really earns its keep. Frame-by-frame comparison works because the frames are identical across runs. When the output changes, you know it's because the page changed, not because the capture environment varied. You can diff video output the same way you diff screenshots, but for animations, transitions, and interactive flows.

**Marketing video automation.** Generate personalized demo videos at scale. Swap in different user names, different data sets, different locales. Each variation gets the same production quality because the capture process is deterministic. No manual production pipeline, no per-variant rendering inconsistencies.

## What You Should Know Before Using It

Platform support: Linux and Windows. macOS is not supported. The `HeadlessExperimental.beginFrame` API behaves differently on macOS, and the deterministic mode flags don't produce reliable results there. If your CI runs on Linux (most do), this isn't a problem. If you're developing locally on a Mac, you'll need a Linux container or VM for capture.

The library depends on Chrome's `HeadlessExperimental` domain, which is experimental by nature. It works with `chrome-headless-shell` (the dedicated headless binary), not with `--headless=new`. This is stable in practice - the API hasn't changed meaningfully across recent Chrome versions - but it's worth knowing that "experimental" is in the name.

There are known edge cases. Setting the viewport after starting capture requires a small delay to avoid race conditions. Chrome versions 117-120 had intermittent crash issues with the deterministic mode flags. These are documented and have workarounds, but they exist. I'm not going to pretend the tool is flawless.

## "But What About Remotion?"

Fair question. [Remotion](https://www.remotion.dev/) is excellent - I've contributed to it myself, and I think what Jonny Burger has built is genuinely impressive. If you need to create videos programmatically from scratch, Remotion is the tool. Write React components, define your scenes, render to video. It's a video creation framework.

But Remotion solves a different problem. It creates videos FROM your React code. You author the content as components. The video is the output of your application.

puppeteer-capture solves the opposite problem: recording video FROM an existing website. Any website. Your product's dashboard, a third-party SaaS tool, a competitor's landing page, a web animation you found interesting. You don't need to rebuild the content in React. You point a browser at a URL and capture what's there.

| | Remotion | puppeteer-capture |
|--|---------|-------------------|
| **Input** | React components you write | Any URL in a browser |
| **Approach** | Create video content in code | Record existing web content |
| **When to use** | Building video from scratch | Capturing what already exists |
| **Deterministic** | Yes (code-driven) | Yes (virtual time control) |

They're complementary tools. If you're generating data-driven videos, explainer animations, or personalized content from structured data, use Remotion. If you need to capture a product flow, record a web application in action, or generate visual regression baselines from existing pages, that's where puppeteer-capture lives.

## Why I Built This

Sometimes the only path forward is actualizing the thing that should have existed all along.

I needed deterministic video capture of an existing web application. Not a React app I was building from scratch - an application already running in a browser. I needed to navigate to it, interact with it, and record what happened. Reproducibly.

I searched for existing solutions. Found several Puppeteer recording libraries. They all used real-time screencast capture. They worked for "good enough" demos but failed the reproducibility test. Two runs of the same script produced measurably different outputs. For my use case, that was a non-starter.

Remotion was an option if I was willing to rebuild the UI in React components. I wasn't. The whole point was capturing what already existed, not recreating it.

The Chrome capability to do this properly existed. The `HeadlessExperimental.beginFrame` API had been in the CDP protocol for years. But using it directly meant managing CDP sessions, coordinating virtual time advancement, handling frame buffer encoding, and wiring up FFmpeg - all the plumbing that turns a protocol capability into a usable tool.

So I built the wrapper. puppeteer-capture takes the `HeadlessExperimental.beginFrame` workflow and packages it into a Puppeteer plugin with the API you'd expect: `start()`, `waitForTimeout()`, `stop()`. The complexity of CDP session management, virtual time coordination, and FFmpeg encoding happens behind an interface that feels like a normal screen recorder. Except the output is deterministic. And it works with any page you can navigate to.

The project is open source, available on [npm](https://www.npmjs.com/package/puppeteer-capture) and [GitHub](https://github.com/alexey-pelykh/puppeteer-capture). The documentation lives at [pptr-capture.org](https://pptr-capture.org).

## What's Next

The immediate roadmap: broader Chrome version coverage, better error messages for the known edge cases, and investigating whether Chrome's newer headless mode will eventually support `beginFrame` natively.

The longer-term question is more interesting. As more teams automate content production - product demos, tutorials, marketing materials, visual testing - the demand for reproducible video output grows. Right now, most of those workflows involve a human recording their screen. That doesn't scale, and it doesn't integrate with CI/CD pipelines.

Deterministic browser capture is the foundation for treating video as a build artifact instead of a manual production task. Whether that capability comes from puppeteer-capture or gets absorbed into Puppeteer core, the underlying need isn't going away.

If you're hitting the same problem I was, give it a try. Install is `npm install puppeteer-capture puppeteer`, and the quick start above is a working example. If you find edge cases I haven't documented, open an issue. That's how open source gets better.
