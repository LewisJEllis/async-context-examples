var createNamespace = require('continuation-local-storage').createNamespace;
var session = createNamespace('my session');

var queue = [];

function enqueue(index, doBind) {
  session.run(function () {
    session.set('index', index);

    var cb = function () {
      var contextIndex = session.get('index');
      console.log('context: ' + contextIndex + ', closure: ' + index);
    };
    if (doBind) cb = session.bind(cb);
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
