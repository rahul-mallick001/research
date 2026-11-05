#!/usr/bin/env python3
"""
Automated Content-Driven Site Generator for Rahul Mallick's Portfolio
Builds static HTML files from the content/ tree:
- content/research/      -> research/index.html & homepage research grid
- content/simulations/   -> simulation/index.html & homepage simulation grid
- content/publications/  -> publication/index.html & homepage publication section
- content/repositories/  -> repositories/index.html & homepage repositories grid

Zero external dependencies - standard library only (os, json, re, pathlib).
"""

import os
import json
import re
import html
from pathlib import Path

# Paths
ROOT_DIR = Path(__file__).resolve().parent.parent
CONTENT_DIR = ROOT_DIR / "content"
RESEARCH_DIR = CONTENT_DIR / "research"
SIM_DIR = CONTENT_DIR / "simulations"
PUBS_FILE = CONTENT_DIR / "publications" / "publications.json"
PUBS_FILE_ALT = CONTENT_DIR / "publications" / "publication.json"
REPOS_FILE = CONTENT_DIR / "repositories" / "repos.json"


def load_json(path):
    if not path.exists():
        return {}
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def load_research_areas():
    areas = []
    if not RESEARCH_DIR.exists():
        return areas

    for entry in RESEARCH_DIR.iterdir():
        if entry.is_dir():
            info_file = entry / "info.json"
            if info_file.exists():
                data = load_json(info_file)
                data["_folder"] = entry.name
                areas.append(data)

    areas.sort(key=lambda x: x.get("order", 999))
    return areas


def load_simulations():
    sims = []
    if not SIM_DIR.exists():
        return sims

    for root, _, files in os.walk(SIM_DIR):
        if "sim.json" in files:
            sim_path = Path(root) / "sim.json"
            data = load_json(sim_path)
            data["_path"] = str(Path(root).relative_to(CONTENT_DIR))
            sims.append(data)

    sims.sort(key=lambda x: x.get("order", 999))
    return sims


def load_publications():
    if PUBS_FILE.exists():
        return load_json(PUBS_FILE)
    if PUBS_FILE_ALT.exists():
        return load_json(PUBS_FILE_ALT)
    return {}


def load_repositories():
    return load_json(REPOS_FILE)


# ==============================================================================
# HTML Generators
# ==============================================================================

