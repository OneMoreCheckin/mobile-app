Omci.service.core.initialize({
  // host: 'api.onemorecheckin.com',
  // port: '',
  host: 'ackitup.net',
  port: '5051',
  version: '1.0',
  clientId: 'V4E5YSHBAG34FPQZA2X2ABUCHQP4M1AFIYWA5ZUTQWGSIPZE', // KPA3DXY55S1OWUAXKDNTXUCE0AL4AI0EMPKO2BSIVU2IUSAH
  fsVersion: '20121230',
  callback: 'http://local.onemorecheckin.com'
  // callback: location.protocol + '://' + location.host + '/' + location.pathname;
});


PhoneApp.use('PhoneApp.types.Object');
PhoneApp.use('PhoneApp.types.ArrayController');
PhoneApp.use('Omci.service.core');
PhoneApp.use('Omci.service.venues');


PhoneApp.pack('Omci.model', function(api) {
  'use strict';

  var Stats = api.Object.extend({
    badges: 0,
    bestScore: 0,
    checkins: 0,
    currentScore: 0,
    friends: 0,
    mayorships: 0,
    tips: 0,
    todos: 0,
    fromObject: function(mesh){
      Object.keys(mesh).forEach(function(key){
        if(key in this)
          this.set(key, mesh[key]);
      }, this);
    }
  });

  var Badge = api.Object.extend({
    achievement: 0,
    categories: [],
    infos: {},
    complete: 0,
    details: '',
    hard: 0,
    icon: '',
    img: '',
    more: 0,
    name: '',
    type: '',
    init: function(){
      this.categories = [];
      api.Object._super('init', this);
    },
    fromObject: function(mesh){
      Object.keys(mesh).forEach(function(key){
        if(key in this)
          this.set(key, mesh[key]);
      }, this);
      this.categories.clear();
      mesh.cat.forEach(function(item){
        this.categories.pushObject(item);
      }, this);
    }
  });

  var userDescriptor = {
    avatar: '',
    firstName: '',
    gender: '',
    lastName: '',

/*
4sqcities
expertise
foursquare
partner
 */
    init: function(){
      this._badges = [];
      this.badges = {};
      ['cities', 'expertise', 'foursquare', 'partner'].forEach(function(cat){
        this.badges[cat] = new api.ArrayController();
        this.badges[cat].content = this._badges;
        this.badges[cat].filter = function(item){
          return item.type == (cat == 'cities' ? '4sqcities' : cat);
        };
      }, this);

      this.stats = Stats.create();

      this.lastCheckin = Checkin.create();
      api.Object._super('init', this);
    },

    fromObject: function(mesh){
      Object.keys(mesh.user).forEach(function(key){
        if(key in this)
          this.set(key, mesh.user[key]);
      }, this);
      this.stats.fromObject(mesh.stats);
      this._badges.clear();
      mesh.badges.forEach(function(item){
        var b = Badge.create();
        b.fromObject(item);
        this._badges.pushObject(b);
      }, this);
      this.lastCheckin.fromObject(mesh.lastCheckin);
    },

    bootstrap: function(onSuccess, onFailure){
      api.core.requestAuthentication((function(data){
        this.fromObject(data);
        onSuccess(this);
      }.bind(this)), onFailure);
    }
  };

  var User = api.Object.extend(userDescriptor);

  var Venue = api.Object.extend({
    // beenHere: {
    //   count: 0// ,
    //   // marked: false
    // },
    canonicalUrl: '',
    categories: [],
    // contact: {},
    createdAt: 0,
    // dislike: false,
    // friendVisits: {
    //   count: 5,
    //   items: Array[6],
    //   summary: "Toi et 5 amis avez visité ce lieu"
    // },
    hereNow: {
      count: 0
    },
    id: '',
    // like: true,
    // likes: Object
    // listed: Object

    location: {
      cc: '',
      city: '',
      country: '',
      isFuzzed: false,
      lat: 0,
      lng: 0,
      state: ''
    },
    // mayor: Object
    name: '',

    fetch: function(success, failure){
      api.venues.read((function(data){
        this.fromObject(data.response.venue);
        if(success)
          success(this);
      }.bind(this)), function(){
        // console.error('Something is very wrong with 4sq');
        if(failure)
          failure();
      }, this.id);
    },

    fromObject: function(mesh){
      Object.keys(mesh).forEach(function(key){
        if(key in this)
          this.set(key, mesh[key]);
      }, this);
      this.set('createdAt', new Date(parseInt(this.createdAt, 10) * 1000));
    },

    description: (function(){
      return '<ul><li>Here now: ' + this.hereNow.count + '</li>' +
           '<li>Total checkins: ' + this.stats.checkinsCount + '</li></ul>';
    }.property('stats', 'hereNow')),

    info: (function(){
      return '<div id="info-window"><h3>' + this.name + '</h3>' + this.description + '</div>';
    }.property('description', 'name')),


    icon: (function(){
      // Return whatever appropriate depending on categories
    }.property('categories')),

    // Probably override with proper dimensions here
    // size: [10, 10],
    // origin: [0, 0],
    // offset: [5, 2]


    // pageUpdates: Object
    // photos: Object
    // reasons: Object
    // shortUrl: "http://4sq.com/mPmdjT",
    // specials: Object
    stats: {
    //   checkinsCount: 434
    //   tipCount: 1
    //   usersCount: 14
    },
    // tags: Array[0]
    // timeZone: "Europe/Paris",
    // tips: Object
    // verified: false
  });





  var Checkin = api.Object.extend({
    // checkins: 0,
    // contact: {},
    // createdAt: 0,
    // hereNow: 0,
    // icon: '',
    // id: '',
    // isMayor: false,

/*    location: Object
      cc: "FR"
      city: "Paris"
      country: "France"
      isFuzzed: true
      lat: 48.87026909751365
      lng: 2.3962543168971036
      state: "Île-de-France"
*/
    // name: '',
    // url: null,
    // users: 0,
    venue: 0,
    aVenue: null,

    init: function(){
      api.Object._super('init', this);
      this.set('aVenue', Venue.create());
    },

    fromObject: function(mesh){
      Object.keys(mesh).forEach(function(key){
        if(key in this)
          this.set(key, mesh[key]);
      }, this);
      this.aVenue.fromObject({id: this.venue});
      this.aVenue.fetch();

      // this.set('createdAt', new Date(parseInt(this.createdAt, 10) * 1000));
    }
  });




  this.user = User.create();

  var venues = [this.user.lastCheckin.aVenue];
  this.venues = new api.ArrayController();
  this.venues.content = venues;

  this.venues.search = function(latitude, longitude, cat, limit){
    venues.clear();
    api.venues.search((function(data){
      data.response.venues.forEach(function(vm){
        var v = Venue.create();
        v.fromObject(vm);
        venues.pushObject(v);
      });
    }.bind(this)), function(){
      // console.error('Terrible terrible bad bad things happened.');
    }, latitude, longitude, cat, limit);
  };


});