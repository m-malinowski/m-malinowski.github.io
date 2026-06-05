"""Generates the pipeline-summary funnel for the open-physics-questions post.

Run:  python3 assets/images/posts/pipeline_figure.py
Output: assets/images/posts/pipeline_funnel.png
"""
import os
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch

# --- pipeline stages: (count, headline, sub-label) -----------------------
stages = [
    (275, "275 papers", "one week of quant-ph preprints"),
    (33,  "33 papers",  "48 AI-suitable questions"),
    (30,  "30 papers",  "AI claims a solution"),
    (30,  "30 emails",  "sent to authors"),
    (16,  "16 replies", "authors responded"),
]

# final breakdown of the 16 replies
verdicts = [
    ("Good",  3, "#2e8b57"),   # AI effectively solved it
    ("Mixed", 9, "#e8a33d"),   # partial / promising
    ("Bad",   4, "#c0392b"),   # incorrect or misframed
]

fig, ax = plt.subplots(figsize=(8.2, 8.6))
ax.set_xlim(0, 100)
ax.set_ylim(0, 100)
ax.axis("off")

cx = 50            # centre line
max_w = 78         # width of the widest (first) bar
top = 96
row_h = 9.0
gap = 4.2
blues = ["#1f4e79", "#2a5f93", "#356aa0", "#3f74ad", "#4a7fb8"]

centers = []
widths = []
y = top
for (count, head, sub), col in zip(stages, blues):
    w = max_w * (count / stages[0][0]) ** 0.5   # sqrt keeps small bars legible
    w = max(w, 30)                               # floor so sub-labels fit
    x = cx - w / 2
    box = FancyBboxPatch((x, y - row_h), w, row_h,
                         boxstyle="round,pad=0.2,rounding_size=1.5",
                         linewidth=0, facecolor=col)
    ax.add_patch(box)
    ax.text(cx, y - row_h / 2 + 1.4, head, ha="center", va="center",
            color="white", fontsize=13, fontweight="bold")
    ax.text(cx, y - row_h / 2 - 2.3, sub, ha="center", va="center",
            color="white", fontsize=8.2)
    centers.append((cx, y - row_h))
    widths.append(w)
    y -= row_h + gap

# connecting funnel chevrons between successive bars
for (count, *_), (cxp, yb), wtop, wbot in zip(stages[1:],
                                              centers[:-1],
                                              widths[:-1], widths[1:]):
    ytop = yb
    ybot = yb - gap
    ax.fill([cxp - wtop / 2, cxp + wtop / 2, cx + wbot / 2, cx - wbot / 2],
            [ytop, ytop, ybot, ybot], color="#d6e0ea", zorder=0)

# --- exploded breakdown of the 16 replies --------------------------------
bx0, bx1 = 12, 88
by = y - 2.5
bar_h = 7.5
total = sum(v for _, v, _ in verdicts)
ax.text(cx, by + 4.0, "of the 16 replies", ha="center", va="bottom",
        fontsize=9.5, style="italic", color="#444")

# guide lines from the "16 replies" bar down to the breakdown bar
lc, lyb = centers[-1]
ax.add_patch(FancyArrowPatch((lc, lyb), (cx, by + bar_h + 0.5),
                             arrowstyle="-|>", mutation_scale=14,
                             color="#888", lw=1.3))

xcur = bx0
span = bx1 - bx0
for label, val, col in verdicts:
    w = span * val / total
    box = FancyBboxPatch((xcur, by - bar_h), w, bar_h,
                         boxstyle="round,pad=0.1,rounding_size=1.0",
                         linewidth=0, facecolor=col)
    ax.add_patch(box)
    ax.text(xcur + w / 2, by - bar_h / 2 + 1.0, f"{val}", ha="center",
            va="center", color="white", fontsize=13, fontweight="bold")
    ax.text(xcur + w / 2, by - bar_h / 2 - 2.4, label, ha="center",
            va="center", color="white", fontsize=9)
    xcur += w

ax.set_title("From 275 preprints to 3 confirmed solutions",
             fontsize=14, fontweight="bold", pad=12)

plt.tight_layout()
out = os.path.join(os.path.dirname(__file__), "pipeline_funnel.png")
fig.savefig(out, dpi=160, bbox_inches="tight", facecolor="white")
print("wrote", out)