def render_research_card_full(area, is_home=False):
    prefix = "" if is_home else "../"
    category_badge = area.get("category_badge", "Research")
    category_filter = area.get("category_filter", "general")
    title = area.get("title", "")
    summary = area.get("summary", "")
    equations = area.get("governing_equations", [])
    cover = area.get("cover_media", {})
    affiliation = area.get("affiliation", "Thermodynamics Lab, IIT Kharagpur")
    sim_link = area.get("simulation_link", "simulation/")
    sim_link_text = area.get("simulation_link_text", "View Simulation →")
    area_id = area.get("id", area.get("_folder", "research"))

    # Fix relative links
    if not is_home and not sim_link.startswith("http") and not sim_link.startswith("../"):
        sim_link = "../" + sim_link

    # Render media
    media_html = ""
    if cover.get("type") == "video":
        mp4 = prefix + cover.get("mp4", "")
        poster = prefix + cover.get("poster", "")
        webp = prefix + cover.get("webp", "")
        media_html = f"""<div class="project-card-media" style="height: 240px; background: #0b1120;">
          <video autoplay loop muted playsinline controls poster="{poster}" style="width: 100%; height: 100%; object-fit: contain;">
            <source src="{mp4}" type="video/mp4">
            <img src="{webp}" alt="{cover.get('alt', title)}" style="width: 100%; height: 100%; object-fit: contain;">
          </video>
          <span class="project-badge">{category_badge}</span>
        </div>"""
    else:
        src = prefix + cover.get("src", "assets/images/electrokinetics-diagram.svg")
        style = "width: 100%; height: 100%; object-fit: contain;" if "png" in src else ""
        bg_style = ' style="height: 240px; background: #0b1120;"' if "png" in src else ' style="height: 240px;"'
        img_style = f' style="{style}"' if style else ''
        media_html = f"""<div class="project-card-media"{bg_style}>
          <img src="{src}" alt="{cover.get('alt', title)}" loading="lazy"{img_style}>
          <span class="project-badge">{category_badge}</span>
        </div>"""

    # Equations block
    eq_html = ""
    if equations and not is_home:
        eq_items = "\n            ".join([f"$${eq}$$" for eq in equations])
        eq_html = f"""<div class="math-card">
            <span class="math-card-label">Governing Equations</span>
            {eq_items}
          </div>"""

    if is_home:
        tag_preview = area.get("tags", ["Theoretical Modeling"])[0] if area.get("tags") else "Research"
        return f"""        <!-- Area: {title} -->
        <article class="project-card" data-category="{category_filter}">
          {media_html}
          <div class="project-card-body">
            <h3 class="project-card-title">{title}</h3>
            <p class="project-card-desc">
              {summary}
            </p>
            <div class="project-card-footer">
              <span style="font-size: 0.8rem; font-family: var(--font-mono); color: var(--text-faint);">{tag_preview}</span>
              <a href="research/#{area_id}" class="project-action-btn">Read Details →</a>
            </div>
          </div>
        </article>"""
    else:
        return f"""      <!-- Theme: {category_badge} -->
      <article class="project-card" id="{area_id}" data-category="{category_filter}">
        {media_html}
        <div class="project-card-body">
          <h2 class="project-card-title">{title}</h2>
          <p class="project-card-desc">
            {summary}
          </p>
          {eq_html}
          <div class="project-card-footer">
            <span style="font-size: 0.82rem; color: var(--text-muted);">{affiliation}</span>
            <a href="{sim_link}" class="project-action-btn">{sim_link_text}</a>
          </div>
        </div>
      </article>"""


