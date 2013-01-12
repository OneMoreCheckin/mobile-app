PhoneApp.pack('Omci.controllers', function() {
  'use strict';

  this.Badges = Pa.Controller.extend({
    contentBinding: 'Omci.model.user.badges.expertise',
  });
});
