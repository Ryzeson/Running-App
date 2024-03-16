#!/bin/bash
echo "Beginning stop_service.sh"

echo "Stopping the application via systemd, if it is currently running"
systemctl stop running-app

# systemctl is-active running-app && systemctl stop running-app

echo "Completed stop_service.sh"