def render_simulation_card(sim, is_home=False):
    prefix = "" if is_home else "../"
    title = sim.get("title", "")
    description = sim.get("description", "")
    method_tag = sim.get("method_tag", "Simulation")
    subtag = sim.get("subtag", "")
    tag_label = f"{method_tag} &middot; {subtag}" if subtag else method_tag
    category_filter = sim.get("category_filter", method_tag.lower())
    sim_id = sim.get("id", "sim")
    media_type = sim.get("media_type", "video")

    border_style = f' style="border: {sim.get("border_highlight")};"' if sim.get("border_highlight") else ""

    # Home card rendering
    if is_home:
        # Simplified video or image media
        if media_type in ("video", "video_switcher"):
            def_vid = sim.get("default_video", sim.get("video", {}))
            mp4 = prefix + def_vid.get("mp4", "")
            poster = prefix + def_vid.get("poster", "")
            webp = prefix + def_vid.get("webp", "")
            media_block = f"""<div class="project-card-media" style="height: 240px; background: #0b1120;">
            <video autoplay loop muted playsinline controls poster="{poster}" style="width: 100%; height: 100%; object-fit: contain;">
              <source src="{mp4}" type="video/mp4">
              <img src="{webp}" alt="{def_vid.get('alt', title)}" style="width: 100%; height: 100%; object-fit: contain;">
            </video>
            <span class="project-badge">{tag_label}</span>
          </div>"""
        else:
            img = sim.get("image", {})
            src = prefix + img.get("src", "assets/images/lbm-lattice.svg")
            media_block = f"""<div class="project-card-media" style="height: 240px; background: #0b1120;">
            <img src="{src}" alt="{img.get('alt', title)}" loading="lazy" style="width: 100%; height: 100%; object-fit: contain;">
            <span class="project-badge">{tag_label}</span>
          </div>"""

        return f"""        <!-- Simulation Card: {title} -->
        <div class="project-card">
          {media_block}
          <div class="project-card-body">
            <h3 class="project-card-title">{title}</h3>
            <p class="project-card-desc">
              {description}
            </p>
            <div class="project-card-footer">
              <span style="font-size: 0.8rem; font-family: var(--font-mono); color: var(--text-faint);">{tag_label}</span>
              <a href="simulation/#{sim_id}" class="project-action-btn">Inspect Simulation &rarr;</a>
            </div>
          </div>
        </div>"""

    # Full Simulation Gallery Card (simulation/index.html)
    preview_block = ""
    switcher_block = ""

    if media_type == "video_switcher":
        def_vid = sim.get("default_video", {})
        mp4 = prefix + def_vid.get("mp4", "")
        poster = prefix + def_vid.get("poster", "")
        webp = prefix + def_vid.get("webp", "")
        player_id = f"{sim_id}-player"

        preview_block = f"""<div class="media-preview-container" style="height: 290px;">
          <video id="{player_id}" autoplay loop muted playsinline controls poster="{poster}" style="width: 100%; height: 100%; object-fit: contain; background: #0b1120;">
            <source src="{mp4}" type="video/mp4">
            <img src="{webp}" alt="{def_vid.get('alt', title)}" style="width: 100%; height: 100%; object-fit: contain;">
          </video>
          <span class="media-tag-indicator">{tag_label}</span>
        </div>"""

        # Switch buttons
        switch_btns = []
        for idx, opt in enumerate(sim.get("switch_options", [])):
            active_cls = " active" if idx == 0 else ""
            opt_mp4 = prefix + opt.get("mp4", "")
            opt_poster = prefix + opt.get("poster", "")
            switch_btns.append(f"""              <button type="button" class="media-switch-btn{active_cls}" data-video-target="{player_id}" data-video-src="{opt_mp4}" data-video-poster="{opt_poster}">
                {opt.get("label", "Video")}
              </button>""")

        snap_btn = ""
        lb_snap = sim.get("lightbox_snapshot")
        if lb_snap:
            snap_src = prefix + lb_snap.get("src", "")
            snap_title = lb_snap.get("title", "")
            snap_desc = lb_snap.get("description", "")
            snap_btn = f"""            <!-- Lightbox Snapshot Button -->
            <button type="button" class="lightbox-open-btn" data-lightbox-src="{snap_src}" data-lightbox-title="{snap_title}" data-lightbox-desc="{snap_desc}">
              <svg style="width: 14px; height: 14px; fill: currentColor;" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
              {lb_snap.get("button_label", "Snapshots")}
            </button>"""

        switcher_block = f"""          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.5rem;">
            <div class="media-switch-group">
{chr(10).join(switch_btns)}
            </div>
{snap_btn}
          </div>"""

    elif media_type == "image_lightbox":
        img = sim.get("image", {})
        src = prefix + img.get("src", "")
        lb_title = img.get("lightbox_title", title)
        lb_desc = img.get("lightbox_desc", description)

        preview_block = f"""<div class="media-preview-container" style="height: 290px; cursor: pointer;" data-lightbox-src="{src}" data-lightbox-title="{lb_title}" data-lightbox-desc="{lb_desc}">
          <img src="{src}" alt="{img.get('alt', title)}" loading="lazy" style="width: 100%; height: 100%; object-fit: contain;">
          <span class="media-tag-indicator">{tag_label}</span>
          <div class="preview-zoom-badge" title="Click to enlarge">
            <svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
            Click to Enlarge
          </div>
        </div>"""

    elif media_type == "video":
        vid = sim.get("video", {})
        mp4 = prefix + vid.get("mp4", "")
        poster = prefix + vid.get("poster", "")
        webp = prefix + vid.get("webp", "")

        preview_block = f"""<div class="media-preview-container" style="height: 290px;">
          <video autoplay loop muted playsinline controls poster="{poster}" style="width: 100%; height: 100%; object-fit: contain; background: #0b1120;">
            <source src="{mp4}" type="video/mp4">
            <img src="{webp}" alt="{vid.get('alt', title)}" style="width: 100%; height: 100%; object-fit: contain;">
          </video>
          <span class="media-tag-indicator">{tag_label}</span>
        </div>"""

    else:  # Image static
        img = sim.get("image", {})
        src = prefix + img.get("src", "")
        img_style = img.get("style", "width: 100%; height: 100%; object-fit: contain;")
        preview_block = f"""<div class="media-preview-container" style="height: 290px; background: rgba(14, 165, 233, 0.04);">
          <img src="{src}" alt="{img.get('alt', title)}" loading="lazy" style="{img_style}">
          <span class="media-tag-indicator">{tag_label}</span>
        </div>"""

    # Action buttons
    action_btns = []
    for act in sim.get("actions", []):
        act_type = act.get("type", "link")
        if act_type == "lightbox":
            src = prefix + act.get("src", "")
            action_btns.append(f"""            <button type="button" class="pub-btn lightbox-open-btn" data-lightbox-src="{src}" data-lightbox-title="{act.get('title', '')}" data-lightbox-desc="{act.get('description', '')}" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;">
              {act.get('label', 'Inspect Snapshot')}
            </button>""")
        else:
            url = act.get("url", "#")
            if not url.startswith("http") and not url.startswith("../"):
                url = prefix + url
            action_btns.append(f"""            <a href="{url}" class="pub-btn" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;">
              {act.get('label', 'View Method')}
            </a>""")

    actions_html = ""
    if action_btns:
        actions_html = f"""          <div style="margin-top: 0.85rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
{chr(10).join(action_btns)}
          </div>"""

    return f"""      <!-- Simulation: {title} -->
      <article class="media-item" id="{sim_id}" data-sim-cat="{category_filter}"{border_style}>
        {preview_block}

        <div class="media-caption-box">
{switcher_block}
          <h3 class="media-title">{title}</h3>
          <p class="media-desc">
            {description}
          </p>
{actions_html}
        </div>
      </article>"""


