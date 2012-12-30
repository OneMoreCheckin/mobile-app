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

    init: function(){
      this.stats = Stats.create();
      this.badges = new api.ArrayController();
      this.badges.content = [];
      this.lastCheckin = Checkin.create();
      api.Object._super('init', this);
    },

    fromObject: function(mesh){
      Object.keys(mesh.user).forEach(function(key){
        if(key in this)
          this.set(key, mesh.user[key]);
      }, this);
      this.stats.fromObject(mesh.stats);
      this.badges.content.clear();
      mesh.badges.forEach(function(item){
        var b = Badge.create();
        b.fromObject(item);
        this.badges.content.pushObject(b);
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

  var Checkin = api.Object.extend({
    checkins: 0,
    contact: {},
    createdAt: 0,
    hereNow: 0,
    icon: '',
    id: '',
    isMayor: false,

/*    location: Object
      cc: "FR"
      city: "Paris"
      country: "France"
      isFuzzed: true
      lat: 48.87026909751365
      lng: 2.3962543168971036
      state: "Île-de-France"
*/
    name: '',
    url: null,
    users: 0,
    venue: '',
    init: function(){
      api.Object._super('init', this);
    },

    fromObject: function(mesh){
      Object.keys(mesh).forEach(function(key){
        if(key in this)
          this.set(key, mesh[key]);
      }, this);
      this.set('createdAt', new Date(parseInt(this.createdAt, 10) * 1000));
    }
  });

  this.user = User.create();

});