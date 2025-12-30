# 📜 60FPS Cinematic Scrollytelling Engine

A high-performance "Apple-style" video scrolling engine built with **React**, **GSAP ScrollTrigger**, and **HTML5 Canvas**.

This project solves the common "laggy video scrub" problem by bypassing the DOM `<video>` renderer and drawing frames directly to a hardware-accelerated canvas.

## 🚀 How It Works

Standard `<video>` tags are optimized for _playback_, not _scrubbing_. Seeking back and forth 60 times a second crashes performance because the browser has to decode previous frames (GOP) to find the current one.

**Our Solution: The "Video-to-Canvas" Architecture**

1.  **Canvas Rendering**: We use a RequestAnimationFrame loop to draw video frames to a fixed `<canvas>`.
2.  **Smart Seeking**: We use a `smartSeek` algorithm that debounces seek requests to prevent browser lockup.
3.  **GSAP Timeline**: We map the scroll position (0% to 800%) to the video's current time.

## 🛠️ How to Use This Tech

### 1. Prerequisities

You need `ffmpeg` installed to prepare your videos. This is the **secret sauce** for smoothness.

### 2. The Golden Rule: "All-Intra" Encoding

For 60fps scrubbing, your video **MUST** be encoded where **every frame is a keyframe** (All-Intra).
Standard MP4s have keyframes every ~2 seconds. If you scrub to 1.5s, the computer has to decode 1.0s -> 1.5s instantly. This causes lag.

**Run this command on your video:**

```bash
ffmpeg -i input.mp4 -vf "scale=1920:-2" -g 1 -crf 23 -preset fast -c:v libx264 -movflags +faststart -y output-scrub.mp4
```

- `-g 1`: Forces a keyframe every 1 frame (Crucial!)
- `scale=1920:-2`: Resizes to 1080p (4K is often too heavy to decode at 60fps seek speed).

### 3. Implementation

Look at `src/components/ScrollyExperience.jsx`.

```javascript
// Map your scroll progress to the video time
tl.to(scrollObj, {
  frame1: 1, // 0 to 100%
  onUpdate: () => {
    // Seek video
    smartSeek(video, scrollObj.frame1);
    // Draw to canvas
    context.drawImage(video, 0, 0, width, height);
  },
});
```

### 4. Replacing Videos

1.  Get free 4K videos from **Pexels** or **Pixabay** (search "Abstract", "Tech", "Particles").
2.  Run the FFmpeg command above.
3.  Place file in `public/videos/`.
4.  Update sources in `ScrollyExperience.jsx`:
    ```javascript
    const videoSources = [
      "/videos/my-new-video-scrub.mp4",
      "/videos/another-video-scrub.mp4",
    ];
    ```

## 🤖 Built with Google Antigravity

This engine was architected by Google's **Antigravity** agentic coding assistant.
To replicate this:

1.  Ask Antigravity to "Build a GSAP Scrollytelling site".
2.  Specify "Use Canvas API for performance".
3.  Ask it to "Re-encode my videos to All-Intra using FFmpeg".

---

_Created by Nhughes09_