def render_publications_section(pubs_data, is_home=False):
    prefix = "" if is_home else "../"
    has_published = pubs_data.get("has_published_papers", False)
    papers = pubs_data.get("papers", [])

    if not has_published or len(papers) == 0:
        card = pubs_data.get("in_preparation_card", {})
        title = card.get("title", "Manuscripts in Preparation & Under Review")
        desc = card.get("description", "Computational research on Boundary Element Method (BEM) droplet electrohydrodynamics is currently being prepared for peer-reviewed publication.")
        
        links_html = []
        for l in card.get("links", []):
            url = prefix + l.get("url", "")
            links_html.append(f"""          <a href="{url}" class="{l.get('class', 'primary-btn')}">
            {l.get('label', 'View')}
          </a>""")

        return f"""      <div class="empty-state-card" style="background: var(--bg-surface); border: 1px dashed var(--border-color); border-radius: var(--radius-lg); padding: {'2.5rem 2rem' if is_home else '3rem 2rem'}; text-align: center; margin-top: 1rem;">
        <div style="width: 52px; height: 52px; border-radius: 50%; background: rgba(14, 165, 233, 0.1); color: var(--accent-primary); display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem;">
          <svg style="width: 26px; height: 26px; fill: currentColor;" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
        </div>
        <h3 style="font-family: var(--font-serif); font-size: 1.2rem; font-weight: 600; color: var(--text-main); margin-bottom: 0.5rem;">
          {title}
        </h3>
        <p style="font-size: 0.92rem; color: var(--text-muted); max-width: 580px; margin: 0 auto 1.5rem; line-height: 1.6;">
          {desc}
        </p>
        <div style="display: flex; justify-content: center; gap: 0.75rem; flex-wrap: wrap;">
{chr(10).join(links_html)}
        </div>
      </div>"""

    # If there are published papers or under-review manuscripts:
    paper_articles = []
    for p in papers:
        doi_link = f"""<a href="{p.get('doi_url', '#')}" target="_blank" rel="noopener noreferrer" class="pub-btn">DOI: {p.get('doi', '')}</a>""" if p.get('doi') else ""
        bibtex_escaped = html.escape(p.get('bibtex', ''), quote=True)
        bib_btn = f"""<button type="button" class="pub-btn" data-bibtex-id="{p.get('id', '')}" data-bibtex="{bibtex_escaped}">BibTeX</button>""" if p.get('bibtex') else ""
        pdf_link = f"""<a href="{prefix + p['pdf']}" class="pub-btn" download>PDF</a>""" if p.get('pdf') else ""
        sim_link = f"""<a href="{prefix + p['simulation_url']}" class="pub-btn">Simulation &rarr;</a>""" if p.get('simulation_url') else ""
        
        paper_articles.append(f"""        <article class="pub-item">
          <div class="pub-header">
            <span class="pub-type-badge">{p.get('type', 'Journal Article')}</span>
            <span class="pub-year">{p.get('year', 2026)}</span>
          </div>
          <h3 class="pub-title">{p.get('title', '')}</h3>
          <p class="pub-authors">{p.get('authors_html', '<strong>Rahul Mallick</strong> and Aditya Bandopadhyay')}</p>
          <p class="pub-journal">{p.get('journal', '')}</p>
          <div class="pub-actions">
            {doi_link}
            {bib_btn}
            {pdf_link}
            {sim_link}
          </div>
        </article>""")

    return f"""      <div class="publications-list">
{chr(10).join(paper_articles)}
      </div>"""


