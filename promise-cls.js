var createNamespace = require('continuation-local-storage').createNamespace;
var session = createNamespace('my session');

function doThing(index, doBind) {
  session.run(function () {
    session.set('index', index);
    var func = function () {
      var contextIndex = session.get('index');
      console.log('context: ' + contextIndex + ', closure: ' + index);
    }
    if (doBind) func = session.bind(func);
    new Promise(function (resolve, reject) {
      setTimeout(resolve, 10);
    }).then(func);
  });
};

doThing(1);
doThing(2);
doThing(3);

doThing(1, true);
doThing(2, true);
doThing(3, true);
