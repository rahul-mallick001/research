# Rahul Mallick - Research Scholar Portfolio (IIT Kharagpur)

A static research website and computational portfolio configured for **GitHub Pages**.

- **Author:** Rahul Mallick, Research Scholar (Ph.D. Candidate)
- **Lab:** Thermodynamics Lab, Department of Mechanical Engineering
- **Institution:** Indian Institute of Technology (IIT) Kharagpur
- **Domain:** Electrokinetics, Boundary Element Method (BEM), Lattice Boltzmann Method (LBM), Electrohydrodynamics (EHD)
- **Primary Email:** `rahul.mallick.24@kgpian.iitkgp.ac.in`
- **Alternate Email:** `rahul.mallick0601@gmail.com`
- **LinkedIn:** [https://www.linkedin.com/in/rmallick](https://www.linkedin.com/in/rmallick)
- **Google Scholar:** [https://scholar.google.com/citations?user=rU2_iEoAAAAJ&hl=en&authuser=1](https://scholar.google.com/citations?user=rU2_iEoAAAAJ&hl=en&authuser=1)
- **GitHub:** [https://github.com/rahul-mallick001](https://github.com/rahul-mallick001)
- **ORCID:** [https://orcid.org/0009-0005-8922-563X](https://orcid.org/0009-0005-8922-563X)
- **Repository:** [https://github.com/rahul-mallick001/research](https://github.com/rahul-mallick001/research)
- **Live URL:** [https://rahul-mallick001.github.io/research/](https://rahul-mallick001.github.io/research/)

---

## 🌐 Clean URLs (Without `.html`)

The website uses directory index routing for clean, extensionless URLs:

- **Home:** `https://rahul-mallick001.github.io/research/`
- **Research Area:** `https://rahul-mallick001.github.io/research/research/`
- **Simulation:** `https://rahul-mallick001.github.io/research/simulation/`
- **Publication:** `https://rahul-mallick001.github.io/research/publication/`
- **CV:** `https://rahul-mallick001.github.io/research/cv/`
- **Contact:** `https://rahul-mallick001.github.io/research/contact/`

---

## 🚀 How to Rename Repository on GitHub to `research`

1. Open your repository settings:  
   👉 **https://github.com/rahul-mallick001/rmallick/settings**
2. In the **Repository name** field at the top, change `rmallick` to:
   ```
   research
   ```
3. Click **Rename**.
4. GitHub will automatically redirect your repository and update Pages to:  
   **https://rahul-mallick001.github.io/research/**
5. In your local terminal, update your remote URL:
   ```bash
   git remote set-url origin https://github.com/rahul-mallick001/research.git
   ```

---

## 🎬 Adding Custom Simulation Animations

To put your particular simulation videos or animated GIFs on the website:

1. Drop your `.mp4` video files or `.gif` animations into the `assets/media/` folder:
   - `assets/media/electrokinetics-simulation.mp4`
   - `assets/media/ehd-droplet-simulation.mp4`
   - `assets/media/bem-simulation.mp4`
   - `assets/media/lbm-simulation.mp4`
2. Commit and push:
   ```bash
   git add assets/media/
   git commit -m "Add simulation animations"
   git push origin main
   ```
   GitHub Actions will automatically redeploy the site with your animations live.
