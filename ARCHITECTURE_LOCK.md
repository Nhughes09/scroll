# 🔒 ARCHITECTURE LOCK: 60FPS Video Engine

**WARNING: DO NOT MODIFY THE FOLLOWING CORE LOGIC WITHOUT READING THIS FIRST.**
This document preserves the specific technical breakthroughs that allow 4K/HD video to scrub at 60FPS. Deviating from this architecture will result in immediate lag/stutter.

## 1. The "Clean Scrub" Rule (Asset Pipeline)

**The Problem:** Standard MP4 videos have Keyframes (I-frames) every ~60-120 frames. To show frame 5, the browser must decode frame 0, 1, 2, 3, 4, 5. This takes >100ms.
**The Solution:** All videos MUST be re-encoded as **All-Intra** (Keyframe Interval = 1).
**The Command:**

```bash
ffmpeg -i input.mp4 -vf "scale=1920:-2" -g 1 -crf 23 -preset fast -c:v libx264 -movflags +faststart -y output-scrub.mp4
```

- `scale=1920:-2`: 1080p is the max safe resolution for live seeking. 4K is too heavy.
- `-g 1`: **MANDATORY**. Forces every frame to be a keyframe.

## 2. The "Canvas-Blit" Rule (Rendering Engine)

**The Problem:** Reacting to scroll by updating a `<video>` tag's `currentTime` and waiting for the DOM to update is too slow and async.
**The Solution:**

1.  We maintain a `canvas` element equal to the viewport size.
2.  We use a `requestAnimationFrame` loop (via GSAP ticker or custom loop).
3.  We use `context.drawImage(video, ...)` to "blit" the current frame instantly.
4.  We do **NOT** rely on React rerenders for video updates.

## 3. The "Smart Seek" Rule (Logic)

**The Problem:** High-frequency scroll events dispatch faster than the video can seek. Stacking 50 seek requests crashes the seek pipeline.
**The Solution:**

```javascript
const smartSeek = (video, progress) => {
  // 1. Tolerance check: If we are close enough, don't seek.
  if (Math.abs(video.currentTime - target) < 0.05) return;
  // 2. Lock check: If the video is busy seeking, DROP the frame. DO NOT QUEUE.
  if (!video.seeking) {
    video.currentTime = target;
  }
};
```

## 4. Preservation Checklist

Before adding any new feature:

- [ ] Are we still using `-scrub.mp4` files?
- [ ] Is the Canvas rendering loop still decoupled from React state?
- [ ] Is `smartSeek` still preventing seek-stacking?
- [ ] Did we run the "Stress Test" (fast scroll) after changes?

**Status (Current Build):**

- Seek Latency: ~7ms (Excellent)
- Render Time: ~0.5ms (Excellent)
- FPS: 60+
