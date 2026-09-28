#!/bin/bash
# system_info.sh
# Prints basic system information, takes a directory name and a file name
# from the user, creates them and stores the running process list in the file.

# ---------- variables ----------
current_date=$(date)
host_name=$(hostname)
user_name=$(whoami)

echo "=========================================="
echo "          SYSTEM INFORMATION"
echo "=========================================="
echo "Current date : $current_date"
echo "Hostname     : $host_name"
echo "Username     : $user_name"
echo

echo "---------- Disk usage (df -h) ----------"
df -h
echo

echo "---------- Running processes (ps) ----------"
ps
echo

# ---------- take input from the user ----------
read -p "Enter directory name: " dir_name
read -p "Enter file name: " file_name

# ---------- create directory and file ----------
mkdir -p "$dir_name"
echo "Directory '$dir_name' created"

touch "$dir_name/$file_name"
echo "File '$dir_name/$file_name' created"

# ---------- store running process info in the file (> redirection) ----------
ps aux > "$dir_name/$file_name"
echo "Running process information saved to '$dir_name/$file_name'"
echo "Total lines written: $(wc -l < "$dir_name/$file_name")"
