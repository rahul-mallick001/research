# Content Management Guide (Folder Trees & Branches)

Welcome to your content-driven portfolio! You **never need to write HTML, CSS, or JavaScript** to update your website. Simply edit or add files in this `content/` folder, commit, and push to GitHub — GitHub Actions automatically compiles and deploys your website!

---

## 1. Research Areas (`content/research/`)

Each research area lives in its own folder:
```text
content/research/
├── 01-electrokinetics/
│   └── info.json
├── 02-boundary-element-method/
│   └── info.json
├── 03-lattice-boltzmann-method/
│   └── info.json
├── 04-electrohydrodynamics/
│   └── info.json
```

### To Add a New Research Area:
1. Create a new folder, e.g.: `content/research/05-microfluidics/`
2. Create `info.json` inside it:
```json
{
  "order": 5,
  "id": "microfluidics",
  "category_badge": "Microfluidics",
  "category_filter": "microfluidics",
  "title": "Droplet Microfluidics & Mixing",
  "summary": "Your research summary here...",
  "governing_equations": [
    "\\nabla \\cdot \\mathbf{u} = 0"
  ],
  "cover_media": {
    "type": "image",
    "src": "assets/images/your-image.png",
    "alt": "Microfluidic flow"
  },
  "tags": ["Microfluidics", "Droplets"],
  "affiliation": "Thermodynamics Lab, IIT Kharagpur",
  "simulation_link": "simulation/",
  "simulation_link_text": "View Simulation →"
}
```
3. Commit and push:
```bash
git add content/
git commit -m "Add new microfluidics research area"
git push origin main
```
Your website automatically adds the new card to both the Homepage and Research page, and adds a filter button for it!

---

## 2. Simulations (`content/simulations/`)

Organized by methodology tags (`BEM/`, `LBM/`, `Experiment/`, etc.):
```text
content/simulations/
├── BEM/
│   ├── taylor-deformation/sim.json
│   ├── nonuniform-electric-field/sim.json
│   └── liquid-bridge/sim.json
├── LBM/
│   └── multiphase-solvers/sim.json
└── Experiment/
    └── README.md
```

### To Add a New Simulation:
1. Create a folder under the method tag, e.g. `content/simulations/BEM/coalescence/` or `content/simulations/LBM/cavity-flow/`
2. Add `sim.json`:
```json
{
  "order": 5,
  "id": "bem-coalescence",
  "method_tag": "BEM",
  "subtag": "Droplet coalescence",
  "category_filter": "bem",
  "title": "Electrohydrodynamic Droplet Coalescence",
  "description": "Axisymmetric BEM simulation tracking coalescence bridge growth under high electric fields.",
  "media_type": "video",
  "video": {
    "mp4": "assets/media/BEM/your_video.mp4",
    "poster": "assets/media/BEM/your_poster.jpg",
    "webp": "assets/media/BEM/your_video.webp",
    "alt": "Coalescence dynamics"
  },
  "actions": [
    {
      "type": "link",
      "label": "Method Details",
      "url": "research/#bem"
    }
  ]
}
```
3. Push to GitHub!

---

## 3. Publications (`content/publications/`)

File: `content/publications/publications.json`

### Current Status:
`"has_published_papers": false` shows the elegant "Manuscripts in Preparation & Under Review" card.

### When a Paper is Published:
Change `"has_published_papers": true` and add your paper to the `"papers"` list:
```json
{
  "has_published_papers": true,
  "papers": [
    {
      "id": "mallick2026",
      "type": "Journal Article",
      "year": 2026,
      "title": "Title of your published paper",
      "authors_html": "<strong>Rahul Mallick</strong> and Aditya Bandopadhyay",
      "journal": "Journal of Fluid Mechanics, vol. 1000, pp. A1, 2026.",
      "doi": "10.1017/jfm.2026.xxx",
      "doi_url": "https://doi.org/10.1017/jfm.2026.xxx",
      "pdf": "cv.pdf",
      "bibtex": "@article{...}"
    }
  ]
}
```

---

## 4. GitHub Repositories (`content/repositories/`)

File: `content/repositories/repos.json`

Add or update your GitHub repositories to showcase them in the **Repositories** page:
```json
{
  "name": "your-repo-name",
  "full_name": "rahul-mallick001/your-repo-name",
  "description": "Short description of the solver or code...",
  "language": "C++ / Python",
  "topics": ["computational-fluid-dynamics", "bem", "solver"],
  "html_url": "https://github.com/rahul-mallick001/your-repo-name",
  "is_pinned": true
}
```

---

## 5. Local Preview
To test or build locally before pushing:
- Double click **`build.bat`** (Windows)
- Or run in terminal: `python scripts/build.py`
