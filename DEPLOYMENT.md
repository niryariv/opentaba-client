##Municipality Index File
The municipality index file resides in "munis.js", and has some needed
information about each municipality.

Mandatory fields:
+ "display" - the Hebrew (or whatever) display name for the municipality

Optional fields:
+ "server" - the base url for the server that hosts this municipality's plans.
  If not defined it is "http://opentaba-server-<muni-name>.herokuapp.com/"
+ "center" - the center point of the municipality's gush map
+ "bounds" - the boundaries to the municipality. the user will not be able
  to go past these.
+ "file" - path in the repository to the municipality's gush map.
  If not defined it is "https://api.github.com/repos/niryariv/israel_gushim/contents/{muni_name}.topojson"
  This file will be downloaded using Github's contents API, so it must not 
  exceed 1MB in size. Files from other static hosts will probably be loaded fine
  as long as the "Accept" header is ignored.
+ "fb_link" - link to the municipality's facebook page.
  If not defined the facebook icon will open a "share on facebook" window
+ "twitter_link" - link to the municipality's twitter page.
  If not defined the twitter icon will open a "tweet" window
+ "css" - local path to css file for unique design of municipality's site.
  An example file can be found in [css/municipalities/example.css](https://github.com/niryariv/opentaba-client/blob/master/css/municipalities/example.css)
