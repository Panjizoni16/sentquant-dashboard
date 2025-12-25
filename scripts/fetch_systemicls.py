#!/usr/bin/env python3
"""
HYPERLIQUID SYSTEMIC LS UPDATE SCRIPT
Updated with Wallet: 0x07fd993f0fa3a185f7207adccd29f7a87404689d
"""

import requests
import json
import os
from datetime import datetime, date
from pathlib import Path

# ========== CONFIG ==========
# Menggunakan wallet address baru yang kamu berikan
WALLET_ADDRESS = os.getenv('WALLET_ADDRESS_LS', '0x07fd993f0fa3a185f7207adccd29f7a87404689d')
API_URL = "https://api.hyperliquid.xyz/info"
START_NAV = 1000  # Starting NAV untuk tracking perdana
STRATEGY_ID = "systemicls"  # ID strategi untuk dashboard

# GANTI BAGIAN INI:
SCRIPT_DIR = Path(__file__).parent
OUTPUT_DIR = SCRIPT_DIR.parent / "public" / "data"  # <--- Pastikan ada .parent nya

# ========== FUNCTIONS ==========

def fetch_hyperliquid_data(wallet, data_type):
    """Fetch data from Hyperliquid API"""
    try:
        response = requests.post(
            API_URL,
            json={
                "type": data_type,
                "user": wallet
            },
            timeout=10
        )
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"❌ Error fetching {data_type}: {e}")
        return None

def fetch_account_data(wallet):
    """Fetch account state from Hyperliquid"""
    print(f"📡 Fetching account state for {wallet}...")
    data = fetch_hyperliquid_data(wallet, "clearinghouseState")
    
    if not data:
        return None
    
    try:
        margin_summary = data.get('marginSummary', {})
        account_value = float(margin_summary.get('accountValue', 0))
        
        print(f"✅ Account Value: ${account_value:,.2f}")
        return data
    except Exception as e:
        print(f"❌ Error parsing account data: {e}")
        return None

def calculate_metrics(account_data):
    """Calculate metrics from account data"""
    if not account_data:
        return None
    
    try:
        margin_summary = account_data.get('marginSummary', {})
        account_value = float(margin_summary.get('accountValue', 0))
        total_margin_used = float(margin_summary.get('totalMarginUsed', 0))
        total_ntl_pos = float(margin_summary.get('totalNtlPos', 0))
        total_raw_usd = float(margin_summary.get('totalRawUsd', 0))
        
        asset_positions = account_data.get('assetPositions', [])
        active_positions = [p for p in asset_positions if float(p.get('position', {}).get('szi', 0)) != 0]
        
        total_unrealized_pnl = 0
        for pos in active_positions:
            position_data = pos.get('position', {})
            unrealized_pnl = float(position_data.get('unrealizedPnl', 0))
            total_unrealized_pnl += unrealized_pnl
        
        return {
            'tvl': account_value,
            'margin_used': total_margin_used,
            'ntl_pos': total_ntl_pos,
            'raw_usd': total_raw_usd,
            'unrealized_pnl': total_unrealized_pnl,
            'positions_count': len(active_positions),
            'status': 'Live' if account_value > 0 or len(active_positions) > 0 else 'Offline'
        }
    except Exception as e:
        print(f"❌ Error calculating metrics: {e}")
        return None

def load_previous_data(filepath):
    """Load previous live data"""
    try:
        if filepath.exists():
            with open(filepath, 'r') as f:
                return json.load(f)
    except Exception as e:
        print(f"⚠️ Could not load previous data: {e}")
    
    return {
        STRATEGY_ID: {
            "liveData": [],
            "tvl": 0,
            "status": "Offline"
        }
    }

def calculate_nav(previous_nav, previous_tvl, current_tvl):
    """Calculate new NAV based on TVL change"""
    if previous_tvl == 0:
        return START_NAV
    daily_return = (current_tvl - previous_tvl) / previous_tvl
    new_nav = previous_nav * (1 + daily_return)
    return new_nav

def calculate_drawdown(nav_history):
    """Calculate drawdown from peak NAV"""
    if not nav_history:
        return 0
    nav_values = [point['value'] for point in nav_history]
    peak = max(nav_values)
    current = nav_values[-1]
    return ((current - peak) / peak) * 100 if peak > 0 else 0

def update_live_data(metrics):
    """Update live-data.json with new data point"""
    today = date.today().isoformat()
    live_data_path = OUTPUT_DIR / f"live-data-{STRATEGY_ID}.json"
    all_data = load_previous_data(live_data_path)
    
    strategy_data = all_data.get(STRATEGY_ID, {
        "liveData": [], "tvl": 0, "status": "Offline"
    })
    live_data = strategy_data.get("liveData", [])
    
    if len(live_data) > 0:
        last_point = live_data[-1]
        previous_nav = last_point['value']
        previous_tvl = last_point.get('tvl', metrics['tvl'])
    else:
        previous_nav = START_NAV
        previous_tvl = metrics['tvl']
    
    current_tvl = metrics['tvl']
    new_nav = calculate_nav(previous_nav, previous_tvl, current_tvl)
    
    now = datetime.now()
    new_point = {
        "date": today,
        "timestamp": now.strftime("%Y-%m-%d %H:%M:%S"),
        "year": now.year,
        "value": new_nav,
        "tvl": current_tvl,
        "pnl": metrics['unrealized_pnl'],
        "drawdown": 0
    }
    
    live_data.append(new_point)
    for i, point in enumerate(live_data):
        point['drawdown'] = calculate_drawdown(live_data[:i+1])
    
    strategy_data['liveData'] = live_data
    strategy_data['tvl'] = metrics['tvl']
    strategy_data['status'] = metrics['status']
    all_data[STRATEGY_ID] = strategy_data
    
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    with open(live_data_path, 'w') as f:
        json.dump(all_data, f, indent=2)
    
    print(f"✅ Updated live-data-{STRATEGY_ID}.json")
    return new_point

def update_historical_data(metrics):
    """Update equity-historical.json with new data point"""
    historical_path = OUTPUT_DIR / f"equity-historical-{STRATEGY_ID}.json"
    
    try:
        if historical_path.exists():
            with open(historical_path, 'r') as f:
                historical_data = json.load(f)
        else:
            historical_data = []
    except:
        historical_data = []
    
    live_data_path = OUTPUT_DIR / f"live-data-{STRATEGY_ID}.json"
    live_data_json = load_previous_data(live_data_path)
    live_data = live_data_json.get(STRATEGY_ID, {}).get('liveData', [])
    
    if live_data:
        latest = live_data[-1]
        historical_data.append({
            "date": latest['date'],
            "year": latest['year'],
            "value": latest['value'],
            "drawdown": latest['drawdown']
        })
        with open(historical_path, 'w') as f:
            json.dump(historical_data, f, indent=2)
        print(f"✅ Updated equity-historical-{STRATEGY_ID}.json")

def main():
    print("="*70)
    print("🚀 HYPERLIQUID SYSTEMIC LS UPDATE")
    print("="*70)
    
    account = fetch_account_data(WALLET_ADDRESS)
    if not account: return 1
    
    metrics = calculate_metrics(account)
    if not metrics: return 1
    
    update_live_data(metrics)
    update_historical_data(metrics)
    
    print("="*70)
    print("✅ SYSTEMIC LS UPDATE COMPLETED")
    print("="*70)
    return 0

if __name__ == "__main__":
    exit(main())