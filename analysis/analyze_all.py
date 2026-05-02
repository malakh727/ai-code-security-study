import pandas as pd
import sys

# ─── Load Data ───────────────────────────────────────────────────────────────
try:
    df = pd.read_csv('results.csv')
except FileNotFoundError:
    print("ERROR: results.csv not found. Run this script from the /analysis directory.")
    sys.exit(1)

try:
    semgrep_df = pd.read_csv('Semgrep_Code.csv')
    has_semgrep = True
except FileNotFoundError:
    print("WARNING: Semgrep_Code.csv not found. Semgrep section will be skipped.")
    has_semgrep = False

# ─── Phase Split ─────────────────────────────────────────────────────────────
phase1 = df[df['Prompt_Number'] <= 13].copy()   # December 2025
phase2 = df[df['Prompt_Number'] >= 14].copy()   # March 2026

# ─── Helpers ─────────────────────────────────────────────────────────────────
def vuln_rate(data):
    total = len(data)
    v = len(data[data['Vulnerable'] == 'Vulnerable'])
    return v, total, (v / total * 100) if total else 0

def section(title):
    print(f"\n{'='*80}")
    print(f"  {title}")
    print(f"{'='*80}")

def subsection(title):
    print(f"\n  {'─'*60}")
    print(f"  {title}")
    print(f"  {'─'*60}")

def phase_summary(data, label):
    v, total, rate = vuln_rate(data)
    s = len(data[data['Vulnerable'] == 'Secure'])
    p = len(data[data['Vulnerable'] == 'Partial'])
    vdf = data[data['Vulnerable'] == 'Vulnerable']

    section(label)
    print(f"  Total samples : {total}")
    print(f"  Vulnerable    : {v} ({rate:.1f}%)")
    print(f"  Secure        : {s} ({s/total*100:.1f}%)")
    print(f"  Partial       : {p} ({p/total*100:.1f}%)")

    subsection("By Model")
    stats = []
    for model in sorted(data['Model'].unique()):
        mv, mt, mr = vuln_rate(data[data['Model'] == model])
        sec = len(data[(data['Model'] == model) & (data['Vulnerable'] == 'Secure')])
        par = len(data[(data['Model'] == model) & (data['Vulnerable'] == 'Partial')])
        stats.append({'Model': model, 'Total': mt, 'Vulnerable': mv,
                      'Secure': sec, 'Partial': par, 'Rate': f"{mr:.1f}%"})
    print(pd.DataFrame(stats).to_string(index=False))

    subsection("By Category")
    cat_stats = []
    for cat in sorted(data['Category'].unique()):
        cv, ct, cr = vuln_rate(data[data['Category'] == cat])
        cat_stats.append({'Category': cat, 'Tests': ct,
                          'Vulnerable': cv, 'Rate': f"{cr:.1f}%"})
    print(pd.DataFrame(cat_stats).to_string(index=False))

    if len(vdf):
        subsection("Severity (Vulnerable cases only)")
        sev = vdf['Severity'].value_counts()
        tv = len(vdf)
        for s in ['High', 'Medium', 'Low']:
            c = sev.get(s, 0)
            print(f"    {s}: {c} ({c/tv*100:.1f}%)")

        subsection("Top Vulnerability Types")
        for vtype, count in vdf['Vulnerability_Type'].value_counts().head(8).items():
            print(f"    {vtype}: {count}")

# ═══════════════════════════════════════════════════════════════════════════════
print("\n" + "█"*80)
print("  SECURITY EVALUATION OF AI-GENERATED CODE — FULL ANALYSIS")
print(f"  Manual Review + Semgrep Validation | 120 Samples | 5 Models | 24 Prompts")
print("█"*80)

# ─── PART 1: MANUAL REVIEW ───────────────────────────────────────────────────
print("\n\n" + "▓"*80)
print("  PART 1 — MANUAL REVIEW RESULTS")
print("▓"*80)

phase_summary(phase1, "PHASE 1 — December 2025  (Prompts 1–13, Models: Dec 2025 versions)")
phase_summary(phase2, "PHASE 2 — March 2026     (Prompts 14–24, Models: Mar 2026 versions)")

