# Networking Assignment

**Task 1:** Practice the networking commands from `session4-networking` (`ip.md`, `resources.md`) and the *Linux Networking Cheat Sheet* (session2-linux).
**Task 2:** Execute the commands, add the output / screenshots and explain what each command does.

Where commands were run:
- **Linux** – Ubuntu 22.04 machine `linux-hw` (IP `172.17.0.2`, accessed with `docker exec linux-hw ...`). nginx is running on it on port 80, used for the port tests.
- **macOS** – the host laptop (for `ifconfig en0`, macOS routing table and a full `traceroute`).

---

## IP addressing notes (from `ip.md`)

An **IP address** is a unique 32-bit number (IPv4) that identifies a device on a network, written as 4 octets `0.0.0.0 – 255.255.255.255`. A **subnet mask** separates the **network part** from the **host part**.

| Class | First octet | Default mask | CIDR | Network / host bits | Usable hosts per network | Private range |
|---|---|---|---|---|---|---|
| A | 1 – 126 (127 = loopback) | 255.0.0.0 | /8 | 8 / 24 | 2^24 − 2 = 16,777,214 | 10.0.0.0 – 10.255.255.255 |
| B | 128 – 191 | 255.255.0.0 | /16 | 16 / 16 | 2^16 − 2 = 65,534 | 172.16.0.0 – 172.31.255.255 |
| C | 192 – 223 | 255.255.255.0 | /24 | 24 / 8 | 2^8 − 2 = 254 | 192.168.0.0 – 192.168.255.255 |
| D | 224 – 239 | – | – | multicast | – | – |
| E | 240 – 255 | – | – | experimental | – | – |

Usable hosts = 2^(host bits) − 2 (network address and broadcast address are reserved).

Examples:
- `197.23.45.10/24` → network `197.23.45.0`, broadcast `197.23.45.255`, hosts `.1 – .254`.
- `120.27.1.0/8` → network `120.0.0.0`, broadcast `120.255.255.255`, 2^24 − 2 hosts.
- The Linux machine here has `172.17.0.2/16` → network `172.17.0.0`, broadcast `172.17.255.255` (a private Class B range), gateway `172.17.0.1`.

---

## 1. `ip addr`, `ifconfig`, `hostname -I` (Linux)

![ip addr](screenshots/01-ip-addr-ifconfig.png)

```bash
$ ip addr show lo
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host
       valid_lft forever preferred_lft forever

$ ip addr show eth0
11: eth0@if44: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 65535 qdisc noqueue state UP group default
    link/ether 8e:01:a9:a8:e1:48 brd ff:ff:ff:ff:ff:ff link-netnsid 0
    inet 172.17.0.2/16 brd 172.17.255.255 scope global eth0
       valid_lft forever preferred_lft forever

$ ip -br addr
lo               UNKNOWN        127.0.0.1/8 ::1/128
tunl0@NONE       DOWN
...
eth0@if44        UP             172.17.0.2/16

$ ifconfig eth0
eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 65535
        inet 172.17.0.2  netmask 255.255.0.0  broadcast 172.17.255.255
        ether 8e:01:a9:a8:e1:48  txqueuelen 0  (Ethernet)
        RX packets 1656  bytes 21079278 (21.0 MB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 1077  bytes 87379 (87.3 KB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

$ hostname -I
172.17.0.2
$ hostname
linux-hw
```

**What I understood:**
- `ip addr` (short `ip a`) lists every network interface with its state (`UP`), MAC address (`link/ether`), IPv4 (`inet`) and IPv6 (`inet6`) addresses with prefix length. `lo` is the loopback interface (`127.0.0.1`), `eth0` is the real network card.
- `ip -br addr` gives a brief one-line-per-interface view.
- `ifconfig` (old *net-tools* package) shows the same information plus RX/TX packet counters, with the mask written as `255.255.0.0` instead of `/16`. `ip` (iproute2) is the modern replacement.
- `hostname -I` prints only the IP addresses of the machine – handy in scripts.

## 2. `ip route`, `route`, `ip link` (Linux)

![ip route](screenshots/02-ip-route-link.png)

