var Pool = require('generic-pool').Pool;
var domain = require('domain');

var pool = new Pool({
  name: 'pool',
  create: function (cb) { cb(null, {}) },
  destroy: function (client) {},
  max: 2,
  idleTimeoutMillis: 200
});

function doThing(index, doBind) {
  var wrapDomain = domain.create();
  wrapDomain.index = index;
  wrapDomain.run(function () {
    var cb = function (err, client) {
      var contextIndex = domain.active.index;
      console.log('context: ' + contextIndex + ', closure: ' + index);
      setTimeout(function () {
        pool.release(client);
      }, 10)
    };
    if (doBind) cb = domain.active.bind(cb);
    pool.acquire(cb);
  });
};

doThing(1);
doThing(2);
doThing(3);
doThing(4);
doThing(5);

doThing(1, true);
doThing(2, true);
doThing(3, true);
doThing(4, true);
doThing(5, true);