def render_repository_cards(repos_data, is_home=False):
    prefix = "" if is_home else "../"
    repos = repos_data.get("repositories", [])
    cards = []

    for r in repos:
        name = r.get("name", "repo")
        desc = r.get("description", "")
        lang = r.get("language", "Python / C++")
        url = r.get("html_url", f"https://github.com/rahul-mallick001/{name}")
        topics = r.get("topics", [])

        topics_html = "".join([f"""<span style="font-family: var(--font-mono); font-size: 0.72rem; background: var(--bg-subtle); padding: 0.2rem 0.55rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); color: var(--text-muted);">{t}</span>""" for t in topics])

        badge_html = """<span class="pub-type-badge" style="font-size: 0.72rem; padding: 0.2rem 0.5rem;">Pinned</span>""" if r.get("is_pinned") else ""

        cards.append(f"""      <article class="project-card" style="padding: 1.5rem; display: flex; flex-direction: column; justify-content: space-between; border-radius: var(--radius-lg); background: var(--bg-surface); border: 1px solid var(--border-color);">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.75rem; margin-bottom: 0.75rem;">
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <svg style="width: 20px; height: 20px; fill: var(--text-muted); shrink: 0;" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
              <h2 style="font-family: var(--font-mono); font-size: 1.1rem; font-weight: 600; margin: 0;">
                <a href="{url}" target="_blank" rel="noopener noreferrer" style="color: var(--accent-primary); text-decoration: none;">{name}</a>
              </h2>
            </div>
            {badge_html}
          </div>

          <p style="font-size: 0.92rem; color: var(--text-muted); line-height: 1.6; margin-bottom: 1.25rem;">
            {desc}
          </p>

          <div style="display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 1.25rem;">
            {topics_html}
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 0.85rem; font-size: 0.82rem; color: var(--text-muted);">
          <div style="display: flex; align-items: center; gap: 1rem;">
            <span style="display: flex; align-items: center; gap: 0.35rem;">
              <span style="width: 9px; height: 9px; border-radius: 50%; background: #38bdf8; display: inline-block;"></span>
              {lang}
            </span>
          </div>
          <a href="{url}" target="_blank" rel="noopener noreferrer" class="project-action-btn" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;">
            View on GitHub &rarr;
          </a>
        </div>
      </article>""")

    return chr(10).join(cards)


# ==============================================================================
# In-Place Injector Functions
# ==============================================================================

