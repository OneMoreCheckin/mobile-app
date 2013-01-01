PhoneApp.use('PhoneApp.types.Object');
PhoneApp.use('PhoneApp.types.ArrayController');

PhoneApp.pack('Omci.controller', function(api) {
  'use strict';
  /*global google:false*/

  var UNINITIALIZED = 'UNINITIALIZED';
  var LOADING = 'LOADING';
  var READY = 'READY';
  var ERROR = 'ERROR';

  var googleMapReady = UNINITIALIZED;

  var onsuccess;
  var onfailure;

  this.onmapready = function(){
    googleMapReady = READY;
    if(onsuccess)
      onsuccess();
  };

  var loadAPI = function(){
    if (googleMapReady == READY)
      return;
    if(googleMapReady != LOADING) {
      googleMapReady = LOADING;
      var script = document.createElement('script');
      script.src = 'http://maps.google.com/maps/api/js?v=3.7&sensor=true&callback=Omci.controller.onmapready';
      script.type = 'text/javascript';

      script.addEventListener('error', function(/*e*/) {
        googleMapReady = ERROR;
        if(onfailure)
          onfailure();
      }, false);
   
      script.addEventListener('load', function(/*e*/) {
        setTimeout(function() {
          if (googleMapReady == LOADING){
            googleMapReady = ERROR;
            if(onfailure)
              onfailure();
          }
        }, 5000);
      }, false);
 
      document.getElementsByTagName('head')[0].appendChild(script);

      // google.load('maps', '3', {'other_params': 'sensor=true', callback: function() {
      //   googleMapReady = true;
      //   cbk();
      // }});
    }
  };

  document.addEventListener('online', loadAPI, false);

  //loadAPI();

  this.Marker = api.Object.extend({
    background: {
      icon: 'images/check_map.png',
      size: [69, 80],
      origin: [0, 0],
      offset: [35, 80],
      shape: [1, 1, 1, 60, 40, 30, 40 , 1]
    },

    defaultCategory: {
      icon: 'images/example_cat.png',
      size: [32, 32],
      origin: [0, 0],
      offset: [17, 62]
    },

    init: function(){
      api.Object._super('init', this);

      var icon = this.venue.icon || this.defaultCategory.icon;
      this.venue.size = this.venue.size || this.defaultCategory.size;
      this.venue.origin = this.venue.origin || this.defaultCategory.origin;
      this.venue.offset = this.venue.offset || this.defaultCategory.offset;


      var fond = new google.maps.MarkerImage(
        this.background.icon,
        new google.maps.Size(this.background.size[0], this.background.size[1]),
        new google.maps.Point(this.background.origin[0], this.background.origin[1]),
        new google.maps.Point(this.background.offset[0], this.background.offset[1])
      );

      var category = new google.maps.MarkerImage(
        icon,
        new google.maps.Size(this.venue.size[0], this.venue.size[1]),
        new google.maps.Point(this.venue.origin[0], this.venue.origin[1]),
        new google.maps.Point(this.venue.offset[0], this.venue.offset[1])
      );

      this.googleMarker = new google.maps.Marker({
        // markercount: i,
        position: new google.maps.LatLng(this.venue.location.lat, this.venue.location.lng),
        shadow: fond,
        icon: category,
        shape: {
          coord: this.background.shape,
          type: 'poly'
        },
        title: this.venue.name,
        // zIndex: checkin[4],
        description: this.venue.description
      });


// +         map: this.map,
// new google.maps.Marker();
//       this.venue;

      // google.maps.event.addListener(marker, 'click', function(event) {
      //   infowindow.setPosition(event.latLng);// this.position
      //   infowindow.open(map);
      // });
    }
  });

  this.Map = api.Object.extend({
    markers: null,
    _map: null,

    init: function(){
      api.Object._super('init', this);

      onfailure = this.onfailure;

      this.markers = api.ArrayController.create();
      this.markers.content = this.venues;

      var infowindow;

      var setupMarker = (function(marker){
        marker.googleMarker.setMap(this._map);
        google.maps.event.addListener(marker.googleMarker, 'click', (function(event){
          infowindow.setContent(marker.venue.info);
          infowindow.setPosition(event.latLng);// this.position
          infowindow.open(this._map);
        }.bind(this)));
      }.bind(this));

      var pruneMarker = function(marker){
        marker.googleMarker.setMap(null);
      };

      onsuccess = (function(){
        var options = {
          center: new google.maps.LatLng(this.latitude, this.longitude),
          zoom: 14,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          streetViewControl: false
        };
        this._map = new google.maps.Map(this.node, options);

        infowindow = new google.maps.InfoWindow({
          pixelOffset: new google.maps.Size(0, -45)
        });

        this.markers.map = function(item){
          return Omci.controller.Marker.create({venue: item});
        };

        //   item.map = this._map;
        //   google.maps.event.addListener(m, 'click', function(event) {
        //     infowindow.setContent(item.marker.info);
        //     infowindow.setPosition(event.latLng);// this.position
        //     infowindow.open(item.map);
        //   });
        //   return m;
        // };

        this.markers.content.addArrayObserver(function(index, add, remove){
          add.forEach(setupMarker);
          remove.forEach(pruneMarker);
        });

        this.markers.content.forEach(setupMarker);

        if(this.onsuccess)
          this.onsuccess();
      }.bind(this));

      if(googleMapReady == READY)
        onsuccess();

      if(googleMapReady == ERROR && onfailure)
        onfailure();

    }
    // clear: function(){
    //   this._markers.forEach(function(item){
    //     item.setMap(null);
    //   });
    //   this._markers = [];
    // },

    // mark: (function(){
    //   console.warn('toto titi', arguments);
      // this._markers = [];
      // drawMarkers(this._map, this._markers);
    // }).observes('content@each')
  });

});




// <script type="text/javascript" src="http://maps.google.com/maps/api/js?sensor=false"></script>




  // Roxee.widgets.gmap = function(address, id, icon) {

  //   var doTheDeed = function() {
  //     // Do geocode the shit
  //     var name = address.match(/\(([^)]+)\)/);
  //     name = name ? name.pop() : 'Place';
  //     address = address.replace(/\(([^)]+)\)/, '');
  //     var geocoder = new google.maps.Geocoder();
  //     geocoder.geocode({ 'address': address}, function(results, status) {
  //       if (status == google.maps.GeocoderStatus.OK) {
  //         // console.warn(Roxee.widgets);
  //         // console.warn(Roxee.widgets.googleMap);
  //         // Ua Va
  //         Roxee.widgets.googleMap.init(id, name, results[0].geometry.location.lat(), results[0].
  //             geometry.location.lng(), icon, 10, address);
  //       // var d = [[, 100]];
  //       // if(!ref){
  //       //         ref = doIt('chart_div', d);
  //       // }else{
  //       //         ref.addRows(d);
  //       // }
  //       /*        map.setCenter(results[0].geometry.location);
  //           var marker = new google.maps.Marker({
  //               map: map,
  //               position: results[0].geometry.location
  //           });*/
  //       } else {
  //         throw 'Geocode was not successful for the following reason: ' + status;
  //       }
  //     });
  //   };
  //   lazyMapGoogle(doTheDeed);
  // };
