var domain = require('domain');

var queue = [];

function enqueue(index, doBind) {
  var wrapDomain = domain.create();
  wrapDomain.index = index;

  wrapDomain.run(function () {
    var cb = function () {
      var contextIndex = domain.active && domain.active.index;
      console.log('context: ' + contextIndex + ', closure: ' + index);
    };
    if (doBind) cb = domain.active.bind(cb);
    queue.push(cb);
  });
}

enqueue(1);
enqueue(2);
enqueue(3);

enqueue(1, true);
enqueue(2, true);
enqueue(3, true);

queue.forEach(function (cb) {
  cb();
});
