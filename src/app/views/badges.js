PhoneApp.pack('Omci.views.badges', function() {
  /*jshint devel:true*/
  'use strict';

  var Badges = Pa.ScrollableView.extend({
    sort: function(e) {
      var node = e.target;
      var $node = $(node);

      if ($node.hasClass('active'))
        return;

      var sort = node.getAttribute('data-sort');
      $node.siblings().removeClass('active');
      $node.addClass('active');
      switch (e.context) {
        case 'level':
          this.content.sort = Omci.model.user.badges.SORT_LEVEL;
          break;
        case 'easiest':
          this.content.sort = Omci.model.user.badges.SORT_EASIEST;
          break;
        default:
          this.content.sort = Omci.model.user.badges.SORT_NEAREST;
      }
    },

    isLoadingUpdated: function() {
      if (!this.isLoading)
        return;

      Omci.model.user.bootstrap(function() {
        this.set('isLoading', false);
      }.bind(this), function() {
        this.set('isLoading', false);
      }.bind(this));
    }.observes('isLoading')
  });

  this.Foursquare = Badges.extend({
    templateName: 'badges/foursquare',
    classNames: 'foursquare badges-container',
    contentBinding: 'Omci.model.user.badges.foursquare'
  });
  this.Expertise = Badges.extend({
    templateName: 'badges/expertise',
    classNames: 'expertise badges-container',
    contentBinding: 'Omci.model.user.badges.expertise'
  });
  this.Cities = Badges.extend({
    templateName: 'badges/cities',
    classNames: 'cities badges-container',
    contentBinding: 'Omci.model.user.badges.cities'
  });
  this.Partner = Badges.extend({
    templateName: 'badges/partner',
    classNames: 'partner badges-container',
    contentBinding: 'Omci.model.user.badges.partner'
  });


});
