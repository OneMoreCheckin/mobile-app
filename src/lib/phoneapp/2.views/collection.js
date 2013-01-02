PhoneApp.use('PhoneApp.types.Object');
PhoneApp.pack('PhoneApp', function(api) {


  this.CollectionView = this.View.extend({
    content: null,
    _childTemplate: null,

    init: function() {
      PhoneApp.CollectionView._super('init', this);
      this.content.limit = 4;
      window.COIN = this;
      this.content.content.addArrayObserver(function (index, added, removed) {
        console.error('******* array', arguments);
      });
    }
  })
});