L.Control.ShowAll = L.Control.extend({
    options: {
        bounds: null, // bounds to show in show-all mode
        position: 'topleft',
        title: 'Show All', // tooltip
        icon: 'icon-show-all', // button icon
    },
    
    initialize: function(options) {
        for (var i in options) {
            this.options[i] = options[i];
        }
    },

    onAdd: function(map) {
        var container = L.DomUtil.create('div', 'leaflet-control-showall leaflet-bar leaflet-control');

        // make sure bounds were given
        if (!(this.options.bounds instanceof L.LatLngBounds)) {
            console.error('Leaflet.ShowAll - bounds must be supplied and must be a LatLngBounds');
            return container;
        }

        this.link = L.DomUtil.create('a', 'leaflet-bar-part', container);
        L.DomUtil.create('i', 'fa fa-lg ' + this.options.icon , this.link);
        this.link.href = '#';
        this.link.title = this.options.title;

        L.DomEvent.on(this.link, 'click', this.onClick, this)
            .on(this.link, 'dblclick', L.DomEvent.stopPropagation);
        
        this._container = container;
        
        // event hooks
        map.on('zoomstart', this.onZoom, this);

        return container;
    },

    onClick: function(e) {
        L.DomEvent.stopPropagation(e);
        L.DomEvent.preventDefault(e);
        
        // start/stop show-all mode
        if (L.DomUtil.hasClass(this._container, "active"))
            this._endShowAll(true);
        else
            this._startShowAll();
    },
    
    onZoom: function(e) {
        // stop show-all mode if on
        if (L.DomUtil.hasClass(this._container, "active"))
            this._endShowAll(false);
    },
    
    _startShowAll: function() {
        // save current zoom and bounds
        this.oldZoom = this._map.getZoom();
        this.oldBounds = this._map.getBounds();
        this.oldMaxBounds = this._map.options.maxBounds;
        
        // fit to supplied bounds
        this._map.setMaxBounds(this.options.bounds);
        this._map.fitBounds(this.options.bounds);
        
        L.DomUtil.addClass(this._container, "active");
    },
    
    _endShowAll: function(restore) {
        L.DomUtil.removeClass(this._container, "active");
        
        // if not ended by zoom restore zoom and bounds
        if (restore) {
            this._map.setZoom(this.oldZoom);
            this._map.fitBounds(this.oldBounds);
            this._map.setMaxBounds(this.oldMaxBounds);
        }
    },
});

L.control.showAll = function (options) {
    return new L.Control.ShowAll(options);
};
