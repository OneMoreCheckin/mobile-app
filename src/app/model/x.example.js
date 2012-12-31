window.setTimeout(function(){

  var venus = Omci.model.user.lastCheckin.aVenue;

  venus.addObserver('location', function(){
    // myMapMarkers.clear();
    // removeObject(Omci.model.user.lastCheckin.aVenue);
    // myMapMarkers.pushObject(Omci.controller.Marker.create({venue: venus}));
    var map = Omci.controller.Map.create({
      node: $('.app')[0],
      latitude: venus.location.lat,
      longitude: venus.location.lng,
      venues: Omci.model.venues.content,
      onsuccess: function(){
        console.warn("OK BOY");
        Omci.model.venues.search(Omci.model.user.lastCheckin.aVenue.location.lat, Omci.model.user.lastCheckin.aVenue.location.lng, '4bf58dd8d48988d116941735');
      },
      onfailure: function(){
        console.error("SHIT");
      }
    });

  });


  Omci.model.user.bootstrap(function(){}, function(){});

}, 5000);