# ─── Cross-Phase Category Comparison ─────────────────────────────────────────
section("CROSS-PHASE CATEGORY COMPARISON")
print(f"  {'Category':<12} {'P1 Tests':>8} {'P1 Vuln%':>9} {'P2 Tests':>8} {'P2 Vuln%':>9} {'Δ':>9}")
print(f"  {'-'*60}")
for cat in sorted(df['Category'].unique()):
    p1c = phase1[phase1['Category'] == cat]
    p2c = phase2[phase2['Category'] == cat]
    p1r = vuln_rate(p1c)[2] if len(p1c) else None
    p2r = vuln_rate(p2c)[2] if len(p2c) else None
    if p1r is not None and p2r is not None:
        change = p2r - p1r
        sign = "+" if change > 0 else ""
        print(f"  {cat:<12} {len(p1c):>8} {p1r:>8.1f}% {len(p2c):>8} {p2r:>8.1f}% {sign}{change:>7.1f}pp")
    elif p1r is None:
        print(f"  {cat:<12} {'—':>8}  {'—':>9}  {len(p2c):>8} {p2r:>8.1f}%  {'(new)':>8}")
    else:
        print(f"  {cat:<12} {len(p1c):>8} {p1r:>8.1f}% {'—':>8}  {'—':>9}  {'(n/a)':>8}")

# ─── New Vulnerability Types ──────────────────────────────────────────────────
section("NEW VULNERABILITY TYPES IN PHASE 2 (not seen in Phase 1)")
p1_types = set(phase1[phase1['Vulnerable'] == 'Vulnerable']['Vulnerability_Type'].dropna())
p2_types = set(phase2[phase2['Vulnerable'] == 'Vulnerable']['Vulnerability_Type'].dropna())
new_types = p2_types - p1_types
for t in sorted(new_types):
    count = len(phase2[(phase2['Vulnerable'] == 'Vulnerable') &
                       (phase2['Vulnerability_Type'] == t)])
    print(f"  {t}: {count} case(s)")

# ─── Model Cross-Phase Comparison ────────────────────────────────────────────
section("MODEL PERFORMANCE — PHASE COMPARISON")
print(f"  {'Model':<12} {'P1 Rate':>8} {'P2 Rate':>8} {'Δ':>8}  {'Trend'}")
print(f"  {'-'*55}")
for model in sorted(df['Model'].unique()):
    p1m = phase1[phase1['Model'] == model]
    p2m = phase2[phase2['Model'] == model]
    _, _, p1r = vuln_rate(p1m)
    _, _, p2r = vuln_rate(p2m)
    change = p2r - p1r
    sign = "+" if change > 0 else ""
    trend = "↑ more vulnerable" if change > 5 else ("↓ improved" if change < -5 else "→ stable")
    print(f"  {model:<12} {p1r:>7.1f}% {p2r:>7.1f}% {sign}{change:>6.1f}pp  {trend}")

# ─── Combined Totals ──────────────────────────────────────────────────────────
section("COMBINED TOTALS — Phase 1 + Phase 2 (120 samples)")
v, total, rate = vuln_rate(df)
s = len(df[df['Vulnerable'] == 'Secure'])
p = len(df[df['Vulnerable'] == 'Partial'])
vdf_all = df[df['Vulnerable'] == 'Vulnerable']
print(f"  Vulnerable : {v}/{total} ({rate:.1f}%)")
print(f"  Secure     : {s}/{total} ({s/total*100:.1f}%)")
print(f"  Partial    : {p}/{total} ({p/total*100:.1f}%)")

subsection("Severity (all vulnerable cases)")
sev_all = vdf_all['Severity'].value_counts()
for s in ['High', 'Medium', 'Low']:
    c = sev_all.get(s, 0)
    print(f"    {s}: {c} ({c/v*100:.1f}%)")

subsection("Top 10 Vulnerability Types (combined)")
for vtype, count in vdf_all['Vulnerability_Type'].value_counts().head(10).items():
    print(f"    {vtype}: {count}")

subsection("Model Performance by Category — Vulnerable Count (combined)")
crosstab = pd.crosstab(
    df[df['Vulnerable'] == 'Vulnerable']['Model'],
    df[df['Vulnerable'] == 'Vulnerable']['Category']
)
print(crosstab.to_string())

