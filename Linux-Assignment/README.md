# Linux Assignment

All commands were run on **Ubuntu 22.04** with systemd as PID 1 (machine `linux-hw`, accessed with `docker exec linux-hw ...`).

## Task 1 – Soft Link vs Hard Link

| Point | Hard link | Soft (symbolic) link |
|---|---|---|
| Inode | **Same** inode as the original | **Own** inode, stores the target path |
| Cross filesystem / directories | **Not allowed** | **Allowed** |
| Original deleted | Data **still accessible** | Link becomes **dangling** |
| Command | `ln target link` | `ln -s target link` |

### Create both links

```bash
$ ln original.txt hardlink.txt
$ ln -s original.txt softlink.txt
$ ls -li
759487 -rw-r--r-- 2 root root 29 Sep 28 13:21 hardlink.txt
759487 -rw-r--r-- 2 root root 29 Sep 28 13:21 original.txt
759488 lrwxrwxrwx 1 root root 12 Sep 28 13:21 softlink.txt -> original.txt
```

![create links](screenshots/01-create-links.png)

### Delete the original file

```bash
$ rm original.txt
$ cat hardlink.txt
Hello from the original file
$ cat softlink.txt
cat: softlink.txt: No such file or directory
```

![delete original](screenshots/02-delete-original.png)

### Directories and cross filesystem

```bash
$ ln mydir mydir-hard
ln: mydir: hard link not allowed for directory
$ ln /proc/version version-hard
ln: failed to create hard link 'version-hard' => '/proc/version': Invalid cross-device link
```

Both work with `ln -s`.

![dir and cross fs](screenshots/03-dir-and-delete-links.png)

## Task 2 – `adduser` vs `useradd`

| | `useradd` | `adduser` |
|---|---|---|
| Type | Low-level binary, on every distro | Friendly Perl script (Debian/Ubuntu) that calls `useradd` |
| Home directory | Not created by default (needs `-m`) | Created and filled from `/etc/skel` |
| Shell / password | `/bin/sh`, no password set | `/bin/bash`, prompts for password |

**Preferred on Ubuntu:** `adduser`, because it creates a ready-to-use user (home, shell, password). `useradd` is better for scripts.

### Create a user with `adduser`

```bash
$ adduser --disabled-password --gecos "" testuser
$ grep testuser /etc/passwd
testuser:x:1000:1000:,,,:/home/testuser:/bin/bash
```

![adduser](screenshots/04-adduser.png)

### `useradd` for contrast

```bash
$ useradd testuser2
$ grep testuser2 /etc/passwd
testuser2:x:1001:1001::/home/testuser2:/bin/sh
$ ls -ld /home/testuser2
ls: cannot access '/home/testuser2': No such file or directory
```

![useradd](screenshots/05-useradd.png)

### Clean up

`deluser --remove-home testuser`, `userdel testuser2`, `userdel -r testuser3`

![cleanup](screenshots/06-user-cleanup.png)

## Task 3 – `journalctl`

`journalctl` reads the logs collected by systemd-journald (kernel, boot and service logs). Common options: `-n 20` last lines, `-f` follow, `-u nginx` one service, `-b` current boot, `--since "10 minutes ago"`, `-p err` errors only, `-xe` end of log with explanations.

### Install nginx to practice on

`apt-get install -y nginx`, then `systemctl start nginx && systemctl enable nginx`.

![install nginx](screenshots/07-install-nginx.png)

### System logs

`journalctl -n 10 --no-pager`, `journalctl --list-boots`, `journalctl --disk-usage`

![system logs](screenshots/08-journalctl-system.png)

### Service logs

```bash
$ systemctl restart nginx
$ journalctl -u nginx -n 2 --no-pager
Sep 28 13:22:51 linux-hw systemd[1]: Starting A high performance web server and a reverse proxy server...
Sep 28 13:22:51 linux-hw systemd[1]: Started A high performance web server and a reverse proxy server.
```

![nginx logs](screenshots/09-journalctl-nginx.png)

### Troubleshooting a failed service

A broken config was added on purpose, the error was found with `journalctl -u nginx -p err`, then fixed.

```bash
$ echo "this is not valid nginx syntax" > /etc/nginx/conf.d/broken.conf
$ systemctl restart nginx
Job for nginx.service failed because the control process exited with error code.
$ journalctl -u nginx -p err --no-pager
Sep 28 13:22:55 linux-hw systemd[1]: Failed to start A high performance web server and a reverse proxy server.
```

![nginx error](screenshots/10-journalctl-nginx-error.png)

### Following logs live

`timeout 4 journalctl -u nginx -f -n 0 & sleep 1; systemctl reload nginx; wait`

![follow](screenshots/11-journalctl-follow.png)

## Task 4 – Linux Command Cheat Sheet

| Category | Commands |
|---|---|
| Files & dirs | `pwd`, `ls -ltr`, `cd`, `mkdir -p`, `touch`, `cp -r`, `mv`, `rm -r`, `ln -s` |
| Viewing | `cat`, `head`, `tail -f`, `less`, `wc -l` |
| Search & text | `find`, `grep -inrv`, `sed`, `awk`, `sort`, `uniq -c` |
| Permissions | `chmod 755`, `chown user:group`, `umask` |
| Processes | `ps aux`, `top`, `pgrep`, `pkill`, `kill -9`, `nohup`, `systemctl`, `journalctl` |
| Disk & memory | `df -h`, `du -sh`, `free -h`, `lsblk` |
| Archive | `tar -czvf`, `tar -tzvf`, `tar -xzf` |
| System info | `uname -a`, `hostname`, `whoami`, `date`, `uptime` |
| Users & packages | `adduser`, `useradd`, `usermod -aG`, `passwd`, `id`, `apt install` |
| Network | `ip a`, `ss -tuln`, `curl -I`, `ping` |

### 1. File & directory operations

`mkdir -p`, `touch`, `cp`, `mv`, `rm -r`, `ls -lR`, `head` / `tail`

![file ops](screenshots/12-file-dir-ops.png)

### 2. Permissions

```bash
$ chmod 755 script.sh && ./script.sh
hello from script
$ chown appuser:appuser app.conf
```

![permissions](screenshots/13-permissions.png)

### 3. `find`, `grep`, `sed`, `awk`

```bash
$ awk '{print $3}' app.log | sort | uniq -c
      2 ERROR
      2 INFO
      1 WARN
```

![text processing](screenshots/14-find-grep-sed-awk.png)

### 4. Processes

`ps aux`, `top -b -n 1`, `nohup sleep 300 &`, `pgrep -a sleep`, `pkill sleep`

![processes](screenshots/15-processes.png)

### 5. Disk, memory and archives

`df -h`, `du -sh /var/log`, `free -h`, `tar -czvf practice-backup.tar.gz ...`, `tar -xzf practice-backup.tar.gz -C restore`

![disk and tar](screenshots/16-disk-memory-archive.png)

### 6. System information

`uname -a`, `hostname`, `whoami`, `date`, `lsblk`

![system info](screenshots/17-system-info.png)
