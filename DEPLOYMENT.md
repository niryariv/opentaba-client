##Deploy a New Municipality
To deploy a website for a brand new municipality, follow these steps:
(The steps use givataiim as example. You should change that to whatever
municipality you are deploying)
1. Make sure both the geojson and topojson files with the name of the municipality
   have been added to [this repository](http://github.com/niryariv/israel_gushim)
2. Add the data about the new municipality and the topojson gush map for it:
   `fab add_gush_map:givataiim,גבעתיים`
3. The changes will be made locally and not comitted so you can review them.
   If any more properties need to be added to data/index.js (in compliance
   to the [Municipality Index File](#Municipality Index File). When done,
   commit the changes and push to origin.
4. Now it's time to actually create the new site. Run:
   `fab create_site:givataiim`
5. Add a new hostname (subdomain) in your domain management control panel. Set
   the name to your municipality's name (givataiim for this example), record
   type to "CNAME (Alias)" and url to "<your-github-account>.github.io."ץ
   It will take a few minutes to make the link (DNS and Github).

##Municipality Index File
The municipality index file resides in "data/index.js", and has some needed
information about each municipality.

Mandatory fields:
+ "display" - the Hebrew (or whatever) display name for the municipality
+ "center" - the center point of the municipality's gush map

Optional fields:
+ "server" - the base url for the server that hosts this municipality's plans.
  If not defined it is "http://opentaba-server-<muni-name>.herokuapp.com/"
+ "file" - path in the repository to the municipality's gush map.
  If not defined it is "data/<muni-name>.topojson"
+ "fb_link" - link to the municipality's facebook page.
  If not defined the facebook icon will open a "share on facebook" window
+ "twitter_link" - link to the municipality's twitter page.
  If not defined the twitter icon will open a "tweet" window
