var domain = require('domain');

function doThing(index, doBind) {
  var wrapDomain = domain.create();
  wrapDomain.index = index;
  wrapDomain.run(function () {
    var func = function () {
      var contextIndex = domain.active && domain.active.index
      console.log('context: ' + contextIndex + ', closure: ' + index);
    }
    if (doBind) func = domain.active.bind(func);
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
