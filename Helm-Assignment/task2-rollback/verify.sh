#!/usr/bin/env bash
# Verify the running revision: deployment image/replicas + HTTP response via port-forward
REL="${1:-web}"
kubectl get deploy "$REL-app" -o wide
kubectl port-forward "svc/$REL-svc" 18080:80 >/dev/null 2>&1 &
PF=$!; sleep 2
echo "curl http://localhost:18080 ->"; curl -s http://localhost:18080
kill $PF
