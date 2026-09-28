#!/usr/bin/env bash
# ==============================================================================
# Script: load_generator.sh
# Purpose: Generate traffic against a Service from INSIDE the cluster to trigger
#          HPA scaling.
#
# Adapted from the class hpa/load_generator.sh: the original pointed at a
# "yatri-backend" Service (no matching Deployment in the repo) and pushed the
# traffic through a single "kubectl port-forward" from the laptop, which only
# reaches one Pod. This version starts N busybox Pods running a wget loop
# against the Service DNS name, so load is spread across all replicas.
#
# Usage:  ./load_generator.sh [service-url] [workers] [namespace]
#         ./load_generator.sh stop [namespace]
# ==============================================================================
set -euo pipefail

if [[ "${1:-}" == "stop" ]]; then
  NS="${2:-default}"
  kubectl delete pod -n "$NS" -l role=load-generator --ignore-not-found
  exit 0
fi

TARGET_URL="${1:-http://hpa-demo-service}"
WORKERS="${2:-3}"
NS="${3:-default}"

echo "=================================================="
echo "      KUBERNETES HPA TRAFFIC LOAD GENERATOR       "
echo "=================================================="
echo "Target: $TARGET_URL   Workers: $WORKERS   Namespace: $NS"

for i in $(seq 1 "$WORKERS"); do
  kubectl run "load-generator-$i" -n "$NS" --image=busybox:1.36 --restart=Never \
    --labels=role=load-generator -- \
    /bin/sh -c "while true; do wget -q -O- $TARGET_URL > /dev/null; done"
done

echo "Traffic load active! Watch with: kubectl get hpa -n $NS -w"
echo "Stop with: $0 stop $NS"
