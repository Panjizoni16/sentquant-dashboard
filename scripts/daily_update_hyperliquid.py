#!/usr/bin/env python3
"""
HYPERLIQUID DAILY UPDATE SCRIPT
Fetches data from Hyperliquid API and updates dashboard JSON files
"""

import requests
import json
import os
from datetime import datetime, date
from pathlib import Path

# ========== CONFIG ==========
WALLET_ADDRESS = os.getenv('WALLET_ADDRESS', '0xd6e56265890b76413d1d527eb9b75e334c0c5b42')
API_URL = "https://api.hyperliquid.xyz/info"
START_NAV = 1000  # Starting NAV for tracking
STRATEGY_ID = "systemic_hyper"  # Change this to match your strategy

# Paths (adjust based on where script runs)
SCRIPT_DIR = Path(__file__).parent
OUTPUT_DIR = SCRIPT_DIR.parent / "public" / "data"  # For GitHub repo structure

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
    print("📡 Fetching account state...")
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
        
        # Get positions
        asset_positions = account_data.get('assetPositions', [])
        active_positions = [p for p in asset_positions if float(p.get('position', {}).get('szi', 0)) != 0]
        
        # Calculate total unrealized PnL
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
        print(f"⚠️  Could not load previous data: {e}")
    
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
    
    # Daily return = (current - previous) / previous
    daily_return = (current_tvl - previous_tvl) / previous_tvl
    
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
    live_data_path = OUTPUT_DIR / f"live-data-{STRATEGY_ID}.json"
    all_data = load_previous_data(live_data_path)
    
    # Get strategy data
    strategy_data = all_data.get(STRATEGY_ID, {
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
        previous_tvl = last_point.get('tvl', metrics['tvl'])
    else:
        # First data point - set initial NAV
        previous_nav = START_NAV
        previous_tvl = metrics['tvl']
    
    current_tvl = metrics['tvl']
    new_nav = calculate_nav(previous_nav, previous_tvl, current_tvl)
    
    # Create new data point
    new_point = {
        "date": today,
        "year": datetime.now().year,
        "value": round(new_nav, 2),
        "tvl": current_tvl,
        "pnl": metrics['unrealized_pnl'],
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
    all_data[STRATEGY_ID] = strategy_data
    
    # Save
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    with open(live_data_path, 'w') as f:
        json.dump(all_data, f, indent=2)
    
    print(f"✅ Updated live-data-{STRATEGY_ID}.json")
    print(f"   Date: {today}")
    print(f"   NAV: {new_nav:.2f}")
    print(f"   TVL: ${metrics['tvl']:,.2f}")
    print(f"   Drawdown: {new_point['drawdown']:.2f}%")
    
    return new_point


def update_historical_data(metrics):
    """Update equity-historical.json with new data point"""
    today = date.today().isoformat()
    
    # Load previous historical data
    historical_path = OUTPUT_DIR / f"equity-historical-{STRATEGY_ID}.json"
    
    try:
        if historical_path.exists():
            with open(historical_path, 'r') as f:
                historical_data = json.load(f)
        else:
            historical_data = []
    except Exception as e:
        print(f"⚠️  Could not load historical data: {e}")
        historical_data = []
    
    # Check if today already exists
    today_exists = any(point['date'] == today for point in historical_data)
    
    if today_exists:
        # Update today's data
        historical_data = [point for point in historical_data if point['date'] != today]
    
    # Get NAV from live data
    live_data_path = OUTPUT_DIR / f"live-data-{STRATEGY_ID}.json"
    live_data_json = load_previous_data(live_data_path)
    live_data = live_data_json.get(STRATEGY_ID, {}).get('liveData', [])
    
    if live_data:
        latest = live_data[-1]
        
        # Append to historical
        historical_data.append({
            "date": latest['date'],
            "year": latest['year'],
            "value": latest['value'],
            "drawdown": latest['drawdown']
        })
        
        # Save
        with open(historical_path, 'w') as f:
            json.dump(historical_data, f, indent=2)
        
        print(f"✅ Updated equity-historical-{STRATEGY_ID}.json")


def main():
    """Main execution"""
    print("="*70)
    print("🚀 HYPERLIQUID DAILY UPDATE")
    print("="*70)
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Wallet: {WALLET_ADDRESS}")
    print(f"Strategy: {STRATEGY_ID}")
    print()
    
    # Fetch data
    print("📡 Fetching data from Hyperliquid...")
    account = fetch_account_data(WALLET_ADDRESS)
    
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
    print(f"Margin Used:      ${metrics['margin_used']:,.2f}")
    print(f"NTL Position:     ${metrics['ntl_pos']:,.2f}")
    print(f"Raw USD:          ${metrics['raw_usd']:,.2f}")
    print(f"Unrealized PnL:   ${metrics['unrealized_pnl']:+,.2f}")
    print(f"Positions:        {metrics['positions_count']}")
    print(f"Status:           {metrics['status']}")
    print()
    
    # Update live data
    print("💾 Updating live-data.json...")
    new_point = update_live_data(metrics)
    
    # Update historical data
    print("💾 Updating historical data...")
    update_historical_data(metrics)
    
    print()
    print("="*70)
    print("✅ DAILY UPDATE COMPLETED")
    print("="*70)
    
    return 0


if __name__ == "__main__":
    exit(main())