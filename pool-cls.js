var Pool = require('generic-pool').Pool;
var createNamespace = require('continuation-local-storage').createNamespace;
var session = createNamespace('my session');

var pool = new Pool({
  name: 'pool',
  create: function (cb) { cb(null, {}) },
  destroy: function (client) {},
  max: 2,
  idleTimeoutMillis: 200
});

function doThing(index, doBind) {
  session.run(function () {
    session.set('index', index);
    var cb = function (err, client) {
      var contextIndex = session.get('index');
      console.log('context: ' + contextIndex + ', closure: ' + index);
      setTimeout(function () {
        pool.release(client);
      }, 10)
    };
    if (doBind) cb = session.bind(cb);
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
