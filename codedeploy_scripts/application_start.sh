#!/bin/bash

echo "Beginning application_start script"

echo "Start the application again via systemd"
systemdctl start running-service
