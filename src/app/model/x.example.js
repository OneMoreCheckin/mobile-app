window.setTimeout(function(){
  'use strict';
  /*jshint devel:true*/

  // Grab a ref to the venue of the lastCheckin
  var venus = Omci.model.user.lastCheckin.aVenue;

  // Observe its location so that we boot the map once it's fetched
  venus.addObserver('location', function(){
    // Build-up map
    Omci.controller.Map.create({
      // Node to bind
      node: $('.app')[0],
      // Lat / long
      latitude: venus.location.lat,
      longitude: venus.location.lng,
      // Bind the venues list object (bound to the search)
      venues: Omci.model.venues.content,
      onsuccess: function(){
        console.warn('OK BOY! The map is in');
        // Now, search something in venues, to update markers magically
        Omci.model.venues.search(
          venus.location.lat,
          venus.location.lng,
          '4bf58dd8d48988d116941735'
        );
      },
      onfailure: function(){
        console.error('Something bad happened with teh map');
      }
    });
  });

  Omci.model.user.bootstrap(function(){
    console.warn('Am in!');
  }, function(){
    console.error('Errrr. Can\'t login baby. This is dull!');
  });

}, 5000);
