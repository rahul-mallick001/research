# Media & Content Customization Guide

This guide helps you customize the images, animated GIFs, simulation videos, and documents for your research website.

---

## 1. Directory Structure

All media assets are organized in the `assets/` folder:

```
d:\github\
├── index.html                 # Homepage with live interactive CFD engine
├── research.html              # Detailed research themes and equations
├── simulations.html           # Multimedia gallery & video showcase
├── publications.html          # Publications with 1-click BibTeX citations
├── cv.html                    # Academic CV with download button
├── contact.html               # Contact details & academic profiles
├── cv.pdf                     # Your downloadable PDF CV
├── assets/
│   ├── css/
│   │   └── style.css          # Theme styles (Light/Dark mode, responsive)
│   ├── js/
│   │   ├── main.js            # Modals, dark-mode toggle, filtering
│   │   └── simulation.js      # Interactive Canvas CFD engine
│   ├── images/
│   │   ├── profile-avatar.svg # Profile avatar (or replace with profile.jpg)
│   │   ├── electrokinetics-diagram.svg
│   │   ├── bem-mesh.svg
│   │   ├── lbm-lattice.svg
│   │   ├── ehd-droplet.svg
│   │   └── iitkgp-badge.svg
│   └── media/
│       ├── sample-simulation.mp4
│       └── sample-lbm-vortex.mp4
```

---

## 2. Replacing Your Profile Photo

1. Place your headshot photo in `assets/images/profile.jpg` (or `.png`).
2. In `index.html`, find:
   ```html
   <img src="assets/images/profile-avatar.svg" alt="Rahul - Research Scholar" class="profile-photo">
   ```
   Change it to:
   ```html
   <img src="assets/images/profile.jpg" alt="Rahul - Research Scholar" class="profile-photo">
   ```

---

## 3. Adding Simulation Videos (MP4)

To display your ParaView, Tecplot, or experimental high-speed camera recordings:

1. Copy your `.mp4` file to `assets/media/your-video-name.mp4`.
2. In `simulations.html`, look for the `<video>` block:
   ```html
   <video controls loop muted playsinline poster="assets/images/ehd-droplet.svg">
     <source src="assets/media/your-video-name.mp4" type="video/mp4">
   </video>
   ```
3. Recommended encoding for web streaming:
   - **Codec:** H.264 (`-c:v libx264 -profile:v main -pix_fmt yuv420p`)
   - **Resolution:** 720p or 1080p
   - Quick ffmpeg optimization command:
     ```bash
     ffmpeg -i input.avi -vcodec libx264 -crf 23 -preset slow -pix_fmt yuv420p assets/media/droplet-simulation.mp4
     ```

---

## 4. Adding Animated Simulation GIFs

To showcase looping fluid flow or boundary element mesh updates:

1. Place your `.gif` file in `assets/media/` (e.g., `assets/media/vortex-street.gif`).
2. Add an image tag in `simulations.html` or `research.html`:
   ```html
   <img src="assets/media/vortex-street.gif" alt="Vortex shedding simulation" loading="lazy">
   ```

---

## 5. Updating Your CV PDF

1. Replace `cv.pdf` in the root folder (or `assets/media/Rahul_CV.pdf`).
2. The download button on `cv.html` will immediately download your latest PDF.

---

## 6. Adding New Publications & BibTeX

1. Open `publications.html` and duplicate a `<article class="pub-item">` block.
2. In `assets/js/main.js`, add your new citation key to `BIBTEX_DATABASE`:
   ```javascript
   'your-citation-key': `@article{rahul2026new,
     title = {Your Article Title},
     author = {Rahul and Others},
     journal = {Your Journal},
     year = {2026}
   }`
   ```
3. On the button in `publications.html`, specify `data-bibtex-id="your-citation-key"`. The modal will automatically display and copy it when clicked!
