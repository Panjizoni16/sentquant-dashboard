#!/usr/bin/env python3
"""
GUINEA POOL UPDATE SCRIPT (FIXED TVL LOGIC)
Fetches data from Lighter DEX and updates dashboard JSON files
"""

import requests
import json
import os
from datetime import datetime, date
from pathlib import Path

# ========== CONFIG ==========
# Menggunakan Account Index Guinea Pool Anda
ACCOUNT_INDEX = int(os.getenv('GUINEAPOOL_ACCOUNT_INDEX', '281474976694250'))
BASE_URL = "https://mainnet.zklighter.elliot.ai/api/v1"
START_NAV = 1000 

# Paths
SCRIPT_DIR = Path(__file__).parent
OUTPUT_DIR = SCRIPT_DIR.parent / "public" / "data"

# ========== FUNCTIONS ==========

def fetch_account_data(account_index):
    """Fetch account data from Lighter DEX API"""
    url = f"{BASE_URL}/account?by=index&value={account_index}"
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        accounts = data.get('accounts', [])
        return accounts[0] if accounts else None
    except Exception as e:
        print(f"❌ Error fetching account data: {e}")
        return None

def calculate_metrics(account):
    """Calculate metrics with Net Equity logic"""
    if not account:
        return None
    
    collateral = float(account.get('collateral', 0))
    available_balance = float(account.get('available_balance', 0))
    positions = account.get('positions', [])
    status = account.get('status', 0)
    
    total_unrealized_pnl = 0
    total_realized_pnl = 0
    total_position_value = 0
    
    for pos in positions:
        total_unrealized_pnl += float(pos.get('unrealized_pnl', 0))
        total_realized_pnl += float(pos.get('realized_pnl', 0))
        total_position_value += float(pos.get('position_value', 0))
    
    # PERBAIKAN: TVL dihitung sebagai Net Equity agar sesuai UI Lighter ($1.4M+)
    net_equity = collateral + total_unrealized_pnl
    total_pnl = total_unrealized_pnl + total_realized_pnl
    
    return {
        'tvl': net_equity,  # Sekarang menggunakan Net Equity
        'available_balance': available_balance,
        'unrealized_pnl': total_unrealized_pnl,
        'realized_pnl': total_realized_pnl,
        'total_pnl': total_pnl,
        'position_value': total_position_value,
        'positions_count': len(positions),
        'status': 'Live' if status == 1 or len(positions) > 0 else 'Offline'
    }

def load_previous_data(filepath):
    """Load previous live data"""
    try:
        if filepath.exists():
            with open(filepath, 'r') as f:
                return json.load(f)
    except Exception:
        pass
    return {"guineapool": {"liveData": [], "tvl": 0, "status": "Offline"}}

def calculate_nav(previous_nav, previous_tvl, current_tvl):
    """Calculate new NAV based on TVL (Equity) change"""
    if previous_tvl <= 0:
        return START_NAV
    # Return = (Current Equity / Previous Equity)
    return previous_nav * (current_tvl / previous_tvl)

def calculate_drawdown(nav_history):
    """Calculate drawdown from peak NAV"""
    if not nav_history: return 0
    nav_values = [point['value'] for point in nav_history]
    peak = max(nav_values)
    current = nav_values[-1]
    return ((current - peak) / peak) * 100 if peak > 0 else 0

def update_live_data(metrics):
    """Update live-data-guineapool.json"""
    today = date.today().isoformat()
    live_data_path = OUTPUT_DIR / "live-data-guineapool.json"
    all_data = load_previous_data(live_data_path)
    
    strategy_data = all_data.get("guineapool", {"liveData": [], "tvl": 0, "status": "Offline"})
    live_data = strategy_data.get("liveData", [])
    
    # Calculate NAV based on TVL (Equity)
    if len(live_data) > 0:
        last_point = live_data[-1]
        previous_nav = last_point['value']
        previous_tvl = last_point.get('collateral', 0) # Kita simpan TVL di field 'collateral' di JSON
    else:
        previous_nav = START_NAV
        previous_tvl = metrics['tvl']
    
    new_nav = calculate_nav(previous_nav, previous_tvl, metrics['tvl'])
    now = datetime.now()
    
    new_point = {
        "date": today,
        "timestamp": now.strftime("%Y-%m-%d %H:%M:%S"),
        "year": now.year,
        "value": round(new_nav, 2),
        "collateral": metrics['tvl'], # Menyimpan Net Equity sebagai referensi TVL
        "pnl": metrics['total_pnl'],
        "drawdown": 0
    }
    
    live_data.append(new_point)
    
    # Update all drawdowns
    for i in range(len(live_data)):
        live_data[i]['drawdown'] = calculate_drawdown(live_data[:i+1])
    
    strategy_data.update({
        "liveData": live_data,
        "tvl": metrics['tvl'],
        "status": metrics['status']
    })
    all_data["guineapool"] = strategy_data
    
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    with open(live_data_path, 'w') as f:
        json.dump(all_data, f, indent=2)
    
    return new_point

def main():
    print("="*50)
    print(f"🚀 GUINEA POOL UPDATE | Account: {ACCOUNT_INDEX}")
    print("="*50)
    
    account = fetch_account_data(ACCOUNT_INDEX)
    if not account: return 1
    
    metrics = calculate_metrics(account)
    if not metrics: return 1
    
    new_point = update_live_data(metrics)
    
    print(f"✅ Success! Net Equity (TVL): ${metrics['tvl']:,.2f}")
    print(f"📈 New NAV: {new_point['value']}")
    return 0

if __name__ == "__main__":
    exit(main())