```bash
$ ip route
default via 172.17.0.1 dev eth0
172.17.0.0/16 dev eth0 proto kernel scope link src 172.17.0.2

$ route -n
Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         172.17.0.1      0.0.0.0         UG    0      0        0 eth0
172.17.0.0      0.0.0.0         255.255.0.0     U     0      0        0 eth0

$ ip route get 8.8.8.8
8.8.8.8 via 172.17.0.1 dev eth0 src 172.17.0.2 uid 0
    cache

$ ip link show eth0
11: eth0@if44: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 65535 qdisc noqueue state UP mode DEFAULT group default
    link/ether 8e:01:a9:a8:e1:48 brd ff:ff:ff:ff:ff:ff link-netnsid 0

$ ip -s link show eth0
11: eth0@if44: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 65535 qdisc noqueue state UP mode DEFAULT group default
    link/ether 8e:01:a9:a8:e1:48 brd ff:ff:ff:ff:ff:ff link-netnsid 0
    RX:  bytes packets errors dropped  missed   mcast
      21079278    1656      0       0       0       0
    TX:  bytes packets errors dropped carrier collsns
         87379    1077      0       0       0       0
```

**What I understood:**
- The routing table decides where packets go. `default via 172.17.0.1` = anything not matching another route goes to the gateway `172.17.0.1`. `172.17.0.0/16 dev eth0` = the local network is reached directly (no gateway).
- `route -n` is the old net-tools view; `UG` flag = route is Up and uses a Gateway; `-n` = don't resolve names.
- `ip route get <IP>` shows exactly which route, interface and source IP will be used for one destination – useful for troubleshooting.
- `ip link` shows layer-2 info (MAC, MTU, UP/DOWN); `-s` adds traffic and error statistics. From the cheat sheet, `ip link set eth0 up|down` and `ip addr add 192.168.1.1/24 dev eth0` change these settings.

## 3. `ping` (Linux)

![ping](screenshots/03-ping.png)

```bash
$ ping -c 4 google.com
PING google.com (142.251.106.101) 56(84) bytes of data.
64 bytes from cm-in-f101.1e100.net (142.251.106.101): icmp_seq=1 ttl=63 time=35.2 ms
64 bytes from cm-in-f101.1e100.net (142.251.106.101): icmp_seq=2 ttl=63 time=42.5 ms
64 bytes from cm-in-f101.1e100.net (142.251.106.101): icmp_seq=3 ttl=63 time=22.6 ms
64 bytes from cm-in-f101.1e100.net (142.251.106.101): icmp_seq=4 ttl=63 time=20.1 ms

--- google.com ping statistics ---
4 packets transmitted, 4 received, 0% packet loss, time 3009ms
rtt min/avg/max/mdev = 20.086/30.087/42.452/9.167 ms

$ ping -c 2 8.8.8.8
PING 8.8.8.8 (8.8.8.8) 56(84) bytes of data.
64 bytes from 8.8.8.8: icmp_seq=1 ttl=63 time=38.3 ms
64 bytes from 8.8.8.8: icmp_seq=2 ttl=63 time=47.8 ms

--- 8.8.8.8 ping statistics ---
2 packets transmitted, 2 received, 0% packet loss, time 1011ms
rtt min/avg/max/mdev = 38.296/43.055/47.814/4.759 ms

$ ping -c 2 -W 1 10.255.255.1          # unreachable address
PING 10.255.255.1 (10.255.255.1) 56(84) bytes of data.

--- 10.255.255.1 ping statistics ---
2 packets transmitted, 0 received, 100% packet loss, time 1028ms
```

**What I understood:** `ping` sends ICMP Echo Requests and waits for Echo Replies – it checks if a host is reachable and measures latency (`time=` round-trip time). `-c 4` = send 4 packets (on Linux ping runs forever without it), `-W 1` = wait 1 second for a reply. `ttl` is the hop limit. Pinging a name also proves DNS works; pinging an IP (8.8.8.8) checks connectivity without DNS. 100% packet loss means the host is down, unreachable or blocking ICMP.

## 4. `traceroute` (Linux and macOS)

![traceroute](screenshots/04-traceroute.png)

```bash
# Linux machine
$ traceroute -m 6 -q 1 8.8.8.8
traceroute to 8.8.8.8 (8.8.8.8), 6 hops max, 60 byte packets
 1  172.17.0.1 (172.17.0.1)  0.422 ms
 2  *
 3  *
 4  *
 5  *
 6  *

# macOS host
$ traceroute -m 12 -q 1 8.8.8.8
traceroute to 8.8.8.8 (8.8.8.8), 12 hops max, 40 byte packets
 1  wifi.height8tech.com (100.128.160.1)  10.035 ms
 2  202.131.146.145.convergentindia.com (202.131.146.145)  12.609 ms
 3  172.20.20.17 (172.20.20.17)  23.932 ms
 4  72.14.208.165 (72.14.208.165)  23.261 ms
 5  192.178.111.151 (192.178.111.151)  28.845 ms
 6  192.178.86.201 (192.178.86.201)  27.790 ms
 7  dns.google (8.8.8.8)  44.864 ms
```

