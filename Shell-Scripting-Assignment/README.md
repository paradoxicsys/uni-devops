# Shell Scripting Assignment

## Task

Write a shell script `system_info.sh` that:

1. Prints the current date
2. Prints the hostname and username
3. Shows disk usage (`df -h`)
4. Shows running processes (`ps`)
5. Uses variables
6. Takes input from the user with `read -p` (directory name and file name)
7. Creates a directory with `mkdir`
8. Creates a file with `touch`
9. Stores running process information in the file using `>` redirection

The script was executed on **Ubuntu 22.04** (Linux machine `linux-hw`, accessed with `docker exec linux-hw ...`).

---

## Script – `system_info.sh`

```bash
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
```

### How each requirement is met

| Requirement | Line(s) in script |
|---|---|
| Current date | `current_date=$(date)` then `echo "Current date : $current_date"` |
| Hostname / username | `host_name=$(hostname)`, `user_name=$(whoami)` |
| Disk usage | `df -h` |
| Running processes | `ps` |
| Variables | `current_date`, `host_name`, `user_name`, `dir_name`, `file_name` (command substitution `$(...)` stores command output in a variable) |
| Input | `read -p "Enter directory name: " dir_name` and `read -p "Enter file name: " file_name` |
| Create directory | `mkdir -p "$dir_name"` (`-p` = no error if it already exists) |
| Create file | `touch "$dir_name/$file_name"` |
| Store process info | `ps aux > "$dir_name/$file_name"` – `>` overwrites the file with the command output (`>>` would append) |

---

## Commands and output

### 1. Make the script executable

![make executable](screenshots/01-make-executable.png)

```bash
$ cat /etc/os-release | head -1
PRETTY_NAME="Ubuntu 22.04.5 LTS"

$ ls -l
total 4
-rw-r--r-- 1 root root 1198 Sep 28 13:26 system_info.sh

$ chmod +x system_info.sh

$ ls -l system_info.sh
-rwxr-xr-x 1 root root 1198 Sep 28 13:26 system_info.sh

$ bash -n system_info.sh        # syntax check, no output = no errors

$ head -5 system_info.sh
#!/bin/bash
# system_info.sh
# Prints basic system information, takes a directory name and a file name
# from the user, creates them and stores the running process list in the file.
```

### 2. Run the script

Run interactively with:

```bash
./system_info.sh
```

For the recorded run, the two answers (`sysinfo_logs` and `processes.txt`) were typed in automatically through a pipe. `script` gives the program a terminal, so the `read -p` prompts and the typed answers are shown exactly as in an interactive session:

```bash
(sleep 1; echo sysinfo_logs; sleep 1; echo processes.txt) | script -qec ./system_info.sh /dev/null
```

![run script](screenshots/02-run-script.png)

```text
==========================================
          SYSTEM INFORMATION
==========================================
Current date : Mon Sep 28 13:26:53 UTC 2026
Hostname     : linux-hw
Username     : root

---------- Disk usage (df -h) ----------
Filesystem      Size  Used Avail Use% Mounted on
overlay         453G   41G  389G  10% /
tmpfs            64M     0   64M   0% /dev
shm              64M     0   64M   0% /dev/shm
/dev/vda1       453G   41G  389G  10% /etc/hosts
tmpfs           1.6G  8.1M  1.6G   1% /run
tmpfs           5.0M     0  5.0M   0% /run/lock

---------- Running processes (ps) ----------
    PID TTY          TIME CMD
   3946 pts/0    00:00:00 sh
   3947 pts/0    00:00:00 system_info.sh
   3952 pts/0    00:00:00 ps

Enter directory name: sysinfo_logs
Enter file name: processes.txt
Directory 'sysinfo_logs' created
File 'sysinfo_logs/processes.txt' created
Running process information saved to 'sysinfo_logs/processes.txt'
Total lines written: 19
```

### 3. Verify the results

![results](screenshots/03-results.png)

