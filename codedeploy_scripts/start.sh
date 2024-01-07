#!/bin/bash

echo "Beginning start script"

echo "At `pwd`. Attempting to change directory"
cd ../

echo "At `pwd`. Running npm instal"
npm install
echo "Finished npm install"

echo "Start script finished"