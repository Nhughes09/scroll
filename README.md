# 📜 HHeuristics Scrollytelling Engine

A premium, **Apple-style** scrollytelling landing page built with **React**, **GSAP ScrollTrigger**, and **HTML5 Canvas**.

![Preview](https://img.shields.io/badge/Performance-60FPS-green) ![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Features

- **60FPS Video Scrubbing** – Canvas-based rendering bypasses browser video limitations
- **Retina/HiDPI Support** – Crisp visuals on all displays via `devicePixelRatio` scaling
- **Apple-Style Design** – Bold typography, glassmorphism, gold accents
- **Multi-Video Transitions** – Smooth crossfades between video phases
- **Responsive Layout** – Works on desktop and mobile

---

## 🚀 Quick Start

```bash
# Clone the repo
git clone https://github.com/Nhughes09/scroll.git
cd scroll

# Install dependencies
npm install

# Start dev server
npm run dev
```

---

## 🎨 Customization Guide

### Changing the Theme Colors

Open `src/components/ScrollyExperience.jsx` and find/replace the accent color:

| Element         | Current Value                  | What to Change                                |
| --------------- | ------------------------------ | --------------------------------------------- |
| **Gold Accent** | `#D4AF37`                      | Search and replace with your brand color      |
| **Background**  | `bg-black`                     | Change to `bg-slate-900`, `bg-zinc-950`, etc. |
| **Nav Blur**    | `bg-black/40 backdrop-blur-md` | Adjust opacity or blur intensity              |

**Example: Changing to Blue Theme**

```jsx
// Find all instances of:
text-[#D4AF37]
border-[#D4AF37]
hover:bg-[#D4AF37]

// Replace with:
text-[#3B82F6]
border-[#3B82F6]
hover:bg-[#3B82F6]
```

### Changing Typography

The site uses **Inter** font (loaded via Tailwind). To change:

1. Update `tailwind.config.js`:
   ```js
   theme: {
     fontFamily: {
       sans: ['YourFont', 'system-ui', 'sans-serif'],
     },
   }
   ```
2. Add your font via Google Fonts in `index.html` or install via npm.

### Editing Content Sections

All content lives in `ScrollyExperience.jsx` inside the `content-flow` div:

- **Hero** (~line 352): Title, tagline, CTAs
- **Pitch** (~line 380): Main value proposition
- **Features Grid** (~line 393): 4-column feature cards
- **Reports** (~line 414): Report cards with categories
- **Domains** (~line 459): Industry coverage grid
- **CTA/Platforms** (~line 483): Platform links and final CTA
- **Footer** (~line 509): Company info and links

---

## 🎬 Adding Your Own Videos

### Step 1: Source High-Quality Videos

Get free 4K stock videos from:

- [Pexels](https://pexels.com) – Search "abstract", "particles", "tech"
- [Pixabay](https://pixabay.com)
- [Mixkit](https://mixkit.co)

### Step 2: Encode for Smooth Scrubbing (CRITICAL)

Standard MP4s lag because keyframes are sparse. Encode with **All-Intra** for instant seeking:

```bash
ffmpeg -i input.mp4 \
  -vf "scale=1920:-2" \
  -g 1 \
  -crf 23 \
  -preset fast \
  -c:v libx264 \
  -movflags +faststart \
  -y output-scrub.mp4
```

| Flag            | Purpose                                                 |
| --------------- | ------------------------------------------------------- |
| `-g 1`          | **Every frame is a keyframe** (essential for scrubbing) |
| `scale=1920:-2` | Resize to 1080p (4K is too heavy for 60fps seeking)     |
| `-crf 23`       | Quality setting (lower = higher quality, bigger file)   |

### Step 3: Add to Project

1. Place encoded videos in `public/videos/`
2. Update the sources array in `ScrollyExperience.jsx`:

```jsx
const videoSources = [
  "/videos/your-hero-video.mp4",
  "/videos/your-second-video.mp4",
  "/videos/your-third-video.mp4",
];
```

### Step 4: Adjust Timing (Optional)

Control when each video plays by editing the GSAP timeline phases (~line 153):

```jsx
// Video 1: 0% → 15% of scroll
tl.to(scrollObj, { frame1: 1, duration: 0.15 }, 0);

// Video 2: 22% → 60% of scroll
tl.to(scrollObj, { frame2: 1, duration: 0.38 }, 0.22);

// Video 3: 68% → 100% of scroll
tl.to(scrollObj, { frame3: 1, duration: 0.32 }, 0.68);
```

Increase `duration` to make a video play longer. Adjust start positions (last param) to control when videos begin.

---

## 🛠️ Development

### Build CSS (if editing Tailwind classes)

```bash
npm run build:css
```

### Architecture Overview

| Component         | Z-Index | Purpose                                    |
| ----------------- | ------- | ------------------------------------------ |
| Canvas Background | 0       | Fixed video rendering layer                |
| Scroll Track      | 0       | Invisible 1400vh div that drives scrollbar |
| Content Overlay   | 30      | Scrollable text sections                   |
| Navigation        | 40      | Fixed blurred header                       |

---

## 🤖 Built with Google Antigravity

This engine was architected by Google's **Antigravity** agentic coding assistant.

To customize further:

1. Open in Google Antigravity
2. Ask: _"Change the accent color to blue"_
3. Ask: _"Add a new section for testimonials"_
4. Ask: _"Replace videos with new ones from Pexels"_

---

## 📄 License

MIT © [Nhughes09](https://github.com/Nhughes09)