**What I understood:** `traceroute` shows every router (hop) a packet passes through to reach the destination. It sends packets with TTL = 1, 2, 3 … and each router that drops the packet (TTL expired) replies, revealing itself. `-m` = max hops, `-q 1` = one probe per hop. On macOS the path is: Wi-Fi router → ISP → Google network → `dns.google` in 7 hops. `*` means a hop did not reply – on the Linux machine only the first hop (its gateway `172.17.0.1`) answers, because the NAT in front of it does not pass the "TTL exceeded" replies back. It is used to find *where* on the path a network problem is.

## 5. DNS – `nslookup`, `dig`, `host` (Linux)

![dns](screenshots/05-dns-nslookup-dig-host.png)

```bash
$ nslookup google.com
Server:		192.168.65.7
Address:	192.168.65.7#53

Non-authoritative answer:
Name:	google.com
Address: 142.251.106.101
Name:	google.com
Address: 142.251.106.138
...

$ dig github.com

; <<>> DiG 9.18.39-0ubuntu0.22.04.6-Ubuntu <<>> github.com
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 16010
;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 0

;; QUESTION SECTION:
;github.com.			IN	A

;; ANSWER SECTION:
github.com.		15	IN	A	20.207.73.82

;; Query time: 116 msec
;; SERVER: 192.168.65.7#53(192.168.65.7) (UDP)
;; WHEN: Mon Sep 28 13:28:23 UTC 2026
;; MSG SIZE  rcvd: 54

$ dig +short google.com
142.251.106.101
142.251.106.138
142.251.106.100
142.251.106.113
142.251.106.139
142.251.106.102

$ dig +short MX gmail.com
5 gmail-smtp-in.l.google.com.
40 alt4.gmail-smtp-in.l.google.com.
20 alt2.gmail-smtp-in.l.google.com.
10 alt1.gmail-smtp-in.l.google.com.
30 alt3.gmail-smtp-in.l.google.com.

$ dig +short NS google.com
ns1.google.com.
ns3.google.com.
ns2.google.com.
ns4.google.com.

$ host github.com
github.com has address 20.207.73.82
github.com mail is handled by 0 github-com.mail.protection.outlook.com.

$ host 8.8.8.8
8.8.8.8.in-addr.arpa domain name pointer dns.google.
```

**What I understood:** DNS converts domain names into IP addresses.
- `nslookup` – simple lookup; shows which DNS server answered (`192.168.65.7`) and the IPs. "Non-authoritative" = the answer came from a resolver's cache, not from Google's own name server.
- `dig` – detailed tool used by DevOps engineers: shows status (`NOERROR`), record type (`A`), **TTL** (`15` seconds the answer may be cached), query time and server. `+short` prints only the answer; `MX` = mail servers (lower number = higher priority), `NS` = authoritative name servers.
- `host` – shortest output; also does reverse lookup (IP → name, PTR record) as with `host 8.8.8.8`.

## 6. `curl -I` and `wget` (Linux)

![curl wget](screenshots/06-curl-wget.png)

```bash
$ curl -sI https://example.com
HTTP/2 200
date: Wed, 07 Oct 2026 13:29:19 GMT
content-type: text/html; charset=utf-8
server: cloudflare
last-modified: Sun, 04 Oct 2026 20:44:03 GMT
allow: GET, HEAD
accept-ranges: bytes
age: 4627
cf-cache-status: HIT
cf-ray: a46d4106ba1e31d5-BOM
alt-svc: h3=":443"; ma=86400

$ curl -sI http://github.com
HTTP/1.1 301 Moved Permanently
Content-Length: 0
Location: https://github.com/

$ curl -s -o /dev/null -w "HTTP %{http_code}  time %{time_total}s\n" https://www.google.com
HTTP 200  time 0.258653s

$ wget https://example.com -O example.html
--2026-09-28 13:28:48--  https://example.com/
Resolving example.com (example.com)... 104.20.23.154, 172.66.147.243
Connecting to example.com (example.com)|104.20.23.154|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: unspecified [text/html]
Saving to: 'example.html'

     0K                                                         259M=0s

2026-09-28 13:28:48 (259 MB/s) - 'example.html' saved [577]

$ ls -l example.html; head -c 120 example.html
-rw-r--r-- 1 root root 577 Oct  4  2026 example.html
<!doctype html><html lang=en><head><meta charset=utf-8><link rel=icon href=data:,><meta name=viewport content="width=dev
```

