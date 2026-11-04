/**
 * Main Client Script - Rahul Mallick Research Portfolio (IIT Kharagpur)
 * Modern Web Guidance Compliant (Accessible Dialogs, Theme Sync, Fast DOM)
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initDialogLightDismissFallback();
  initBibtexModals();
  initProjectFilters();
  initSimFilters();
  initVideoSwitchers();
  initImageLightbox();
  initMobileNav();
  initToast();
});

/* ==========================================================================
   1. Dark Mode Toggle (MWG 'dark-mode-toggle' Specification)
   ========================================================================== */
function initThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle');
  const metaColorScheme = document.querySelector('meta[name="color-scheme"]');
  if (!toggleBtn || !metaColorScheme) return;

  const getSystemTheme = () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const getEffectiveTheme = () => {
    const content = metaColorScheme.content;
    if (content === 'dark' || content === 'light') return content;
    return getSystemTheme();
  };

  toggleBtn.addEventListener('click', () => {
    const current = getEffectiveTheme();
    const target = current === 'dark' ? 'light' : 'dark';
    const system = getSystemTheme();

    if (target === system) {
      try {
        localStorage.removeItem('color-scheme');
      } catch (e) {}
      metaColorScheme.content = 'light dark';
    } else {
      try {
        localStorage.setItem('color-scheme', target);
      } catch (e) {}
      metaColorScheme.content = target;
    }
  });

  window.addEventListener('storage', (e) => {
    if (e.key === 'color-scheme') {
      metaColorScheme.content = e.newValue || 'light dark';
    }
  });
}

/* ==========================================================================
   2. Accessible Dialog & Light-Dismiss Fallback (MWG 'light-dismiss-a-dialog')
   ========================================================================== */
function initDialogLightDismissFallback() {
  if (!('closedBy' in HTMLDialogElement.prototype)) {
    const isOutside = (e, dialog) => {
      const r = dialog.getBoundingClientRect();
      return (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      );
    };

    const dialogs = document.querySelectorAll('dialog[closedby="any"]');
    dialogs.forEach((dialog) => {
      let pressedOutside = false;
      dialog.addEventListener('pointerdown', (e) => {
        pressedOutside = isOutside(e, dialog);
      });
      dialog.addEventListener('pointerup', (e) => {
        if (pressedOutside && isOutside(e, dialog)) {
          dialog.close();
        }
      });
    });
  }
}

/* ==========================================================================
   3. BibTeX Modal & Copy to Clipboard (Mallick & Bandopadhyay Publications)
   ========================================================================== */
const BIBTEX_DATABASE = {
  'mallick-bandopadhyay-pof-2025': `@article{mallick2025electrokinetics,
  title = {Nonlinear electroosmotic flow and ion transport in charge-regulated nanochannels},
  author = {Mallick, Rahul and Bandopadhyay, Aditya},
  journal = {Physics of Fluids},
  volume = {37},
  number = {4},
  pages = {042008},
  year = {2025},
  publisher = {AIP Publishing},
  doi = {10.1063/5.0210452}
}`,
  'mallick-bandopadhyay-jfm-2024': `@article{mallick2024taylor,
  title = {Boundary element analysis of electrohydrodynamic deformation and tip-streaming of leaky dielectric droplets},
  author = {Mallick, Rahul and Bandopadhyay, Aditya},
  journal = {Journal of Fluid Mechanics},
  volume = {988},
  pages = {A34},
  year = {2024},
  publisher = {Cambridge University Press},
  doi = {10.1017/jfm.2024.312}
}`,
  'mallick-bandopadhyay-pre-2024': `@article{mallick2024lbm,
  title = {Lattice Boltzmann modeling of coupled electrohydrodynamic multiphase flows in microfluidic channels},
  author = {Mallick, Rahul and Bandopadhyay, Aditya},
  journal = {Physical Review E},
  volume = {109},
  number = {3},
  pages = {035304},
  year = {2024},
  publisher = {American Physical Society},
  doi = {10.1103/PhysRevE.109.035304}
}`,
  'mallick-bandopadhyay-aps-2024': `@inproceedings{mallick2024interfacial,
  title = {Interfacial dynamics and breakup of droplets under non-uniform electric fields},
  author = {Mallick, Rahul and Bandopadhyay, Aditya},
  booktitle = {77th Annual Meeting of the APS Division of Fluid Dynamics (DFD)},
  address = {Salt Lake City, UT, USA},
  year = {2024}
}`
};

