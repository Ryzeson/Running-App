#!/bin/bash

echo "Beginning before_install script"

echo "Stopping application running via systemd"
systemctl stop running-app
