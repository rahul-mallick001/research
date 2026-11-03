/**
 * Main Client Script - Rahul's Research Portfolio (IIT Kharagpur)
 * Modern Web Guidance Compliant (Accessible Dialogs, Theme Sync, Fast DOM)
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initDialogLightDismissFallback();
  initBibtexModals();
  initProjectFilters();
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
      // Reverting to system default: remove stored item
      try {
        localStorage.removeItem('color-scheme');
      } catch (e) {}
      metaColorScheme.content = 'light dark';
    } else {
      // Divergent override: store literally
      try {
        localStorage.setItem('color-scheme', target);
      } catch (e) {}
      metaColorScheme.content = target;
    }
  });

  // Sync across tabs
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
  // If the browser doesn't natively support closedby="any", enforce light-dismiss
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
   3. BibTeX Modal & Copy to Clipboard
   ========================================================================== */
const BIBTEX_DATABASE = {
  'rahul-pof-2025': `@article{mallick2025electrokinetics,
  title = {Nonlinear electroosmotic flow and ion transport in charge-regulated nanochannels},
  author = {Mallick, Rahul and Mukhopadhyay, S. and Chakraborty, S.},
  journal = {Physics of Fluids},
  volume = {37},
  number = {4},
  pages = {042008},
  year = {2025},
  publisher = {AIP Publishing},
  doi = {10.1063/5.0210452}
}`,
  'rahul-jfm-2024': `@article{mallick2024taylor,
  title = {Electrohydrodynamic deformation and tip-streaming of leaky dielectric droplets: A boundary element formulation},
  author = {Mallick, Rahul and Bandopadhyay, D. and Mitra, S.},
  journal = {Journal of Fluid Mechanics},
  volume = {988},
  pages = {A34},
  year = {2024},
  publisher = {Cambridge University Press},
  doi = {10.1017/jfm.2024.312}
}`,
  'rahul-pre-2024': `@article{mallick2024lbm,
  title = {Lattice Boltzmann modeling of coupled electro-hydrodynamic multiphase flows with high density ratios},
  author = {Mallick, Rahul and Roy, P. and Chakraborty, S.},
  journal = {Physical Review E},
  volume = {109},
  number = {3},
  pages = {035304},
  year = {2024},
  publisher = {American Physical Society},
  doi = {10.1103/PhysRevE.109.035304}
}`,
  'rahul-compfluid-2023': `@article{mallick2023bem,
  title = {High-order boundary element schemes for singular Stokes kernels in electrokinetic droplet interactions},
  author = {Mallick, Rahul and Sengupta, K.},
  journal = {Computers & Fluids},
  volume = {261},
  pages = {105912},
  year = {2023},
  publisher = {Elsevier},
  doi = {10.1016/j.compfluid.2023.105912}
}`
};

function initBibtexModals() {
  const bibtexDialog = document.getElementById('bibtex-dialog');
  const bibtexCodeEl = document.getElementById('bibtex-content');
  const copyBtn = document.getElementById('copy-bibtex-btn');
  if (!bibtexDialog || !bibtexCodeEl) return;

  // Open modal on click
  document.querySelectorAll('[data-bibtex-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-bibtex-id');
      const bibText = BIBTEX_DATABASE[id] || `@article{rahul_research,\n  author = {Rahul},\n  year = {2025}\n}`;
      bibtexCodeEl.textContent = bibText;
      bibtexDialog.showModal();
    });
  });

  // Copy button
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(bibtexCodeEl.textContent);
        showToast('BibTeX citation copied to clipboard!');
        bibtexDialog.close();
      } catch (err) {
        // Fallback for older browsers
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
   5. Mobile Navigation
   ========================================================================== */
function initMobileNav() {
  const toggle = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (!toggle || !navLinks) return;

  toggle.addEventListener('click', () => {
    navLinks.classList.toggle('mobile-open');
  });

  // Close when clicking nav link
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
