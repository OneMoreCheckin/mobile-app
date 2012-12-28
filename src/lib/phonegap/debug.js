(function () {
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent))
    return;

  if (!this.ContactFindOptions) {
    this.ContactFindOptions = (function () {
      this.filter = '';
      this.multiple = false;
    });
  }

  if (!navigator.contacts) {
    var contacts = this.navigator.contacts = {};

    contacts.find = function (field, success, error) {
      window.setTimeout(function () {
          var result = [];
          for (var i = 0; i < 200; i ++) {
            result.push(contacts.contact);
          };
          success(result);
      }, 1);
    }

    contacts.contact = {
       "addresses" : [ { "country" : "France",
          "id" : 0,
          "locality" : "Paris",
          "postalCode" : "75011",
          "pref" : "false",
          "region" : null,
          "streetAddress" : "5 rue de la roquette",
          "type" : "home"
        },
        { "country" : "France",
          "id" : 1,
          "locality" : null,
          "postalCode" : null,
          "pref" : "false",
          "region" : null,
          "streetAddress" : null,
          "type" : "home"
        }
      ],
    "birthday" : 511531200000,
    "categories" : null,
    "displayName" : null,
    "emails" : [ { "id" : 0,
          "pref" : false,
          "type" : "home",
          "value" : "e.tabard@gmail.com"
        },
        { "id" : 1,
          "pref" : false,
          "type" : "work",
          "value" : "manu@webitup.fr"
        }
      ],
    "id" : 492,
    "ims" : null,
    "name" : { "familyName" : "Tabard",
        "formatted" : "Emmanuel Tabard",
        "givenName" : "Emmanuel",
        "honorificPrefix" : null,
        "honorificSuffix" : null,
        "middleName" : null
      },
    "nickname" : null,
    "note" : null,
    "organizations" : [ { "department" : null,
          "name" : "Founder @ Web It Up",
          "pref" : "false",
          "title" : null,
          "type" : null
        } ],
    "phoneNumbers" : [ { "id" : 0,
          "pref" : false,
          "type" : "home",
          "value" : "12-0648176708x33"
        },
        { "id" : 1,
          "pref" : false,
          "type" : "mobile",
          "value" : "06 48 17 67 08"
        }
      ],
    "avatar": "http://schoolfood.giveo.com/images/gravatars/gravatar-60-grey.jpg",
    "photos" : [ { "pref" : "false",
          "type" : "url",
          "value" : "http://schoolfood.giveo.com/images/gravatars/gravatar-60-grey.jpg"
        } ],
    "rawId" : null,
    "urls" : [ { "id" : 0,
          "pref" : false,
          "type" : "other",
          "value" : "http://flickr.com/photos/raildecom/"
        },
        { "id" : 1,
          "pref" : false,
          "type" : "other",
          "value" : "http://www.onemorecheckin.com"
        },
        { "id" : 2,
          "pref" : false,
          "type" : "other",
          "value" : "http://beta.roxee.tv"
        }
      ]
    }
  }

}).apply(this);