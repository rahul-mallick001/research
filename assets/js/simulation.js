/**
 * Advanced Physics & Computational Fluid Dynamics (CFD) Canvas Simulator
 * Designed for Rahul's Research Portfolio (IIT Kharagpur)
 * Modes:
 *   1. Electrokinetic Microchannel Flow (EOF / EDL)
 *   2. Taylor-Melcher Electrohydrodynamic (EHD) Droplet
 *   3. Lattice Boltzmann Method (LBM) Vortex Shedding
 */

class PhysicsLabSimulator {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    // Display scaling for Retina / HiDPI
    this.dpr = window.devicePixelRatio || 1;
    this.mode = 'electrokinetics'; // 'electrokinetics' | 'ehd' | 'lbm'
    this.isRunning = true;
    this.animationFrameId = null;

    // Simulation Parameters
    this.params = {
      electricField: 1.5,      // kV/cm
      zetaPotential: -50,       // mV
      particleCount: 160,
      viscosity: 1.0,
      ehdRatio: 2.2,           // R/S ratio (Taylor-Melcher)
      reynolds: 120,           // LBM Reynolds number
      showStreamlines: true,
      showVectors: true,
      showParticles: true
    };

    // Particles array
    this.particles = [];
    this.obstacle = { x: 0, y: 0, r: 24, dragging: false };
    this.time = 0;

