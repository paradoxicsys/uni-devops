# Kubernetes Storage, HPA & Probes – Assignment

Environment: minikube (Kubernetes v1.37, containerd, arm64) with the `metrics-server` addon. Images are pulled through the `mirror.gcr.io` Docker Hub mirror configured in the node's containerd (`/etc/containerd/certs.d/docker.io/hosts.toml`).

| Task | Folder | Contents |
| :--- | :--- | :--- |
| 1 – Kubernetes volumes | [`01-kubernetes-volumes/`](01-kubernetes-volumes/README.md) | emptyDir, hostPath, PV, PVC, StorageClass, dynamic provisioning |
| 2 – HPA hands-on | [`02-hpa/`](02-hpa/README.md) | HPA YAML, load generator, HPA output (`hpa-output/`) |
| Probes | [`03-probes/`](03-probes/README.md) | liveness / readiness / startup |
| 3 – Mini project | [`04-mini-project/`](04-mini-project/README.md) | namespace, PVC, deployment + probes, service, HPA |
| Screenshots | [`screenshots/`](screenshots) | |

Fixes made to class files:
* `02-persistent-storage/pvc.yaml`: added `storageClassName: ""`. Without it, the default `standard` StorageClass provisioned a new PV instead of binding to `student-pv`.
* `hpa/load_generator.sh`: now targets an existing Service and runs its workers as in-cluster Pods. The original used a non-existent `yatri-backend` Service through a single port-forward.
