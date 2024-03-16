#!/bin/bash

echo "Beginning npm_install.sh"

echo "At `pwd`. Attempting to change directory"
cd /home/ec2-user/Running-App

echo "At `pwd`. Running npm install"
npm install
echo "Finished npm install"

echo "Completed npm_install.sh"