    this.initCanvasSize();
    this.initParticles();
    this.initEvents();
    this.start();
  }

  initCanvasSize() {
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width || 760;
    this.height = Math.min(420, Math.max(300, rect.width * 0.48));
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);

    this.obstacle.x = this.width * 0.32;
    this.obstacle.y = this.height * 0.5;
  }

  initParticles() {
    this.particles = [];
    for (let i = 0; i < this.params.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * (this.height - 40) + 20,
        vx: 0,
        vy: 0,
        radius: Math.random() * 2.2 + 1.2,
        charge: Math.random() > 0.4 ? 1 : -1,
        life: Math.random() * 100,
        color: null
      });
    }
  }

  initEvents() {
    window.addEventListener('resize', () => {
      this.initCanvasSize();
      this.initParticles();
    });

    // Pointer events on canvas
    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left),
        y: (e.clientY - rect.top)
      };
    };

    this.canvas.addEventListener('mousedown', (e) => {
      const pos = getPos(e);
      const dist = Math.hypot(pos.x - this.obstacle.x, pos.y - this.obstacle.y);
      if (dist < this.obstacle.r + 15) {
        this.obstacle.dragging = true;
      } else {
        // Inject ions / particles at click
        for (let i = 0; i < 15; i++) {
          this.particles.push({
            x: pos.x + (Math.random() - 0.5) * 20,
            y: pos.y + (Math.random() - 0.5) * 20,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            radius: 2.5,
            charge: i % 2 === 0 ? 1 : -1,
            life: 120,
            color: '#f59e0b'
          });
        }
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (this.obstacle.dragging) {
        const pos = getPos(e);
        this.obstacle.x = Math.max(60, Math.min(this.width - 60, pos.x));
        this.obstacle.y = Math.max(50, Math.min(this.height - 50, pos.y));
      }
    });

    window.addEventListener('mouseup', () => {
      this.obstacle.dragging = false;
    });
  }

  setMode(mode) {
    this.mode = mode;
    this.time = 0;
    this.initParticles();
  }

  updateParam(key, value) {
    this.params[key] = parseFloat(value);
    if (key === 'particleCount') {
      this.initParticles();
    }
  }

  start() {
    if (!this.isRunning) return;
    const loop = () => {
      this.update();
      this.draw();
      this.time += 0.025;
      this.animationFrameId = requestAnimationFrame(loop);
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  pause() {
    this.isRunning = false;
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
  }

  resume() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.start();
    }
  }

  togglePlay() {
    if (this.isRunning) this.pause();
    else this.resume();
    return this.isRunning;
  }

  reset() {
    this.time = 0;
    this.obstacle.x = this.width * 0.32;
    this.obstacle.y = this.height * 0.5;
    this.initParticles();
  }

  captureFrame() {
    const link = document.createElement('a');
    link.download = `rahul-cfd-${this.mode}-simulation.png`;
    link.href = this.canvas.toDataURL('image/png');
    link.click();
  }

  update() {
    const { electricField, zetaPotential, viscosity, ehdRatio } = this.params;
    const w = this.width;
    const h = this.height;
    const wallTop = 35;
    const wallBottom = h - 35;
    const channelH = wallBottom - wallTop;

    for (let p of this.particles) {
      if (this.mode === 'electrokinetics') {
        // Electroosmotic plug flow + Debye-layer shear
        // Helmholtz-Smoluchowski slip velocity: u = -(eps * zeta / mu) * E
        const distFromWall = Math.min(p.y - wallTop, wallBottom - p.y);
        const debyeLen = 14;
        
        // Potential decay: psi(y) = zeta * exp(-y/lambda)
        const edlFactor = 1 - Math.exp(-Math.max(0, distFromWall) / debyeLen);
        const uEof = 2.4 * electricField * (Math.abs(zetaPotential) / 50) * edlFactor;

        // Electrophoretic drift component for charged particle: v_ep = mu_ep * E
        const uEp = p.charge * 0.8 * electricField;

        p.vx = (uEof + uEp) / viscosity;
        p.vy = (Math.random() - 0.5) * 0.4; // Brownian motion / diffusion

        p.x += p.vx;
        p.y += p.vy;

        // Boundary bounce & recycle
        if (p.x > w + 10) {
          p.x = -10;
          p.y = wallTop + 5 + Math.random() * (channelH - 10);
        }
        if (p.y <= wallTop + 3) p.y = wallTop + 4;
        if (p.y >= wallBottom - 3) p.y = wallBottom - 4;

      } else if (this.mode === 'ehd') {
        // Taylor-Melcher Leaky Dielectric Droplet Quadrupolar Vortex Flow
        const cx = w * 0.5;
        const cy = h * 0.5;
        const a = 85 * (1 + 0.15 * (ehdRatio - 1) * (electricField / 2));
        const b = 85 / (1 + 0.15 * (ehdRatio - 1) * (electricField / 2));

        // Quadrupolar streamfunction: psi ~ r^2 * sin(2*theta)
        const dx = p.x - cx;
        const dy = p.y - cy;
        const r = Math.hypot(dx, dy);
        const theta = Math.atan2(dy, dx);

        const circulationStrength = 1.6 * (ehdRatio > 1 ? 1 : -1) * electricField;
        const inside = (Math.pow(dx / a, 2) + Math.pow(dy / b, 2)) < 1.0;

        let vr = 0;
        let vtheta = 0;

        if (inside) {
          // Inside vortex circulation
          vr = circulationStrength * (r / 60) * Math.sin(2 * theta);
          vtheta = circulationStrength * (r / 60) * Math.cos(2 * theta);
        } else {
          // Outside flow decay ~ (R/r)^3
          const decay = Math.pow(70 / Math.max(r, 60), 2.5);
          vr = -circulationStrength * decay * Math.sin(2 * theta);
          vtheta = -circulationStrength * decay * Math.cos(2 * theta);
        }

        p.vx = vr * Math.cos(theta) - vtheta * Math.sin(theta);
        p.vy = vr * Math.sin(theta) + vtheta * Math.cos(theta);

        p.x += p.vx;
        p.y += p.vy;

        // Keep inside active region
        if (p.x < 10 || p.x > w - 10 || p.y < 10 || p.y > h - 10) {
          p.x = cx + (Math.random() - 0.5) * a * 1.8;
          p.y = cy + (Math.random() - 0.5) * b * 1.8;
        }

      } else if (this.mode === 'lbm') {
        // Lattice Boltzmann / Vortex Street past obstacle
        const ox = this.obstacle.x;
        const oy = this.obstacle.y;
        const or = this.obstacle.r;

        const baseU = 2.8 * (this.params.reynolds / 100);
        const dx = p.x - ox;
        const dy = p.y - oy;
        const dist = Math.hypot(dx, dy);

        if (dist < or + 4) {
          // Deflect around cylinder
          const angle = Math.atan2(dy, dx);
          p.x = ox + (or + 5) * Math.cos(angle);
          p.y = oy + (or + 5) * Math.sin(angle);
        }

        // Downstream Karman vortices
        let vortexVy = 0;
        if (p.x > ox) {
          const wakeDist = (p.x - ox) / 45;
          const wakeWidth = 25 + wakeDist * 8;
          if (Math.abs(dy) < wakeWidth) {
            const freq = 0.08 * (this.params.reynolds / 80);
            vortexVy = Math.sin(p.x * 0.04 - this.time * 2.5) * 1.8 * Math.exp(-wakeDist * 0.08);
          }
        }

        // Potential flow deflection upstream
        let deflY = 0;
        if (dist > or && dist < or * 4) {
          deflY = -(oy - p.y) / dist * (or * or) / (dist * dist) * 1.2;
        }

        p.vx = baseU * (1 - (dist < or * 2 ? (or / dist) * 0.4 : 0));
        p.vy = vortexVy + deflY;

        p.x += p.vx;
        p.y += p.vy;

        if (p.x > w + 10) {
          p.x = -10;
          p.y = Math.random() * h;
        }
        if (p.y < 10) p.y = 12;
        if (p.y > h - 10) p.y = h - 12;
      }
    }
  }

  draw() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Detect dark or light mode
    const isDark = document.querySelector('meta[name="color-scheme"]')?.content?.includes('dark') ||
                   window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Clear background
    ctx.fillStyle = isDark ? '#0b1120' : '#f8fafc';
    ctx.fillRect(0, 0, w, h);

    if (this.mode === 'electrokinetics') {
      this.drawElectrokinetics(ctx, w, h, isDark);
    } else if (this.mode === 'ehd') {
      this.drawEHD(ctx, w, h, isDark);
    } else if (this.mode === 'lbm') {
      this.drawLBM(ctx, w, h, isDark);
    }

    // Draw Particles
    if (this.params.showParticles) {
      for (let p of this.particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        if (p.color) {
          ctx.fillStyle = p.color;
        } else if (this.mode === 'electrokinetics') {
          ctx.fillStyle = p.charge > 0 ? '#10b981' : '#f43f5e';
        } else if (this.mode === 'ehd') {
          ctx.fillStyle = isDark ? '#38bdf8' : '#0284c7';
        } else {
          ctx.fillStyle = isDark ? '#6ee7b7' : '#059669';
        }
        ctx.fill();
      }
    }

    // Top overlay badge
    ctx.fillStyle = isDark ? 'rgba(15, 23, 42, 0.75)' : 'rgba(255, 255, 255, 0.85)';
    ctx.fillRect(12, 10, 240, 26);
    ctx.strokeStyle = isDark ? '#334155' : '#cbd5e1';
    ctx.strokeRect(12, 10, 240, 26);
    ctx.fillStyle = isDark ? '#38bdf8' : '#0369a1';
    ctx.font = '600 11px system-ui, sans-serif';
    ctx.fillText(`Active Mode: ${this.mode.toUpperCase()} CFD Engine`, 20, 27);
  }

  drawElectrokinetics(ctx, w, h, isDark) {
    const wallTop = 35;
    const wallBottom = h - 35;

    // Walls
    ctx.fillStyle = isDark ? '#1e293b' : '#e2e8f0';
    ctx.fillRect(0, 0, w, wallTop);
    ctx.fillRect(0, 0, w, 2);
    ctx.fillRect(0, wallBottom, w, h - wallBottom);

    // Wall charge symbols
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 13px sans-serif';
    for (let x = 40; x < w; x += 60) {
      ctx.fillText('−', x, wallTop - 8);
      ctx.fillText('−', x, wallBottom + 18);
    }

    // Debye layer highlight zones
    ctx.fillStyle = isDark ? 'rgba(56, 189, 248, 0.08)' : 'rgba(2, 132, 199, 0.08)';
    ctx.fillRect(0, wallTop, w, 20);
    ctx.fillRect(0, wallBottom - 20, w, 20);

    // Streamline velocity guide
    if (this.params.showStreamlines) {
      ctx.strokeStyle = isDark ? 'rgba(56, 189, 248, 0.2)' : 'rgba(2, 132, 199, 0.2)';
      ctx.lineWidth = 1;
      for (let y = wallTop + 15; y < wallBottom; y += 25) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
    }

    // Plug flow profile curve on right
    const px = w - 100;
    ctx.strokeStyle = isDark ? '#38bdf8' : '#0284c7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px, wallTop);
    ctx.quadraticCurveTo(px + 45, wallTop + 15, px + 45, wallTop + 35);
    ctx.lineTo(px + 45, wallBottom - 35);
    ctx.quadraticCurveTo(px + 45, wallBottom - 15, px, wallBottom);
    ctx.stroke();

    ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
    ctx.font = '10px monospace';
    ctx.fillText('Plug Velocity EOF', px - 15, wallBottom - 10);
  }

  drawEHD(ctx, w, h, isDark) {
    const cx = w * 0.5;
    const cy = h * 0.5;
    const a = 90 * (1 + 0.15 * (this.params.ehdRatio - 1));
    const b = 90 / (1 + 0.15 * (this.params.ehdRatio - 1));

    // Electric field lines
    ctx.strokeStyle = isDark ? 'rgba(245, 158, 11, 0.25)' : 'rgba(217, 119, 6, 0.25)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 4]);
    for (let y = 40; y < h; y += 45) {
      ctx.beginPath();
      ctx.moveTo(20, y);
      ctx.lineTo(w - 20, y);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Droplet interior
    ctx.fillStyle = isDark ? 'rgba(14, 165, 233, 0.18)' : 'rgba(14, 165, 233, 0.12)';
    ctx.strokeStyle = isDark ? '#38bdf8' : '#0284c7';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(cx, cy, a, b, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Quadrupolar circulation streamline hints
    if (this.params.showStreamlines) {
      ctx.strokeStyle = isDark ? 'rgba(129, 140, 248, 0.4)' : 'rgba(99, 102, 241, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx + a * 0.45, cy - b * 0.35, 22, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx - a * 0.45, cy - b * 0.35, 22, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx - a * 0.45, cy + b * 0.35, 22, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + a * 0.45, cy + b * 0.35, 22, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Induced pole charges
    ctx.font = 'bold 16px sans-serif';
    ctx.fillStyle = '#ef4444';
    ctx.fillText('+', cx + a - 12, cy + 5);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('−', cx - a + 5, cy + 5);

    ctx.fillStyle = isDark ? '#e2e8f0' : '#1e293b';
    ctx.font = '11px system-ui, sans-serif';
    ctx.fillText(`Taylor-Melcher Ratio R/S: ${this.params.ehdRatio.toFixed(1)} (${this.params.ehdRatio > 1 ? 'Prolate' : 'Oblate'})`, cx - 90, cy + b + 28);
  }

  drawLBM(ctx, w, h, isDark) {
    const ox = this.obstacle.x;
    const oy = this.obstacle.y;
    const or = this.obstacle.r;

    // Obstacle (draggable)
    ctx.beginPath();
    ctx.arc(ox, oy, or, 0, Math.PI * 2);
    ctx.fillStyle = isDark ? '#334155' : '#94a3b8';
    ctx.fill();
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Center drag icon
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px system-ui, sans-serif';
    ctx.fillText('DRAG', ox - 13, oy + 4);

    // Streamline wake
    if (this.params.showStreamlines) {
      ctx.strokeStyle = isDark ? 'rgba(52, 211, 153, 0.22)' : 'rgba(16, 185, 129, 0.22)';
      ctx.lineWidth = 1.2;
      for (let y = 30; y < h; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x < w; x += 20) {
          const dy = y - oy;
          let wave = 0;
          if (x > ox) {
            wave = Math.sin(x * 0.04 - this.time * 2.5) * 12 * Math.exp(-(x - ox) / 300) * (Math.abs(dy) < 50 ? 1 : 0);
          }
          ctx.lineTo(x, y + wave);
        }
        ctx.stroke();
      }
    }
  }
}

// Global initialization helper
window.PhysicsLabSimulator = PhysicsLabSimulator;