def replace_between_markers(text, start_marker, end_marker, replacement):
    pattern = re.compile(f"({re.escape(start_marker)}).*?({re.escape(end_marker)})", re.DOTALL)
    if pattern.search(text):
        return pattern.sub(lambda m: f"{m.group(1)}\n{replacement}\n    {m.group(2)}", text)
    return text


def update_navigation_bar(text, active_tab="home", is_home=False):
    prefix = "" if is_home else "../"
    
    tabs = [
        ("home", "Home", f"{prefix}"),
        ("research", "Research Area", f"{prefix}research/"),
        ("simulation", "Simulation", f"{prefix}simulation/"),
        ("publication", "Publication", f"{prefix}publication/"),
        ("repositories", "Repositories", f"{prefix}repositories/"),
        ("cv", "CV", f"{prefix}cv/"),
    ]

    # Handle both <ul class="nav-links"> and <nav class="nav-links">
    if '<ul class="nav-links">' in text:
        nav_items = []
        for tab_id, label, url in tabs:
            cls = ' class="nav-link active"' if tab_id == active_tab else ' class="nav-link"'
            # Fix root path
            target_url = "./" if (is_home and tab_id == "home") else url
            nav_items.append(f'          <li><a href="{target_url}"{cls}>{label}</a></li>')
        nav_html = '<ul class="nav-links">\n' + "\n".join(nav_items) + '\n        </ul>'
        text = re.sub(r'<ul class="nav-links">.*?</ul>', nav_html, text, flags=re.DOTALL)
    elif '<nav class="nav-links"' in text:
        nav_items = []
        for tab_id, label, url in tabs:
            cls = ' class="nav-link active"' if tab_id == active_tab else ' class="nav-link"'
            nav_items.append(f'        <a href="{url}"{cls}>{label}</a>')
        nav_html = '<nav class="nav-links" aria-label="Main Navigation">\n' + "\n".join(nav_items) + '\n      </nav>'
        text = re.sub(r'<nav class="nav-links"[^>]*>.*?</nav>', nav_html, text, flags=re.DOTALL)

    # Footer navigation
    if '<nav class="footer-nav">' in text:
        f_items = []
        for tab_id, label, url in tabs:
            target_url = "./" if (is_home and tab_id == "home") else url
            f_items.append(f'        <a href="{target_url}">{label}</a>')
        footer_nav_html = '<nav class="footer-nav">\n' + "\n".join(f_items) + '\n      </nav>'
        text = re.sub(r'<nav class="footer-nav">.*?</nav>', footer_nav_html, text, flags=re.DOTALL)

    return text


# ==============================================================================
# Build Pipeline Execution
# ==============================================================================

