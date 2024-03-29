#!/bin/bash
echo "Beginning setup_systemd_env.sh"

FILEPATH=/etc/systemd/system/running-app.service.d/environment.config
> $FILEPATH

# Retrieve and parse all environment variables stored for this application in AWS Parameter Store
# https://www.geekcafe.com/blog/how-to-load-parameter-store-values-into-an-ec2s-environment-variables
PS_PARAMS=$(aws ssm get-parameters-by-path --path "/Running-App" | jq -r '.Parameters[] | (.Name | split("/")[-1] | ascii_upcase | gsub("-"; "_")) + "='\''" + .Value + "'\''"')

# Get this EC2 isntance's IPV4 address by querying instance metadata
IPV4=$(TOKEN=`curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600"` && curl -H "X-aws-ec2-metadata-token: $TOKEN" -v http://169.254.169.254/latest/meta-data/public-ipv4)

# Create the environment.conf file with these variables in it
echo "# /etc/systemd/system/running-app.service.d/environment.conf" >> $FILEPATH
echo "[Service]" >> $FILEPATH
echo "$PS_PARAMS" >> $FILEPATH
echo "IPV4=$IPV4" >> $FILEPATH
echo "PORT=443" >> $FILEPATH

# We don't want quotes on the DB_PORT env variable, so remove them
sed -i "/DB_PORT/ s/'//g" $FILEPATH

# Output the generated file to the logs
cat $FILEPATH || echo

echo "Completed setup_systemd_env.sh"