**What I understood:**
- `curl -I` sends an HTTP **HEAD** request and shows only the response headers: status code (`200 OK`, `301 Moved Permanently` → redirect to HTTPS shown in `Location`), server, content type, caching headers. Great for checking if a website/API is up without downloading the body (`-s` = silent).
- `curl -w "%{http_code}"` prints just the status code and total time – commonly used in health-check scripts.
- `wget` downloads a file to disk; output shows DNS resolution, TCP connection, HTTP status and the saved file. `-O` sets the output filename.

## 7. `ss`, `netstat`, `nc` – ports and connections (Linux)

![ss netstat nc](screenshots/07-ss-netstat-nc.png)

```bash
$ ss -tuln
Netid State  Recv-Q Send-Q Local Address:Port Peer Address:PortProcess
tcp   LISTEN 0      511          0.0.0.0:80        0.0.0.0:*
tcp   LISTEN 0      511             [::]:80           [::]:*

$ ss -tlnp | cut -c1-105
State  Recv-Q Send-Q Local Address:Port Peer Address:PortProcess
LISTEN 0      511          0.0.0.0:80        0.0.0.0:*    users:(("nginx",pid=3167,fd=6),("nginx",pid=316
LISTEN 0      511             [::]:80           [::]:*    users:(("nginx",pid=3167,fd=7),("nginx",pid=316

$ netstat -tulnp
Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name
tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN      3128/nginx: master
tcp6       0      0 :::80                   :::*                    LISTEN      3128/nginx: master

$ nc -zv localhost 80
Connection to localhost (::1) 80 port [tcp/http] succeeded!

$ nc -zv -w 2 localhost 8080
nc: connect to localhost (::1) port 8080 (tcp) failed: Connection refused
nc: connect to localhost (127.0.0.1) port 8080 (tcp) failed: Connection refused

$ nc -zv -w 3 google.com 443
Connection to google.com (192.178.174.102) 443 port [tcp/https] succeeded!

$ exec 3<>/dev/tcp/example.com/80; ss -tn state established; exec 3>&-
Recv-Q Send-Q Local Address:Port   Peer Address:PortProcess
0      0         172.17.0.2:34186 104.20.23.154:80
```

**What I understood:**
- `ss -tuln` lists listening sockets: `-t` TCP, `-u` UDP, `-l` listening only, `-n` numeric ports, `-p` the process owning the socket. Here nginx listens on port 80 on all IPv4 (`0.0.0.0`) and IPv6 (`[::]`) addresses.
- `netstat -tulnp` is the older net-tools equivalent (same flags); `ss` is faster and is its modern replacement.
- `ss -tn state established` shows active connections – here my machine `172.17.0.2:34186` connected to `example.com:80`.
- `nc -zv host port` (netcat) tests if a TCP port is open without sending data: `-z` scan only, `-v` verbose, `-w` timeout. "succeeded" = something is listening, "Connection refused" = nothing listening on that port. Very useful to check firewall / security group / service problems.

## 8. ARP, `/etc/hosts`, `/etc/resolv.conf` (Linux)

![arp hosts resolv](screenshots/08-arp-hosts-resolv.png)

```bash
$ arp -n
Address                  HWtype  HWaddress           Flags Mask            Iface
172.17.0.1               ether   26:b4:03:63:7f:97   C                     eth0

$ ip neigh
172.17.0.1 dev eth0 lladdr 26:b4:03:63:7f:97 REACHABLE

$ cat /etc/hosts
127.0.0.1	localhost
::1	localhost ip6-localhost ip6-loopback
fe00::	ip6-localnet
ff00::	ip6-mcastprefix
ff02::1	ip6-allnodes
ff02::2	ip6-allrouters
172.17.0.2	linux-hw

$ echo "127.0.0.1   myapp.local" >> /etc/hosts
$ getent hosts myapp.local
127.0.0.1       myapp.local
$ ping -c 1 myapp.local
PING myapp.local (127.0.0.1) 56(84) bytes of data.
64 bytes from localhost (127.0.0.1): icmp_seq=1 ttl=64 time=0.034 ms
...
$ curl -sI http://myapp.local
HTTP/1.1 200 OK
Server: nginx/1.18.0 (Ubuntu)
...

$ cat /etc/resolv.conf
# Generated by Docker Engine.
...
nameserver 192.168.65.7

$ grep hosts /etc/nsswitch.conf
hosts:          files dns
```