def build():
    print("=" * 60)
    print(">> Running Content-Driven Static Generator")
    print("=" * 60)

    # 1. Load Data
    research_areas = load_research_areas()
    simulations = load_simulations()
    publications = load_publications()
    repositories = load_repositories()

    print(f" Loaded {len(research_areas)} research areas from content/research/")
    print(f" Loaded {len(simulations)} simulations from content/simulations/")
    print(f" Loaded publications data (has_published: {publications.get('has_published_papers', False)})")
    print(f" Loaded {len(repositories.get('repositories', []))} repositories from content/repositories/")

    # 2. Update research/index.html
    research_html_path = ROOT_DIR / "research" / "index.html"
    if research_html_path.exists():
        with open(research_html_path, "r", encoding="utf-8") as f:
            content = f.read()

        cards_html = "\n\n".join([render_research_card_full(a, is_home=False) for a in research_areas])
        
        # Replace grid content
        grid_pattern = re.compile(r'(<div class="projects-grid">).*?(</div>\s*<!-- Computational)', re.DOTALL)
        if grid_pattern.search(content):
            content = grid_pattern.sub(lambda m: f"{m.group(1)}\n\n{cards_html}\n\n    {m.group(2)}", content)

        # Update research filter bar dynamically
        r_filters = [("all", "All Areas")]
        seen_filters = set(["all"])
        for a in research_areas:
            f_cat = a.get("category_filter")
            f_label = a.get("category_badge", f_cat.title())
            if f_cat and f_cat not in seen_filters:
                r_filters.append((f_cat, f_label))
                seen_filters.add(f_cat)
        
        r_filter_btns = "\n".join([f'      <button class="filter-btn{" active" if f[0] == "all" else ""}" data-filter="{f[0]}">{f[1]}</button>' for f in r_filters])
        r_filter_bar = f'<div class="filter-bar" role="toolbar" aria-label="Filter research themes">\n{r_filter_btns}\n    </div>'
        
        filter_pattern = re.compile(r'(<div class="filter-bar"[^>]*>).*?(</div>)', re.DOTALL)
        if filter_pattern.search(content):
            content = filter_pattern.sub(lambda m: r_filter_bar, content)

        content = update_navigation_bar(content, active_tab="research", is_home=False)

        with open(research_html_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(" Updated research/index.html")

    # 3. Update simulation/index.html
    sim_html_path = ROOT_DIR / "simulation" / "index.html"
    if sim_html_path.exists():
        with open(sim_html_path, "r", encoding="utf-8") as f:
            content = f.read()

        sim_cards_html = "\n\n".join([render_simulation_card(s, is_home=False) for s in simulations])
        
        grid_pattern = re.compile(r'(<div class="media-gallery-grid">).*?(</div>\s*<!-- Lightbox Modal)', re.DOTALL)
        if grid_pattern.search(content):
            content = grid_pattern.sub(lambda m: f"{m.group(1)}\n\n{sim_cards_html}\n\n    {m.group(2)}", content)

        # Update simulation filter bar dynamically
        s_filters = [("all", "All Solvers")]
        seen_s_filters = set(["all"])
        for s in simulations:
            cat_str = s.get("category_filter", "")
            for c in cat_str.split():
                if c and c not in seen_s_filters:
                    label = "BEM" if c == "bem" else ("LBM" if c == "lbm" else ("EHD" if c == "ehd" else c.title()))
                    if c == "bem": label = "Boundary Element Method (BEM)"
                    elif c == "lbm": label = "Lattice Boltzmann Method (LBM)"
                    elif c == "ehd": label = "Electrohydrodynamics (EHD)"
                    elif c == "experiment": label = "Experiments"
                    s_filters.append((c, label))
                    seen_s_filters.add(c)
        if "experiment" not in seen_s_filters:
            s_filters.append(("experiment", "Experiments"))

        s_filter_btns = "\n".join([f'      <button class="filter-btn{" active" if f[0] == "all" else ""}" data-sim-filter="{f[0]}">{f[1]}</button>' for f in s_filters])
        s_filter_bar = f'<div class="filter-bar" role="toolbar" aria-label="Filter simulation methodologies">\n{s_filter_btns}\n    </div>'

        s_filter_pattern = re.compile(r'(<div class="filter-bar"[^>]*>).*?(</div>)', re.DOTALL)
        if s_filter_pattern.search(content):
            content = s_filter_pattern.sub(lambda m: s_filter_bar, content)

        content = update_navigation_bar(content, active_tab="simulation", is_home=False)

        with open(sim_html_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(" Updated simulation/index.html")

    # 4. Update publication/index.html
    pub_html_path = ROOT_DIR / "publication" / "index.html"
    if pub_html_path.exists():
        with open(pub_html_path, "r", encoding="utf-8") as f:
            content = f.read()

        pubs_content_html = render_publications_section(publications, is_home=False)

        section_pattern = re.compile(r'(<section class="section-wrapper" aria-labelledby="journals-heading">.*?<div class="section-title-wrap">.*?</div>).*?(</section>)', re.DOTALL)
        if section_pattern.search(content):
            content = section_pattern.sub(lambda m: f"{m.group(1)}\n\n{pubs_content_html}\n    {m.group(2)}", content)

        content = update_navigation_bar(content, active_tab="publication", is_home=False)

        with open(pub_html_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(" Updated publication/index.html")

    # 5. Update repositories/index.html
    repos_html_path = ROOT_DIR / "repositories" / "index.html"
    if repos_html_path.exists():
        with open(repos_html_path, "r", encoding="utf-8") as f:
            content = f.read()

        repos_content_html = render_repository_cards(repositories, is_home=False)
        content = replace_between_markers(content, "<!-- REPOSITORIES_GRID_START -->", "<!-- REPOSITORIES_GRID_END -->", f'<div class="projects-grid" id="repositories-container">\n{repos_content_html}\n    </div>')

        content = update_navigation_bar(content, active_tab="repositories", is_home=False)

        with open(repos_html_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(" Updated repositories/index.html")

    # 6. Update cv/index.html nav bar
    cv_html_path = ROOT_DIR / "cv" / "index.html"
    if cv_html_path.exists():
        with open(cv_html_path, "r", encoding="utf-8") as f:
            content = f.read()
        content = update_navigation_bar(content, active_tab="cv", is_home=False)
        with open(cv_html_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(" Updated cv/index.html")

    # 7. Update index.html (Home)
    index_html_path = ROOT_DIR / "index.html"
    if index_html_path.exists():
        with open(index_html_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Update Navigation
        content = update_navigation_bar(content, active_tab="home", is_home=True)

        # Update Simulations grid
        home_sim_cards = "\n\n".join([render_simulation_card(s, is_home=True) for s in simulations])
        sim_pattern = re.compile(r'(<section class="section-wrapper" aria-labelledby="sim-showcase-title">.*?<div class="projects-grid">).*?(</div>\s*</section>\s*<!-- Research Area)', re.DOTALL)
        if sim_pattern.search(content):
            content = sim_pattern.sub(lambda m: f"{m.group(1)}\n{home_sim_cards}\n      {m.group(2)}", content)

        # Update Research grid
        home_res_cards = "\n\n".join([render_research_card_full(a, is_home=True) for a in research_areas])
        res_pattern = re.compile(r'(<section class="section-wrapper" aria-labelledby="research-area-title">.*?<div class="projects-grid">).*?(</div>\s*</section>\s*<!-- Publication)', re.DOTALL)
        if res_pattern.search(content):
            content = res_pattern.sub(lambda m: f"{m.group(1)}\n{home_res_cards}\n      {m.group(2)}", content)

        # Update Publications section
        home_pub_html = render_publications_section(publications, is_home=True)
        pub_pattern = re.compile(r'(<section class="section-wrapper" aria-labelledby="publication-heading">.*?<div class="section-title-wrap">.*?</div>).*?(</section>)', re.DOTALL)
        if pub_pattern.search(content):
            content = pub_pattern.sub(lambda m: f"{m.group(1)}\n\n{home_pub_html}\n    {m.group(2)}", content)

        # Update Home Repositories
        home_repos_html = render_repository_cards(repositories, is_home=True)
        content = replace_between_markers(content, "<!-- HOME_REPOSITORIES_GRID_START -->", "<!-- HOME_REPOSITORIES_GRID_END -->", f'<div class="projects-grid" id="home-repositories-grid">\n{home_repos_html}\n      </div>')

        with open(index_html_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(" Updated index.html (Home)")

    # 8. Output site-data.json for client-side search or inspection
    data_dir = ROOT_DIR / "assets" / "data"
    data_dir.mkdir(parents=True, exist_ok=True)
    site_manifest = {
        "research": research_areas,
        "simulations": simulations,
        "publications": publications,
        "repositories": repositories
    }
    with open(data_dir / "site-data.json", "w", encoding="utf-8") as f:
        json.dump(site_manifest, f, indent=2)
    print(" Exported assets/data/site-data.json")

    print("=" * 60)
    print(">> All pages built successfully!")
    print("=" * 60)


if __name__ == "__main__":
    build()
