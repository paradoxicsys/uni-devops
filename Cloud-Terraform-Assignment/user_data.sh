#!/bin/bash
dnf install -y nginx
TOKEN=$(curl -s -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 300")
IID=$(curl -s -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/instance-id)
AZ=$(curl -s -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/placement/availability-zone)
cat > /usr/share/nginx/html/index.html <<HTML
<!doctype html>
<html><head><title>Hello from Terraform</title></head>
<body style="font-family:sans-serif;text-align:center;margin-top:60px">
<h1>Hello from Terraform</h1>
<p>nginx on EC2 ($IID) in $AZ</p>
<p>Provisioned by Terraform - Session 19 Cloud Terraform Assignment</p>
</body></html>
HTML
systemctl enable --now nginx
