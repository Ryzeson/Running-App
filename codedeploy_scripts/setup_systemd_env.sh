#!/bin/bash
FILEPATH=/etc/systemd/system/running-app.service.d/environment.config
> $FILEPATH

PS_PARAMS=$(aws ssm get-parameters-by-path --path "/Running-App" | jq -r '.Parameters[] | (.Name | split("/")[-1] | ascii_upcase | gsub("-"; "_")) + "='\''" + .Value + "'\''"')

IPV4=$(TOKEN=`curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600"` && curl -H "X-aws-ec2-metadata-token: $TOKEN" -v http://169.254.169.254/latest/meta-data/public-ipv4)

echo "# /etc/systemd/system/running-app.service.d/environment.conf" >> $FILEPATH
echo "[Service]" >> $FILEPATH
echo "$PS_PARAMS" >> $FILEPATH
echo "IPV4=$IPV4" >> $FILEPATH

# We don't want quotes on the DB_PORT env variable, so remove them
sed -i "/DB_PORT/ s/'//g" $FILEPATH

cat $FILEPATH || echo