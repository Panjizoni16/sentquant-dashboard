import json
import math
import numpy as np
from datetime import datetime, timedelta

# ==========================================
# KONFIGURASI MESIN SRS SENTQUANT
# ==========================================
AGENTS = [
    {'id': 'sentquant', 'name': 'Sentquant'},
    {'id': 'systemic_hyper', 'name': 'Systemic Hyper'},
    {'id': 'jlp_neutral', 'name': 'JLP Delta Neutral'},
    {'id': 'guineapool', 'name': 'Guinea Pool'},
    {'id': 'edgehedge', 'name': 'Edge and Hedge'},
    {'id': 'systemicls', 'name': 'Systemic L/S'}
]

def calculate_metrics(navs):
    if len(navs) < 2: return 0, 0, 0, 0
    
    # Calculate Returns
    returns = [(navs[i] - navs[i-1]) / navs[i-1] for i in range(1, len(navs))]
    
    # 1. ROI (Total Return)
    roi = (navs[-1] - navs[0]) / navs[0]
    
    # 2. SORTINO (Downside Deviation)
    neg_returns = [r for r in returns if r < 0]
    downside_std = np.std(neg_returns) if neg_returns else 0.0001
    sortino = np.mean(returns) / downside_std if downside_std > 0 else 0
    
    # 3. CALMAR (ROI / Max Drawdown)
    peak = navs[0]
    mdd = 0.0001
    for v in navs:
        if v > peak: peak = v
        dd = (peak - v) / peak
        if dd > mdd: mdd = dd
    calmar = roi / mdd
    
    # 4. STABILITY (1 / Volatility)
    vol = np.std(returns) if returns else 0.0001
    stability = 1 / vol
    
    return roi, sortino, calmar, stability

# ==========================================
# SIMULASI DATA (JIKA FILE TIDAK ADA)
# ==========================================
def get_mock_history(agent_id):
    # Simulasi performa berbeda-beda tiap agen
    np.random.seed(sum(ord(c) for c in agent_id))
    base = 1000
    vol = 0.02 if 'hyper' in agent_id else 0.005
    history = []
    for i in range(30):
        base *= (1 + np.random.normal(0.001, vol))
        history.append(base)
    return history

# ==========================================
# EKSEKUSI ENGINE
# ==========================================
print(f"\n{'='*50}")
print(f" SENTQUANT SRS ENGINE - TERMINAL TEST MODE")
print(f"{'='*50}\n")

raw_results = []
for agent in AGENTS:
    # Simulasi pengambilan data
    nav_history = get_mock_history(agent['id'])
    roi, sort, calm, stab = calculate_metrics(nav_history)
    
    raw_results.append({
        'id': agent['id'],
        'name': agent['name'],
        'roi': roi,
        'sortino': sort,
        'calmar': calm,
        'stability': stab,
        'history_len': len(nav_history)
    })

# Normalisasi (Min-Max)
def norm(key, dataset):
    vals = [d[key] for d in dataset]
    v_min, v_max = min(vals), max(vals)
    return [(v - v_min) / (v_max - v_min + 1e-9) for v in vals]

n_roi = norm('roi', raw_results)
n_sort = norm('sortino', raw_results)
n_calm = norm('calmar', raw_results)
n_stab = norm('stability', raw_results)

# Synthesis & Scoring
for i, res in enumerate(raw_results):
    # Weighted Internal Score
    internal = (n_roi[i]*0.3) + (n_sort[i]*0.3) + (n_calm[i]*0.3) + (n_stab[i]*0.1)
    res['internal'] = internal
    res['srs'] = int(100 + (internal * 900))

# FINAL RANKING (SRS -> ROI -> HISTORY)
ranked = sorted(raw_results, key=lambda x: (x['internal'], x['roi'], x['history_len']), reverse=True)

# TAMPILKAN HASIL
print(f"{'RANK':<5} | {'AGENT':<20} | {'ROI':<8} | {'SRS SCORE':<10}")
print("-" * 50)
for i, r in enumerate(ranked, 1):
    roi_str = f"{r['roi']*100:+.2f}%"
    print(f"#{i:02}   | {r['name']:<20} | {roi_str:<8} | {r['srs']:>5}")

print(f"\n{'='*50}")
print(" TEST COMPLETE: SIAP DI-DEPLOY KE APP.JSX")
print(f"{'='*50}\n")