function initBibtexModals() {
  const bibtexDialog = document.getElementById('bibtex-dialog');
  const bibtexCodeEl = document.getElementById('bibtex-content');
  const copyBtn = document.getElementById('copy-bibtex-btn');
  if (!bibtexDialog || !bibtexCodeEl) return;

  document.querySelectorAll('[data-bibtex-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-bibtex-id');
      const bibText = BIBTEX_DATABASE[id] || `@article{mallick2025,\n  author = {Mallick, Rahul and Bandopadhyay, Aditya},\n  year = {2025}\n}`;
      bibtexCodeEl.textContent = bibText;
      bibtexDialog.showModal();
    });
  });

  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(bibtexCodeEl.textContent);
        showToast('BibTeX citation copied to clipboard!');
        bibtexDialog.close();
      } catch (err) {
        const textarea = document.createElement('textarea');
        textarea.value = bibtexCodeEl.textContent;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('BibTeX citation copied to clipboard!');
        bibtexDialog.close();
      }
    });
  }
}

/* ==========================================================================
   4. Project Category Filtering
   ========================================================================== */
function initProjectFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  if (!filterBtns.length || !projectCards.length) return;

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      projectCards.forEach((card) => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   4b. Simulation Category Filtering
   ========================================================================== */
function initSimFilters() {
  const simBtns = document.querySelectorAll('[data-sim-filter]');
  const simItems = document.querySelectorAll('[data-sim-cat]');
  if (!simBtns.length || !simItems.length) return;

  simBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      simBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-sim-filter');
      simItems.forEach((item) => {
        const cat = item.getAttribute('data-sim-cat') || '';
        if (filter === 'all' || cat.split(' ').includes(filter)) {
          item.style.display = 'flex';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   4c. Video Streamline / Plot Switcher
   ========================================================================== */
function initVideoSwitchers() {
  const switchBtns = document.querySelectorAll('.media-switch-btn');
  if (!switchBtns.length) return;

  switchBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const parent = btn.closest('.media-switch-group');
      if (parent) {
        parent.querySelectorAll('.media-switch-btn').forEach((b) => b.classList.remove('active'));
      }
      btn.classList.add('active');

      const videoId = btn.getAttribute('data-video-target');
      const videoEl = document.getElementById(videoId);
      const newSrc = btn.getAttribute('data-video-src');
      const newPoster = btn.getAttribute('data-video-poster');

      if (videoEl && newSrc) {
        if (newPoster) videoEl.poster = newPoster;
        const source = videoEl.querySelector('source');
        if (source) {
          source.src = newSrc;
        }
        videoEl.src = newSrc;
        videoEl.load();
        videoEl.play().catch(() => {});
      }
    });
  });

  // Ensure all autoplay videos play cleanly
  document.querySelectorAll('video[autoplay]').forEach((v) => {
    v.muted = true;
    v.play().catch(() => {});
  });
}

/* ==========================================================================
   4d. Image & Simulation Lightbox Modal
   ========================================================================== */
function initImageLightbox() {
  const lightboxDialog = document.getElementById('image-lightbox-dialog');
  const lightboxImg = document.getElementById('lightbox-image');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxDesc = document.getElementById('lightbox-desc');
  if (!lightboxDialog || !lightboxImg) return;

  const openLightbox = (src, title, desc) => {
    lightboxImg.src = src;
    if (lightboxTitle) lightboxTitle.textContent = title || 'Simulation Result';
    if (lightboxDesc) lightboxDesc.textContent = desc || '';
    lightboxDialog.showModal();
  };

  document.querySelectorAll('[data-lightbox-src]').forEach((el) => {
    el.addEventListener('click', (e) => {
      // Don't trigger if clicked on an anchor or button inside unless it is the button itself
      if (el.tagName !== 'BUTTON' && (e.target.tagName === 'A' || (e.target.tagName === 'BUTTON' && e.target !== el))) {
        return;
      }
      const src = el.getAttribute('data-lightbox-src');
      const title = el.getAttribute('data-lightbox-title');
      const desc = el.getAttribute('data-lightbox-desc');
      if (src) openLightbox(src, title, desc);
    });
  });
}

/* ==========================================================================
   5. Mobile Navigation
   ========================================================================== */
function initMobileNav() {
  const toggle = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (!toggle || !navLinks) return;

  toggle.addEventListener('click', () => {
    navLinks.classList.toggle('mobile-open');
  });

  navLinks.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('mobile-open');
    });
  });
}

/* ==========================================================================
   6. Toast Notification Helper
   ========================================================================== */
function initToast() {
  let toast = document.getElementById('toast-notice');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-notice';
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }
}

function showToast(message) {
  const toast = document.getElementById('toast-notice');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}
window.showToast = showToast;
