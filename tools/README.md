Tools and scripts for OpenTABA client
=====================================

setup_proxy_server.sh
---------------------
Script for setting up a new server to proxy communications to our
opentaba-client site, in order to support any subdomain while hosting
the site on Github pages. The server will also proxy map requests to
Github's API, so that IE < 10 is supported, because of CORS problems
with their XDomainRequest (replaced in IE 10 with the normal
XMLHttpRequest).
This script is intended for auto-configuring a new Google Cloud server,
and was only tested under those conditions.

Requirements:

+ A debian-based server (the script uses apt-get for installing stuff)
+ Perl to be installed on the server
+ Curl on the client for testing the results
+ SSH admission to the server with sudo privileges

Usage:

```
./setup_proxy_server.sh <username> <server>
```
