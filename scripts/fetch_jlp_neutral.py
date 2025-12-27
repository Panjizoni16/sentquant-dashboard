#!/usr/bin/env python3
"""
JLP Neutral Vault Sync - FULL HISTORY VERSION
Logika: NAV Start 1000, Multi-row History (Tanpa Overwrite), & Manual Fallback
"""
import json
import struct
import os
from datetime import datetime, date
from pathlib import Path

try:
    from solana.rpc.api import Client
    from solders.pubkey import Pubkey
except ImportError:
    print("❌ Library belum terinstall. Jalankan: pip install solana solders requests")
    exit(1)

# ========== CONFIG ==========
VAULT_ADDRESS_STR = "9omhWDzVxpX1vPBxAhJpVao7baoVzZpNib32vozZLxGm"
RPC_URL = "https://api.mainnet-beta.solana.com" 

# Paths
SCRIPT_DIR = Path(__file__).parent
OUTPUT_DIR = SCRIPT_DIR.parent / "public" / "data"
START_NAV = 1000.0

def get_vault_user_address(vault_str):
    """Membongkar Vault untuk mencari alamat User Trading (Offset 168)"""
    try:
        client = Client(RPC_URL, timeout=60)
        vault_pk = Pubkey.from_string(vault_str)
        res = client.get_account_info(vault_pk)
        if not res.value: return None
        user_pk_bytes = res.value.data[168:200]
        return str(Pubkey.from_bytes(user_pk_bytes))
    except Exception:
        return "8ue2xNfN5fXVvkFjDiWdmWERPbHEvkWgdq4bZD7FdrwF" # Fallback Manual

def calculate_drawdown(nav_history):
    if not nav_history: return 0.0
    nav_values = [p['value'] for p in nav_history]
    peak = max(nav_values)
    current = nav_values[-1]
    return ((current - peak) / peak) * 100 if peak > 0 else 0.0

def update_live_data(net_equity):
    """Logika utama pembaruan data dan kalkulasi NAV"""
    # Gunakan ISO format untuk tanggal, tapi tambahkan jam agar unik jika di-update berkali-kali
    now = datetime.now()
    today_str = now.strftime("%Y-%m-%d")
    timestamp_str = now.strftime("%Y-%m-%d %H:%M:%S")
    
    file_path = OUTPUT_DIR / "live-data-jlp_neutral.json"
    
    # 1. Load data lama
    if file_path.exists():
        with open(file_path, 'r') as f:
            all_data = json.load(f)
    else:
        all_data = {"jlp_neutral": {"liveData": [], "tvl": 0, "status": "Offline"}}

    strategy_data = all_data.get("jlp_neutral", {"liveData": [], "tvl": 0})
    live_data = strategy_data.get("liveData", [])

    # 2. Hitung NAV (Logika 1000)
    if not live_data:
        new_nav = START_NAV
    else:
        prev_point = live_data[-1]
        prev_nav = prev_point['value']
        prev_equity = prev_point.get('collateral', net_equity)
        
        # Rumus Pertumbuhan Proporsional
        if prev_equity > 0:
            new_nav = prev_nav * (net_equity / prev_equity)
        else:
            new_nav = prev_nav

    new_point = {
        "date": today_str,
        "timestamp": timestamp_str,
        "year": now.year,
        "value": round(new_nav, 2),
        "collateral": round(net_equity, 2),
        "drawdown": 0.0
    }

    # 3. SELALU TAMBAH BARIS BARU (Agar riwayat terlihat di dashboard)
    print(f"➕ Menambah baris riwayat baru: {timestamp_str}")
    live_data.append(new_point)

    # 4. Update Drawdowns untuk seluruh history
    for i in range(len(live_data)):
        live_data[i]['drawdown'] = round(calculate_drawdown(live_data[:i+1]), 2)

    # 5. Finalisasi JSON
    strategy_data.update({
        "liveData": live_data,
        "tvl": round(net_equity, 2),
        "status": "Live"
    })
    all_data["jlp_neutral"] = strategy_data

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    with open(file_path, 'w') as f:
        json.dump(all_data, f, indent=2)
    
    return new_point

def main():
    print("="*60)
    print("🚀 SENTQUANT | JLP NEUTRAL SYNC V3 (HISTORY MODE)")
    print("="*60)

    user_addr = get_vault_user_address(VAULT_ADDRESS_STR)
    print(f"👤 User Trading: {user_addr}")
    print(f"🔗 View Dashboard: https://app.drift.trade/view/{user_addr}")

    # Step: Input Equity (Gunakan angka $2,308,787.32 dari screenshot Drift)
    print("\n" + "-"*30)
    try:
        val = input(f"Masukkan Net Equity dari Drift Dashboard: $")
        equity = float(val.replace(",", "").replace("$", "").strip())
    except Exception as e:
        print(f"❌ Input salah: {e}")
        return

    # Update dan Simpan
    result = update_live_data(equity)

    print("\n" + "="*60)
    print(f"✅ DATA BERHASIL DITAMBAHKAN")
    print(f"📈 NAV Sekarang: {result['value']}")
    print(f"💰 TVL:          ${result['collateral']:,.2f}")
    print(f"📊 Total Baris:  {len(update_live_data.__globals__['all_data']['jlp_neutral']['liveData'] if 'all_data' in update_live_data.__globals__ else [])}") 
    print("="*60)

if __name__ == "__main__":
    main()