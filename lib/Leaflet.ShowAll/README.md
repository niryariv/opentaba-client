# Leaflet.ShowAll

Leaflet.ShowAll is a LeafletJS plugin that simply lets you jump from the high zoom level you are in to see all the (interesting part of the) map, pan around, and then either zoom in to other interesting areas or go back to your previous view.
The visual aspect of this plugin consists of one floating button on your map.

## Adding Show All Button
You can check out the [example](http://florpor.github.io/Leaflet.ShowAll/examples/) for this part.

All the plugin takes is one line of code to add:
    
    L.control.showAll({bounds: L.latLngBounds(L.latLng(50.725746, -4.726885), L.latLng(52.878810, 1.595746))}).addTo(map);

## Options
Customizable options are:

+ `bounds`: The only option that MUST be supplied. Needs to be a latLngBounds that defines the bounds to show when show all button is clicked.
+ `position`: The standard Leaflet.Control position parameter, used like all the other controls. Default: 'topleft'.
+ `title`: The tooltip shown when the user hovers over the button. Default: 'Show All'.
+ `icon`: The icon to be shown on the button. Default: 'icon-show-all' (taken from Elusive font by Aristeides Stathopoulos(c) using [fontello](http://fontello.com). See [font/LICENSE.txt](font/LICENSE.txt)).
