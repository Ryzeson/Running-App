#!/bin/bash

echo "Beginning application_start script"

echo "Change the permissions of server.js so that systemd can access it"
cd /home/ec2-user/Running-App
chmod +x server.js 

echo "Start the application again via systemd"
systemctl start running-app
