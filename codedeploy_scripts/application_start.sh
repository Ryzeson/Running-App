#!/bin/bash

echo "Beginning application_start script"

echo "Change the permissions of server.js so that systemd can access it"
chmod +x server.js 

echo "Start the application again via systemd"
systemctl start running-service
