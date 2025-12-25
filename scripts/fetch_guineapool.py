#!/usr/bin/env python3
"""
GUINEA POOL UPDATE SCRIPT
Fetches data from Lighter DEX and updates dashboard JSON files
"""

import requests
import json
import os
from datetime import datetime, date
from pathlib import Path

# ========== CONFIG ==========
# Menggunakan ID 281474976694250 sebagai default jika Secret tidak ditemukan
ACCOUNT_INDEX = int(os.getenv('GUINEAPOOL_ACCOUNT_INDEX', '281474976694250'))
BASE_URL = "https://mainnet.zklighter.elliot.ai/api/v1"
START_NAV = 1000  

SCRIPT_DIR = Path(__file__).parent
OUTPUT_DIR = SCRIPT_DIR.parent / "public" / "data"

# ========== FUNCTIONS ==========

def fetch_account_data(account_index):
    url = f"{BASE_URL}/account?by=index&value={account_index}"
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        # Mengikuti struktur response API Lighter
        accounts = data.get('accounts', [])
        return accounts[0] if accounts else None
    except Exception as e:
        print(f"❌ Error fetching account data: {e}")
        return None

def calculate_metrics(account):
    if not account: return None
    
    collateral = float(account.get('collateral', 0))
    available_balance = float(account.get('available_balance', 0))
    positions = account.get('positions', [])
    status = account.get('status', 0)
    
    total_unrealized_pnl = sum(float(p.get('unrealized_pnl', 0)) for p in positions)
    total_realized_pnl = sum(float(p.get('realized_pnl', 0)) for p in positions)
    total_position_value = sum(float(p.get('position_value', 0)) for p in positions)
    
    return {
        'tvl': collateral,
        'available_balance': available_balance,
        'unrealized_pnl': total_unrealized_pnl,
        'realized_pnl': total_realized_pnl,
        'total_pnl': total_unrealized_pnl + total_realized_pnl,
        'position_value': total_position_value,
        'positions_count': len(positions),
        'status': 'Live' if status == 1 or len(positions) > 0 else 'Offline'
    }

def load_previous_data(filepath):
    try:
        if filepath.exists():
            with open(filepath, 'r') as f:
                return json.load(f)
    except Exception:
        pass
    return {"guineapool": {"liveData": [], "tvl": 0, "status": "Offline"}}

def calculate_nav(previous_nav, previous_collateral, current_collateral):
    if previous_collateral == 0: return START_NAV
    daily_return = (current_collateral - previous_collateral) / previous_collateral
    return previous_nav * (1 + daily_return)

def calculate_drawdown(nav_history):
    if not nav_history: return 0
    nav_values = [point['value'] for point in nav_history]
    peak = max(nav_values)
    return ((nav_values[-1] - peak) / peak) * 100 if peak > 0 else 0

def update_live_data(metrics):
    today = date.today().isoformat()
    live_data_path = OUTPUT_DIR / "live-data-guineapool.json"
    all_data = load_previous_data(live_data_path)
    
    strategy_data = all_data.get("guineapool", {"liveData": [], "tvl": 0, "status": "Offline"})
    live_data = strategy_data.get("liveData", [])
    
    if len(live_data) > 0:
        last_point = live_data[-1]
        previous_nav = last_point['value']
        previous_collateral = last_point.get('collateral', 0)
    else:
        previous_nav, previous_collateral = START_NAV, metrics['tvl']
    
    new_nav = calculate_nav(previous_nav, previous_collateral, metrics['tvl'])
    now = datetime.now()
    
    new_point = {
        "date": today,
        "timestamp": now.strftime("%Y-%m-%d %H:%M:%S"),
        "year": now.year,
        "value": round(new_nav, 2),
        "collateral": metrics['tvl'],
        "pnl": metrics['total_pnl'],
        "drawdown": 0 
    }
    
    live_data.append(new_point)
    # Re-calculate drawdown
    for i in range(len(live_data)):
        live_data[i]['drawdown'] = calculate_drawdown(live_data[:i+1])
    
    strategy_data.update({"liveData": live_data, "tvl": metrics['tvl'], "status": metrics['status']})
    all_data["guineapool"] = strategy_data
    
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    with open(live_data_path, 'w') as f:
        json.dump(all_data, f, indent=2)
    return new_point

def main():
    print(f"🚀 GUINEA POOL UPDATE | Account: {ACCOUNT_INDEX}")
    account = fetch_account_data(ACCOUNT_INDEX)
    if not account: return 1
    
    metrics = calculate_metrics(account)
    if not metrics: return 1
    
    new_point = update_live_data(metrics)
    print(f"✅ Success! NAV: {new_point['value']} | TVL: ${metrics['tvl']}")
    return 0

if __name__ == "__main__":
    exit(main())