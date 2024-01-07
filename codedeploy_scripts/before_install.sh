#!/bin/bash

echo "Beginning before_install script"

echo "Stopping application running via systemd"
systemdctl stop running-service