```bash
$ ls -l
total 8
drwxr-xr-x 2 root root 4096 Sep 28 13:26 sysinfo_logs
-rwxr-xr-x 1 root root 1198 Sep 28 13:26 system_info.sh

$ ls -l sysinfo_logs
total 4
-rw-r--r-- 1 root root 1897 Sep 28 13:26 processes.txt

$ wc -l sysinfo_logs/processes.txt
19 sysinfo_logs/processes.txt

$ head -n 8 sysinfo_logs/processes.txt
USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root           1  0.2  0.1  18808  9728 ?        Ss   13:20   0:01 /sbin/init
root          22  0.0  0.0  39908  7216 ?        S<s  13:20   0:00 /lib/systemd/systemd-journald
message+      48  0.0  0.0   8744  4140 ?        Ss   13:20   0:00 @dbus-daemon --system --address=systemd: --nofork --nopidfile --systemd-activation --syslog-only
root          50  0.0  0.0  15244  6484 ?        Ss   13:20   0:00 /lib/systemd/systemd-logind
root        3128  0.0  0.0  55328  6740 ?        Ss   13:22   0:00 nginx: master process /usr/sbin/nginx -g daemon on; master_process on;
www-data    3160  0.0  0.0  56016  6560 ?        S    13:23   0:00 nginx: worker process
www-data    3161  0.0  0.0  56016  6348 ?        S    13:23   0:00 nginx: worker process
```

Full content of `sysinfo_logs/processes.txt` (written by `ps aux >`):

```text
USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root           1  0.2  0.1  18808  9728 ?        Ss   13:20   0:01 /sbin/init
root          22  0.0  0.0  39908  7216 ?        S<s  13:20   0:00 /lib/systemd/systemd-journald
message+      48  0.0  0.0   8744  4140 ?        Ss   13:20   0:00 @dbus-daemon --system --address=systemd: --nofork --nopidfile --systemd-activation --syslog-only
root          50  0.0  0.0  15244  6484 ?        Ss   13:20   0:00 /lib/systemd/systemd-logind
root        3128  0.0  0.0  55328  6740 ?        Ss   13:22   0:00 nginx: master process /usr/sbin/nginx -g daemon on; master_process on;
www-data    3160  0.0  0.0  56016  6560 ?        S    13:23   0:00 nginx: worker process
www-data    3161  0.0  0.0  56016  6348 ?        S    13:23   0:00 nginx: worker process
www-data    3162  0.0  0.0  56016  6800 ?        S    13:23   0:00 nginx: worker process
www-data    3163  0.0  0.0  56016  6800 ?        S    13:23   0:00 nginx: worker process
www-data    3164  0.0  0.0  56016  6800 ?        S    13:23   0:00 nginx: worker process
www-data    3165  0.0  0.0  56016  6796 ?        S    13:23   0:00 nginx: worker process
www-data    3166  0.0  0.0  56016  6796 ?        S    13:23   0:00 nginx: worker process
www-data    3167  0.0  0.0  56016  6800 ?        S    13:23   0:00 nginx: worker process
root        3937  0.0  0.0   3880  2788 ?        Ss   13:26   0:00 bash -c (sleep 1; echo sysinfo_logs; sleep 1; echo processes.txt) | script -qec ./system_info.sh /dev/null
root        3944  0.0  0.0   2248  1388 ?        S    13:26   0:00 script -qec ./system_info.sh /dev/null
root        3946  0.0  0.0   2332  1380 pts/0    Ss+  13:26   0:00 sh -c ./system_info.sh
root        3947  0.0  0.0   3880  2804 pts/0    S+   13:26   0:00 /bin/bash ./system_info.sh
root        3956  0.0  0.0   6464  2484 pts/0    R+   13:26   0:00 ps aux
```

---

## Notes

- `#!/bin/bash` (shebang) tells the system to run the file with bash.
- `$(command)` runs a command and stores its output in a variable.
- `read -p "prompt" var` shows a prompt and saves what the user types into `var`.
- Variables are quoted (`"$dir_name"`) so names with spaces still work.
- `>` redirects the output of a command into a file (overwrite); `>>` appends.
- `chmod +x` adds execute permission so the script can be run as `./system_info.sh`.
