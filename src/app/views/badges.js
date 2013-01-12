PhoneApp.pack('Omci.views', function() {
  /*jshint devel:true*/
  'use strict';

  this.Badges = Pa.ScrollableView.extend({
    templateName: 'badges',
    classNames: 'scrollable',

    sort: function(e) {
      var node = e.target;
      var $node = $(node);
      
      if ($node.hasClass('active'))
        return;

      var sort = node.getAttribute('data-sort');
      $node.siblings().removeClass('active');
      $node.addClass('active');
      switch (e.context) {
        case "level":
          this.controller.content.sort = Omci.model.user.badges.SORT_LEVEL;
        break;
        case "easiest":
          this.controller.content.sort = Omci.model.user.badges.SORT_EASIEST;
        break;
        default:
          this.controller.content.sort = Omci.model.user.badges.SORT_NEAREST;
      }
    }
  });

});