# ═══════════════════════════════════════════════════════════════════════════════
# ─── PART 2: SEMGREP VALIDATION ──────────────────────────────────────────────
# ═══════════════════════════════════════════════════════════════════════════════
if has_semgrep:
    print("\n\n" + "▓"*80)
    print("  PART 2 — SEMGREP STATIC ANALYSIS RESULTS")
    print("▓"*80)

    sg_vuln = semgrep_df[semgrep_df['Vulnerable'] == 'Vulnerable']
    sg_v = len(sg_vuln)
    sg_total = len(semgrep_df)

    section("SEMGREP OVERALL RESULTS")
    print(f"  Vulnerable : {sg_v}/{sg_total} ({sg_v/sg_total*100:.1f}%)")
    print(f"  Secure     : {len(semgrep_df[semgrep_df['Vulnerable'] == 'Secure'])}/{sg_total} ({len(semgrep_df[semgrep_df['Vulnerable'] == 'Secure'])/sg_total*100:.1f}%)")

    subsection("By Model")
    sg_model_stats = []
    for model in sorted(semgrep_df['Model'].unique()):
        m = semgrep_df[semgrep_df['Model'] == model]
        mv = len(m[m['Vulnerable'] == 'Vulnerable'])
        ms = len(m[m['Vulnerable'] == 'Secure'])
        mr = mv / len(m) * 100
        sg_model_stats.append({'Model': model, 'Total': len(m),
                                'Vulnerable': mv, 'Secure': ms,
                                'Rate': f"{mr:.1f}%"})
    print(pd.DataFrame(sg_model_stats).to_string(index=False))

    subsection("By Category")
    sg_cat_stats = []
    for cat in sorted(semgrep_df['Category'].unique()):
        c = semgrep_df[semgrep_df['Category'] == cat]
        cv = len(c[c['Vulnerable'] == 'Vulnerable'])
        cr = cv / len(c) * 100
        sg_cat_stats.append({'Category': cat, 'Tests': len(c),
                              'Vulnerable': cv, 'Rate': f"{cr:.1f}%"})
    print(pd.DataFrame(sg_cat_stats).to_string(index=False))

    subsection("Severity Distribution")
    sg_sev = sg_vuln['Severity'].value_counts()
    for s in ['High', 'Medium', 'Low']:
        c = sg_sev.get(s, 0)
        print(f"    {s}: {c} ({c/sg_v*100:.1f}%)")

    subsection("Top Vulnerability Types Found by Semgrep")
    for vtype, count in sg_vuln['Vulnerability_Type'].value_counts().items():
        pct = count / sg_v * 100
        print(f"    {vtype}: {count} ({pct:.1f}%)")

    subsection("Vulnerable Findings per Prompt")
    prompt_stats = sg_vuln.groupby(
        ['Prompt_Number', 'Prompt_Name']
    ).size().reset_index(name='Findings')
    print(prompt_stats.to_string(index=False))

    # ─── Manual vs Semgrep Comparison ────────────────────────────────────────
    section("MANUAL REVIEW vs SEMGREP — DIVERGENCE ANALYSIS")
    print(f"  {'Category':<12} {'Manual Vuln%':>13} {'Semgrep Vuln%':>14} {'Δ':>8}  {'Interpretation'}")
    print(f"  {'-'*75}")

    interpretations = {
        'Novel':   'Semgrep cannot detect semantic CVE patterns → confirms need for manual review',
        'API':     'Semgrep flags CORS/CSRF conservatively → manual review applied exploitability judgment',
        'Auth':    'Reasonable agreement on auth patterns',
        'XSS':     'Reasonable agreement on XSS patterns',
        'Secrets': 'Semgrep misses context-dependent secrets → manual review more thorough',
    }

    all_cats = sorted(set(df['Category'].unique()) | set(semgrep_df['Category'].unique()))
    for cat in all_cats:
        manual_cat = df[df['Category'] == cat]
        semgrep_cat = semgrep_df[semgrep_df['Category'] == cat]
        if len(manual_cat) == 0 or len(semgrep_cat) == 0:
            continue
        _, _, manual_r = vuln_rate(manual_cat)
        sg_cv = len(semgrep_cat[semgrep_cat['Vulnerable'] == 'Vulnerable'])
        sg_cr = sg_cv / len(semgrep_cat) * 100
        diff = sg_cr - manual_r
        sign = "+" if diff > 0 else ""
        interp = interpretations.get(cat, '')
        print(f"  {cat:<12} {manual_r:>12.1f}% {sg_cr:>13.1f}% {sign}{diff:>6.1f}pp")
        if interp:
            print(f"  {'':12}  → {interp}")

    section("KEY DIVERGENCE INSIGHT")
    print("  The Novel category shows the largest divergence:")
    manual_novel = df[df['Category'] == 'Novel']
    semgrep_novel = semgrep_df[semgrep_df['Category'] == 'Novel'] if has_semgrep else None
    _, _, mnr = vuln_rate(manual_novel)
    if semgrep_novel is not None and len(semgrep_novel):
        sg_nv = len(semgrep_novel[semgrep_novel['Vulnerable'] == 'Vulnerable'])
        sg_nr = sg_nv / len(semgrep_novel) * 100
        print(f"  Manual review : {mnr:.1f}% vulnerable")
        print(f"  Semgrep       : {sg_nr:.1f}% vulnerable")
        print(f"  Gap           : {mnr - sg_nr:.1f}pp")
        print(f"\n  Static tools cannot detect recently disclosed CVE patterns.")
        print(f"  This confirms that manual expert review is essential for novel vulnerability detection.")

# ═══════════════════════════════════════════════════════════════════════════════
print("\n\n" + "█"*80)
print("  ANALYSIS COMPLETE")
print(f"  Manual: 120 samples | Semgrep: {'120 samples' if has_semgrep else 'not run'}")
print("█"*80 + "\n")
