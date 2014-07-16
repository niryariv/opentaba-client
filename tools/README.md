Tools and scripts for OpenTABA
==============================

add_muni.py
-----------
Script for adding a new municipality to the website

Steps:

+ Get a GeoJSON file representing the gushim map of the new municipality
+ Run the add_muni.py script like so:
```
Usage: add_muni.py [options]

Options:
  -h, --help            show this help message and exit
  -c CLIENT_DIR         Mandatory, path to the opentaba client directory, eg.
						"../../opentaba-client"
  -g GUSHIM_FILE        Mandatory, local path to the new gushim file in the
						opentaba client directory, eg.
						"data/gushim/jerusalem.gush.js"
  -s SERVER_DIR         Mandatory, path to the opentaba server directory, eg.
						"../../opentaba-server"
  -n MUNI_NAME          Mandatory, name of the municipality without special
						symbols (for subdomain), eg. "batyam"
  -d MUNI_DISPLAY_NAME  Mandatory, display name for municipality (if having
						Hebrew problems just replace in index file after
						script), eg. "בת-ים"
  -i INDEX_FILE         Local path to the municipality index file in the
						opentaba client directory, default="data/index.js"
  -t TOPO_OUTPUT_DIR    Local path to the output topojson file directory,
						default="data"
  -f TOPO_FILE_NAME     File name for the output topojson file, default
						="[geojson-file-name].json"
  -v                    Print verbose debugging information
```
 (eg. ./add_muni.py -c ../ -g data/geojson/jerusalem.gush.js -s ../../opentaba-server -n jerusalem -d ירושלים -f jerusalem.json)
 
 > **The script will do the following:**
 > - Calculate the center point for the new municipality
 > - Add the new municipality to the index.js file
 > - Convert the GeoJSON file to TopoJSON
 > - Add the gush numbers to the tools/gushim.py file in the server repository
 > - Update the test_scrape.py test file with the new number of gushim
 
+ Make sure the changes made locally are good and tests are succeeding, commit and push to client and server master branches, then:
  1. For Server
    1. Push changes to heroku remote
    2. Enter bash environment on heroku dyno and run `python tools/update_db.py --force` so the new gushim would be added to mongo
    3. If you want - run `python scrape.py` and `python worker.py` to start scraping now, or wait for the scheduled scraping
  2. For Client
    1. Register a virtual sub-domain with the MUNI_NAME you supplied the script
    2. Merge changes to gh-pages branch 
