#!/bin/zsh

# --- Juara Ratecard Launcher ---
# Script ini akan menjalankan server development secara otomatis.

# 1. Setup Environment PATH (Penting untuk macOS)
export PATH=$PATH:/opt/homebrew/bin:/usr/local/bin

# 2. Navigasi ke folder project
BASEDIR=$(dirname "$0")
cd "$BASEDIR/app"

echo "----------------------------------------------------"
echo "🚀 MENJALANKAN JUARA RATECARD MANAGER..."
echo "----------------------------------------------------"
echo "📍 Folder: $(pwd)"
echo "----------------------------------------------------"

# 2. Cek apakah node_modules sudah ada
if [ ! -d "node_modules" ]; then
    echo "📦 Menginstall dependencies (pertama kali)..."
    npm install
fi

# 3. Jalankan aplikasi & buka browser
echo "✨ Server sedang dimulai..."
npm run dev -- --open
