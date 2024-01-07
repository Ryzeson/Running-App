#!/bin/bash

echo "Beginning after_install script"

echo "At `pwd`. Attempting to change directory"
cd /home/ec2-user/Running-App

echo "At `pwd`. Running npm instal"
npm install
echo "Finished npm install"

echo "Start script finished"