#!/usr/bin/env python3
"""
SENTQUANT DAILY UPDATE SCRIPT
Fetches data from Lighter DEX and updates dashboard JSON files
"""

import requests
import json
import os
from datetime import datetime, date
from pathlib import Path

# ========== CONFIG ==========
ACCOUNT_INDEX = int(os.getenv('ACCOUNT_INDEX', '505549'))
BASE_URL = "https://mainnet.zklighter.elliot.ai/api/v1"
START_NAV = 1000  # Starting NAV for tracking

# Paths (adjust based on where script runs)
SCRIPT_DIR = Path(__file__).parent
OUTPUT_DIR = SCRIPT_DIR.parent / "public" / "data"  # For GitHub repo structure

# ========== FUNCTIONS ==========

def fetch_account_data(account_index):
    """Fetch account data from Lighter DEX API"""
    url = f"{BASE_URL}/account?by=index&value={account_index}"
    
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        accounts = data.get('accounts', [])
        if not accounts:
            raise Exception("No accounts found")
        
        return accounts[0]
    
    except Exception as e:
        print(f"❌ Error fetching account data: {e}")
        return None


def calculate_metrics(account):
    """Calculate metrics from account data"""
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
    
    total_pnl = total_unrealized_pnl + total_realized_pnl
    
    return {
        'tvl': collateral,
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
    except Exception as e:
        print(f"⚠️  Could not load previous data: {e}")
    
    return {
        "sentquant": {
            "liveData": [],
            "tvl": 0,
            "status": "Offline"
        }
    }


def calculate_nav(previous_nav, previous_collateral, current_collateral):
    """Calculate new NAV based on collateral change"""
    if previous_collateral == 0:
        return START_NAV
    
    # Daily return = (current - previous) / previous
    daily_return = (current_collateral - previous_collateral) / previous_collateral
    
    # New NAV = previous NAV * (1 + return)
    new_nav = previous_nav * (1 + daily_return)
    
    return new_nav


def calculate_drawdown(nav_history):
    """Calculate drawdown from peak NAV"""
    if not nav_history:
        return 0
    
    # Get all NAV values
    nav_values = [point['value'] for point in nav_history]
    
    # Find peak (maximum NAV so far)
    peak = max(nav_values)
    current = nav_values[-1]
    
    # Drawdown = (current - peak) / peak * 100
    if peak > 0:
        drawdown = ((current - peak) / peak) * 100
    else:
        drawdown = 0
    
    return drawdown


def update_live_data(metrics):
    """Update live-data.json with new data point"""
    today = date.today().isoformat()
    
    # Load previous data
    live_data_path = OUTPUT_DIR / "live-data-sentquant.json"
    all_data = load_previous_data(live_data_path)
    
    # Get strategy data
    strategy_data = all_data.get("sentquant", {
        "liveData": [],
        "tvl": 0,
        "status": "Offline"
    })
    
    live_data = strategy_data.get("liveData", [])
    
    # Check if today already has data
    today_exists = any(point['date'] == today for point in live_data)
    
    if today_exists:
        print(f"⚠️  Data for {today} already exists. Updating...")
        # Remove today's data
        live_data = [point for point in live_data if point['date'] != today]
    
    # Calculate NAV
    if len(live_data) > 0:
        last_point = live_data[-1]
        previous_nav = last_point['value']
        previous_collateral = last_point.get('collateral', 0)
    else:
        # First data point - start at NAV 1000
        previous_nav = START_NAV
        previous_collateral = metrics['tvl']
    
    current_collateral = metrics['tvl']
    new_nav = calculate_nav(previous_nav, previous_collateral, current_collateral)
    
    # Create new data point
    new_point = {
        "date": today,
        "year": datetime.now().year,
        "value": round(new_nav, 2),
        "collateral": current_collateral,
        "pnl": metrics['total_pnl'],
        "drawdown": 0  # Will calculate after appending
    }
    
    # Append new point
    live_data.append(new_point)
    
    # Calculate drawdown for all points
    for i, point in enumerate(live_data):
        point['drawdown'] = calculate_drawdown(live_data[:i+1])
    
    # Update strategy data
    strategy_data['liveData'] = live_data
    strategy_data['tvl'] = metrics['tvl']
    strategy_data['status'] = metrics['status']
    
    # Update all data
    all_data['sentquant'] = strategy_data
    
    # Save
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    with open(live_data_path, 'w') as f:
        json.dump(all_data, f, indent=2)
    
    print(f"✅ Updated live-data-sentquant.json")
    print(f"   Date: {today}")
    print(f"   NAV: {new_nav:.2f}")
    print(f"   TVL: ${metrics['tvl']:.2f}")
    print(f"   Drawdown: {new_point['drawdown']:.2f}%")
    
    return new_point


def main():
    """Main execution"""
    print("="*70)
    print("🚀 SENTQUANT DAILY UPDATE")
    print("="*70)
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Account: {ACCOUNT_INDEX}")
    print()
    
    # Fetch data
    print("📡 Fetching data from Lighter DEX...")
    account = fetch_account_data(ACCOUNT_INDEX)
    
    if not account:
        print("❌ Failed to fetch account data")
        return 1
    
    # Calculate metrics
    print("📊 Calculating metrics...")
    metrics = calculate_metrics(account)
    
    if not metrics:
        print("❌ Failed to calculate metrics")
        return 1
    
    # Print summary
    print()
    print("="*70)
    print("📊 CURRENT METRICS")
    print("="*70)
    print(f"TVL:              ${metrics['tvl']:,.2f}")
    print(f"Available:        ${metrics['available_balance']:,.2f}")
    print(f"Position Value:   ${metrics['position_value']:,.2f}")
    print(f"Unrealized PnL:   ${metrics['unrealized_pnl']:+,.6f}")
    print(f"Realized PnL:     ${metrics['realized_pnl']:+,.6f}")
    print(f"Total PnL:        ${metrics['total_pnl']:+,.6f}")
    print(f"Positions:        {metrics['positions_count']}")
    print(f"Status:           {metrics['status']}")
    print()
    
    # Update live data
    print("💾 Updating live-data-sentquant.json...")
    new_point = update_live_data(metrics)
    
    print()
    print("="*70)
    print("✅ DAILY UPDATE COMPLETED")
    print("="*70)
    
    return 0


if __name__ == "__main__":
    exit(main())