**What I understood:**
- **ARP** maps an IP address to a MAC address on the local network. `arp -n` (old) and `ip neigh` (new) show the ARP/neighbour cache – here the gateway `172.17.0.1` and its MAC, state `REACHABLE`.
- `/etc/hosts` is a local, static name → IP table. Adding `myapp.local` made it resolvable immediately without any DNS server (used for local testing).
- `/etc/resolv.conf` lists the DNS server(s) (`nameserver`) the system asks for names.
- `/etc/nsswitch.conf` `hosts: files dns` defines the order: first `/etc/hosts` (files), then DNS.

## 9. macOS host – `ifconfig`, routing table, `route`, `arp`

![macOS](screenshots/09-macos-host.png)

```bash
$ sw_vers
ProductName:		macOS
ProductVersion:		26.5.1
BuildVersion:		25F80

$ ifconfig en0
en0: flags=8863<UP,BROADCAST,SMART,RUNNING,SIMPLEX,MULTICAST> mtu 1500
	options=6460<TSO4,TSO6,CHANNEL_IO,PARTIAL_CSUM,ZEROINVERT_CSUM>
	ether 0a:22:91:2c:65:b2
	inet6 fe80::464:4f0d:8f6e:e87b%en0 prefixlen 64 secured scopeid 0xb
	inet 100.128.174.202 netmask 0xfffff000 broadcast 100.128.175.255
	nd6 options=201<PERFORMNUD,DAD>
	media: autoselect
	status: active

$ ipconfig getifaddr en0
100.128.174.202

$ netstat -rn -f inet | head -8
Routing tables

Internet:
Destination        Gateway            Flags               Netif Expire
default            100.128.160.1      UGScg                 en0
100.128.160/20     link#11            UCS                   en0      !
100.128.160.1/32   link#11            UCS                   en0      !
100.128.160.1      d0:ea:11:32:0:19   UHLWIir               en0   1115

$ route -n get default
   route to: default
destination: default
       mask: default
    gateway: 100.128.160.1
  interface: en0
      flags: <UP,GATEWAY,DONE,STATIC,PRCLONING,GLOBAL>
 recvpipe  sendpipe  ssthresh  rtt,msec    rttvar  hopcount      mtu     expire
       0         0         0         0         0         0      1500         0

$ arp -n 100.128.160.1
? (100.128.160.1) at d0:ea:11:32:0:19 on en0 ifscope [ethernet]
```

**What I understood:** macOS has no `ip` command; it uses BSD tools. `en0` is the Wi-Fi interface with IP `100.128.174.202` and mask `0xfffff000` = `255.255.240.0` = **/20** (2^12 − 2 = 4094 usable hosts, network `100.128.160.0`). `netstat -rn` / `route get default` show the default gateway `100.128.160.1` (the Wi-Fi router), and `arp` shows that router's MAC address.

## 10. `whois` (optional, Linux)

![whois](screenshots/10-whois.png)

```bash
$ whois google.com | grep -E "Domain Name|Registrar:|Creation Date|Registry Expiry|Name Server" | head -10
   Domain Name: GOOGLE.COM
   Creation Date: 1997-09-15T04:00:00Z
   Registry Expiry Date: 2028-09-14T04:00:00Z
   Registrar: MarkMonitor Inc.
   Name Server: NS1.GOOGLE.COM
   Name Server: NS2.GOOGLE.COM
   Name Server: NS3.GOOGLE.COM
   Name Server: NS4.GOOGLE.COM
Domain Name: google.com
Creation Date: 1997-09-15T07:00:00+0000
```

**What I understood:** `whois` queries the domain registry and shows who registered a domain, the registrar, creation/expiry dates and the authoritative name servers.

---

## Summary – command reference

| Command | Purpose |
|---|---|
| `ip a` / `ifconfig` | Show interfaces and IP addresses |
| `hostname -I` | Print the machine's IP addresses |
| `ip route` / `route -n` / `netstat -rn` | Show routing table and default gateway |
| `ip route get <ip>` | Which route/interface is used for an IP |
| `ip link` / `ip -s link` | Interface state, MAC, MTU, statistics |
| `ip neigh` / `arp -n` | ARP table (IP → MAC) |
| `ping -c N host` | Reachability and latency (ICMP) |
| `traceroute host` | Path (hops) to a host |
| `nslookup` / `dig` / `host` | DNS lookups (A, MX, NS, PTR records) |
| `curl -I url` | HTTP response headers / status |
| `wget url` | Download a file |
| `ss -tulnp` / `netstat -tulnp` | Listening ports and owning processes |
| `nc -zv host port` | Test if a TCP port is open |
| `/etc/hosts`, `/etc/resolv.conf`, `/etc/nsswitch.conf` | Local name table, DNS servers, lookup order |
| `whois domain` | Domain registration info |
