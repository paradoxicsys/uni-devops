# Docker Networking & Volumes Homework

> `docker pull` from `docker.io` failed with a TLS "certificate is not yet valid" error (laptop clock was behind), so the official images were pulled through `mirror.gcr.io` and tagged with their normal names.

## Task 1: User-defined bridge networks

| Container | Image | Networks |
|---|---|---|
| `dn-frontend` | `nginx:alpine` | `dn-frontend-net` |
| `dn-backend` | `nginx:alpine` | `dn-frontend-net` + `dn-backend-net` |
| `dn-database` | `mysql:8.4` | `dn-backend-net` + `dn-db-net` |

The backend sits on two networks; the frontend has no route to the database.

```bash
docker network create dn-frontend-net
docker network create dn-backend-net
docker network create dn-db-net

docker run -d --name dn-frontend --network dn-frontend-net nginx:alpine
docker run -d --name dn-backend  --network dn-frontend-net nginx:alpine
docker network connect dn-backend-net dn-backend

docker run -d --name dn-database --network dn-backend-net -e MYSQL_ROOT_PASSWORD=root mysql:8.4
docker network connect dn-db-net dn-database
```

![create](screenshots/task1-01-create.png)

![network ls / inspect](screenshots/task1-02-network-ls.png)

![backend in 2 networks](screenshots/task1-03-backend-two-networks.png)

### Connectivity checks

```bash
docker exec dn-frontend ping -c 2 dn-backend                 # allowed
docker exec dn-backend  nc -zv -w 3 dn-database 3306         # allowed
docker exec dn-frontend ping -c 2 -W 2 dn-database           # blocked: name does not resolve
```

![allowed](screenshots/task1-04-allowed.png)

![blocked](screenshots/task1-05-blocked.png)

| From → To | Result |
|---|---|
| frontend → backend | ✅ ping + HTTP OK |
| backend → database (3306) | ✅ port open |
| db-net client → database | ✅ `mysqld is alive` |
| frontend → database | ❌ no shared network |
| database → frontend | ❌ no shared network |
| db-net client → backend | ❌ no shared network |

## Task 2: Apache (httpd) on the host network

```bash
docker pull httpd
docker run -d --name dn-apache-host --network host httpd
docker ps --filter name=dn-apache-host
docker run --rm --network host curlimages/curl -si http://localhost:80
```

![pull](screenshots/task2-00-pull.png)

![run](screenshots/task2-01-run.png)

![access](screenshots/task2-02-access.png)

`PORTS` is empty since host mode has no port mapping; `localhost:80` returns "It works!". On Docker Desktop for Mac, "host" is the Linux VM, so a plain `curl localhost:80` from macOS gets no answer.

![mac side](screenshots/task2-03-mac-side.png)

## Task 3: Bind mount

Folder: [`bind-mount-site/`](bind-mount-site) with `index.html` ("Hello students").

```bash
docker run -d --name dn-nginx-bind -p 8095:80 \
  -v "$PWD/bind-mount-site":/usr/share/nginx/html nginx:alpine
```

![run](screenshots/task3-01-run.png)

![browser before](screenshots/task3-02-browser-before.png)

Editing `index.html` on the host changes the page immediately, without restarting the container (same ID, `RestartCount=0`).

![modify](screenshots/task3-03-modify.png)

![browser after](screenshots/task3-04-browser-after.png)

## Task 4: Overlay networks (research)

- **What:** a Docker network driver (`-d overlay`) that creates one virtual network spanning multiple Docker hosts in a Swarm cluster.
- **Use cases:** Swarm services with replicas on many nodes, private multi-host communication, isolating stacks, and standalone containers across hosts (`--attachable`).
- **How it works:** VXLAN wraps container traffic in UDP (port 4789) between hosts; nodes share endpoint info via gossip (7946); management uses 2377; embedded DNS gives each service a virtual IP.
- **Encryption:** optional with `--opt encrypted` (IPsec).

```bash
docker swarm init --advertise-addr <MANAGER-IP>
docker network create -d overlay --attachable --opt encrypted my-overlay
docker service create --name api --network my-overlay --replicas 3 nginx:alpine
```

## Extra exercise: named volume persistence

```bash
docker volume create dn-data
docker run --rm -v dn-data:/data alpine sh -c 'echo "saved ..." > /data/note.txt'
docker run --rm -v dn-data:/data alpine cat /data/note.txt
```

![named volume](screenshots/extra-named-volume.png)

The data is still there after the first container is removed.

## Cleanup

![cleanup](screenshots/cleanup.png)
