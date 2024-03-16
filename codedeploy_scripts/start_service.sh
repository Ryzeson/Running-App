#!/bin/bash

echo "Beginning start_service.sh"

echo "Change the permissions of server.js so that systemd can access it"
cd /home/ec2-user/Running-App
chmod +x server.js 

echo "Start the application again via systemd"
systemctl start running-app

echo "Completed start_service.sh"