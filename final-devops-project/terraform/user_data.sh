#!/bin/bash
# Minimal web page proving the instance was provisioned by Terraform
dnf install -y nginx
TOKEN=$(curl -s -X PUT http://169.254.169.254/latest/api/token -H 'X-aws-ec2-metadata-token-ttl-seconds: 60')
IID=$(curl -s -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/instance-id)
echo "<h1>uni-devops final project</h1><p>instance $IID provisioned by Terraform</p>" > /usr/share/nginx/html/index.html
systemctl enable --now nginx
