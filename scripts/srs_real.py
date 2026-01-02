import json
import numpy as np
import os
import re

# ==========================================
# 1. KONFIGURASI PATH & PARAMETER
# ==========================================
BASE_PATH = os.path.join(os.path.dirname(__file__), '..', 'public', 'data')
APP_JSX_PATH = os.path.join(os.path.dirname(__file__), '..', 'src', 'App.jsx')

# Minimal data points (hari/update) agar tidak kena pinalti pendatang baru
MIN_DATA_POINTS = 7 

AGENTS = [
    {'id': 'sentquant', 'name': 'Sentquant', 'color': '#f3f4f5'},
    {'id': 'systemic_hyper', 'name': 'Systemic Hyper', 'color': '#3b1bccff'},
    {'id': 'jlp_neutral', 'name': 'JLP Delta Neutral', 'color': '#e9d5ff'},
    {'id': 'guineapool', 'name': 'Guinea Pool', 'color': '#9c69c5ff'},
    {'id': 'edgehedge', 'name': 'Edge and Hedge', 'color': '#a54316'},
    {'id': 'systemicls', 'name': 'Systemic L/S', 'color': '#ebfd4a'}
]

def calculate_metrics(navs):
    if len(navs) < 2: return 0, 0, 0, 0
    
    returns = [(navs[i] - navs[i-1]) / navs[i-1] for i in range(1, len(navs))]
    roi = (navs[-1] - navs[0]) / navs[0]
    
    # Sortino: Downside Risk Efficiency
    neg_returns = [r for r in returns if r < 0]
    downside_std = np.std(neg_returns) if neg_returns else 0.0001
    sortino = np.mean(returns) / downside_std if downside_std > 0 else 0
    
    # Calmar: ROI vs Max Drawdown
    peak, mdd = navs[0], 0.0001
    for v in navs:
        if v > peak: peak = v
        dd = (peak - v) / peak
        if dd > mdd: mdd = dd
    calmar = roi / mdd
    
    # Stability: 1 / Volatility
    vol = np.std(returns) if returns else 0.0001
    stability = 1 / vol
    
    return roi, sortino, calmar, stability

# ==========================================
# 2. DATA PROCESSING & RISK ENGINE
# ==========================================
raw_results = []
for agent in AGENTS:
    file_path = os.path.join(BASE_PATH, f'live-data-{agent["id"]}.json')
    if not os.path.exists(file_path): continue
        
    with open(file_path, 'r') as f:
        data = json.load(f)
        history = data[agent['id']]['liveData']
        nav_history = [h['value'] for h in history]
        
        roi, sort, calm, stab = calculate_metrics(nav_history)
        
        raw_results.append({
            **agent, 
            'roi': roi, 
            'sortino': sort, 
            'calmar': calm, 
            'stability': stab,
            'history_len': len(nav_history)
        })

# Normalisasi Min-Max
def norm(key, dataset):
    vals = [d[key] for d in dataset]
    v_min, v_max = min(vals), max(vals)
    return [(v - v_min) / (v_max - v_min + 1e-9) for v in vals]

n_roi = norm('roi', raw_results)
n_sort = norm('sortino', raw_results)
n_calm = norm('calmar', raw_results)
n_stab = norm('stability', raw_results)

# ==========================================
# 3. SRS SYNTHESIS & TIE-BREAKER LOGIC
# ==========================================
for i, res in enumerate(raw_results):
    # RUMUS DASAR: 30-30-30-10
    score = (n_roi[i]*0.3) + (n_sort[i]*0.3) + (n_calm[i]*0.3) + (n_stab[i]*0.1)
    
    # NEW ENTRY PENALTY:
    # Jika data kurang dari 7 hari, skor dipangkas 80% agar tidak langsung Rank #1
    if res['history_len'] < MIN_DATA_POINTS:
        score *= 0.2
        
    res['internal_score'] = score
    res['srs'] = int(100 + (score * 900))

# SORTING ORDER: 1. SRS Internal (Decimal), 2. ROI, 3. Seniority (History)
ranked = sorted(
    raw_results, 
    key=lambda x: (x['internal_score'], x['roi'], x['history_len']), 
    reverse=True
)

# ==========================================
# 4. TERMINAL AUDIT REPORT
# ==========================================
print(f"\n{'='*95}")
print(f" SENTQUANT ALPHA AUDIT - SRS MASTER REPORT")
print(f"{'='*95}")
print(f"{'RANK':<5} | {'AGENT':<20} | {'ROI':<8} | {'SORTINO':<8} | {'CALMAR':<8} | {'STAB':<8} | {'SRS':<5}")
print("-" * 95)

for i, r in enumerate(ranked, 1):
    status = "*" if r['history_len'] < MIN_DATA_POINTS else " "
    print(f"#{i:02}{status}  | {r['name']:<20} | {r['roi']*100:>6.2f}% | {r['sortino']:>8.2f} | {r['calmar']:>8.2f} | {r['stability']:>8.2f} | {r['srs']:>5}")

print(f"{'='*95}")
print("(*) New Entry / Insufficient Data Penalty Applied")

# ==========================================
# 5. AUTO-INJECTION KE APP.JSX
# ==========================================
try:
    with open(APP_JSX_PATH, 'r', encoding='utf-8') as f:
        content = f.read()

    new_config = "const STRATEGIES_CONFIG = [\n"
    for r in raw_results:
        # Detect Protocol
        proto = "Lighter" if "hyper" not in r['id'] and "jlp" not in r['id'] else ("Hyperliquid" if "hyper" in r['id'] else "Drift")
        new_config += f"  {{ id: '{r['id']}', name: '{r['name']}', protocol: '{proto}', color: '{r['color']}', srs: {r['srs']} }},\n"
    new_config += "];"

    updated_content = re.sub(r"const STRATEGIES_CONFIG = \[.*?\];", new_config, content, flags=re.DOTALL)

    with open(APP_JSX_PATH, 'w', encoding='utf-8') as f:
        f.write(updated_content)
    print("\n🚀 SUCCESS: Rankings & Metrics updated on App.jsx\n")
except Exception as e:
    print(f"\n❌ FAILED to inject App.jsx: {e}")