# Rahul Mallick - Research Scholar Portfolio (IIT Kharagpur)

A static research website and computational portfolio configured for **GitHub Pages**.

- **Author:** Rahul Mallick, Research Scholar (Ph.D. Candidate)
- **Institution:** Indian Institute of Technology (IIT) Kharagpur
- **Domain:** Electrokinetics, Boundary Element Method (BEM), Lattice Boltzmann Method (LBM), Electrohydrodynamics (EHD)
- **Repository:** [https://github.com/rahul-mallick001/rmallick](https://github.com/rahul-mallick001/rmallick)
- **Live URL:** [https://rahul-mallick001.github.io/rmallick/](https://rahul-mallick001.github.io/rmallick/)

---

## 🚀 Pushing to your GitHub Repository

Run these commands from this directory (`d:\github`):

```bash
git init
git add .
git commit -m "Deploy Rahul Mallick academic research portfolio"
git branch -M main
git remote add origin https://github.com/rahul-mallick001/rmallick.git
git push -u origin main
```

### Enabling GitHub Pages
1. Open your repository: [https://github.com/rahul-mallick001/rmallick](https://github.com/rahul-mallick001/rmallick)
2. Go to **Settings** → **Pages** (under "Code and automation").
3. Under **Build and deployment** > **Branch**:
   - Source: **Deploy from a branch**
   - Branch: **`main`**
   - Folder: **`/ (root)`**
4. Click **Save**.
5. Your website will be live in ~60 seconds at:
   ```
   https://rahul-mallick001.github.io/rmallick/
   ```

---

## 🎨 Key Features

1. **Academic Design System**:
   - Modern typography (`Newsreader` serif for scholarly headings, `Inter` for clarity, `IBM Plex Mono` for equations/code).
   - Theme toggle supporting **System Default**, **Light**, and **Dark** modes adhering to W3C modern web guidance with zero Flash of Unstyled Content (FOUC).

2. **Live Interactive CFD Simulation Engine (`assets/js/simulation.js`)**:
   - Pure HTML5 Canvas & vanilla JavaScript engine simulating:
     - **Mode 1:** Electrokinetic Flow & Microchannel Debye layer transport (EOF).
     - **Mode 2:** Taylor-Melcher Electrohydrodynamic (EHD) Leaky Dielectric droplet with quadrupolar vortices.
     - **Mode 3:** Lattice Boltzmann Method (LBM D2Q9) vortex street past a draggable obstacle.
   - Interactive parameters: Electric field, zeta potential, tracer particle density, real-time particle injection on click, and 1-click high-res PNG frame capture.

3. **Rich Multimedia Gallery (`simulations.html`)**:
   - Video player showcase with HTML5 video player and looping flow animations.
   - Animated simulation GIFs and vector field contours.
   - High-resolution SVG schematics illustrating EDL dynamics, BEM mesh discretization, LBM velocity stencils, and EHD stress balance.

4. **1-Click BibTeX Citation Copying (`publications.html`)**:
   - Accessible native HTML5 `<dialog closedby="any">` with fallback.
   - Copy citations directly to clipboard with animated toast notification.

5. **Curriculum Vitae (`cv.html`)**:
   - Clean timeline of Education, Computational Skills, Awards, and Teaching experience at IIT Kharagpur, with a dedicated **Download CV (PDF)** button.
