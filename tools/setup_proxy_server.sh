#!/bin/bash

# usage eg.: ./setup_proxy_server.sh googlegod 8.8.8.8
if [ $# != 2 ]; then
    echo "USAGE: $0 <username> <server>"
    exit
fi

# ssh to the server and run the following commands remotely
ssh $1@$2 "
# update sources list
sudo apt-get update
# upgrade any packages that have updates
sudo apt-get -y dist-upgrade
# install nginx
sudo apt-get install nginx
# update nginx configuration for proxying opentaba-client and the maps
sudo perl -i -pe 'BEGIN{undef $/;} s/^[\t ]*location \/ {.*?[\t ]*}$/\tlocation \/maps\/ \{\n\t\t\# This is for IE \< 10 compatibility\. Since we don'\''t\n\t\t\# operate a HTTPS site and Github forces API calls\n\t\t\# to be HTTPS\, we proxy these requests so the CORS\n\t\t\# will work\, thinking it'\''s doing HTTP\n\t\tproxy_pass https\:\/\/api\.github\.com\/repos\/niryariv\/israel_gushim\/contents\/\;\n\n\t\t\# This isn'\''t necessary because the client does it\,\n\t\t\# but we could enforce it here if we wanted\n\t\t\#proxy_set_header Accept application\/vnd\.github\.raw\;\n\n\t\tproxy_connect_timeout 60s\;\n\t\tproxy_send_timeout 60s\;\n\t\tproxy_read_timeout 60s\;\n\t\tsend_timeout 60s\;\n\t\}/smg' /etc/nginx/sites-available/default
sudo perl -i -pe 'BEGIN{undef $/;} s/^[\t ]*location \/doc\/ {.*?[\t ]*}$/\tlocation \/ \{\n\t\tproxy_pass http\:\/\/jerusalem\.opentaba\.info\/;\n\n\t\tproxy_connect_timeout 60s\;\n\t\tproxy_send_timeout 60s\;\n\t\tproxy_read_timeout 60s\;\n\t\tsend_timeout 60s\;\n\t\}/smg' /etc/nginx/sites-available/default
# add nginx to the defaults group so it would start on boot
sudo update-rc.d nginx defaults
# start nginx
sudo service nginx start
"

# it takes a few seconds for the server to respond
echo "Waiting 10 seconds for the server to settle..."
sleep 10

# get the server's main page and make sure it's opentaba, then get
# jerusalem's map from the map proxy and make sure it works
if [[ -z $(curl $2 2>/dev/null | grep "Jerusalem, winter 2013") ]]; then
    echo "The server doesn't proxy communications to opentaba-client!"
    echo "Check the output of this script to see if anything went wrong..."
elif [[ -z $(curl $2/maps/jerusalem.topojson 2>/dev/null | grep "jerusalem.topojson") ]]; then
    echo "The server doesn't proxy map requests to Github!"
    echo "Check the output of this script to see if anything went wrong..."
else
    echo "All done! Please link your domain to $2"
fi
