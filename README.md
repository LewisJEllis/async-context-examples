# Async Context Examples

This repository contains examples of cases in Node.js where asynchronous contexts are lost due to the userland queuing problem. To run the examples, just install dependencies with `npm install` and then run `node src/filename.js`.

## Background
See [Async context propagation in various language ecosystems](https://docs.google.com/document/d/1tlQ0R6wQFGqCS5KeIw0ddoLbaSYx6aU7vyXOkv-wvlM/edit) for background on asynchronous contexts and the userland queueing problem.

The two most currently viable mechanisms for asynchronous contexts in Node are [continuation-local-storage](https://github.com/othiym23/node-continuation-local-storage) and [domains](https://nodejs.org/api/domain.html), among others described in the above-linked document. We exercise both in these examples.

If a callback is queued from a particular asynchronous context (either an active domain or a CLS namespace context), we want that callback to have that same context when it is eventually called. Domains and CLS use implicit binding to make this work automatically where possible, but certain scenarios will require explicit binding to maintain the correct context (see [implicit vs explicit binding](https://nodejs.org/api/domain.html#domain_implicit_binding)).

## What we have here
This repository currently has three examples of scenarios where explicit binding is necessary:
- simple callback queueing
- resource pooling with [node-pool](https://github.com/coopernurse/node-pool) (which is really just a special case of callback queueing)
- native promises

These examples are fairly simple and the source should be small and readable enough to understand what's going on. In general, we want the context and closure values to remain aligned. In each file, the first series of prints are without explicit binding where the context is mismatched or lost, and the second series is with explicit binding where the context is correctly propagated.

## What this means
It is important for packages in the Node ecosystem to be "good citizens" by preserving asynchronous contexts when necessary/possible; this generally means using [`domain.bind`](https://nodejs.org/api/domain.html#domain_domain_bind_callback) or [`namespace.bind`](https://github.com/othiym23/node-continuation-local-storage#namespacebindcallback-context) when:
- queueing a callback (so it will be called after the current run-to-completion)
- from a context (active domain or CLS namespace context)
- without going through Node native APIs (where contexts are mostly propagated automatically by both domains and CLS)

In a project where one component relies on asynchronous contexts and another component fails to preserve them, we'll end up with lost or mismatched state (as demonstrated by these examples). Depending on the exact scenario, this can have all sorts of impact, in some cases even including security implications.

## State of Node ecosystem wrt async context propagation
This is difficult in Node, partially just because the userland queueing problem is a hard problem, and partially because of the positioning of CLS and domains in the ecosystem.

CLS is unofficial and not widely known, so many packages either don't know they break it or don't find it worthwhile to fix. Very few libraries bind CLS namespace contexts, but efforts have been made to monkeypatch popular libraries to do so via [cls-redis](https://github.com/othiym23/cls-redis), [cls-bluebird](https://github.com/TimBeyer/cls-bluebird), and various other `cls-*` compatibility helper modules.

Domains are deprecated, disliked, and often poorly understood, so while many packages do support preserving domain contexts, some packages want nothing to do with them. For example, various popular database drivers ([redis](https://github.com/NodeRedis/node_redis/blob/ff9b727609ea125919828f7373e40082fd432eec/index.js#L877), [cassandra](https://github.com/datastax/nodejs-driver/blob/884535fcc50539db786712fda85d6b97c40909c6/lib/utils.js#L248), [mysql](https://github.com/mysqljs/mysql/blob/2aa8b6c8ea2eb93d4d2afa42920362b707e39aed/lib/Connection.js#L25), [postgres](https://github.com/brianc/node-postgres/pull/531)) bind the active domain correctly when queueing callbacks, but some popular libraries do not ([async](https://github.com/caolan/async/pull/999), [node-sqlite3](https://github.com/mapbox/node-sqlite3/pull/258)).

One notable difference between domains and CLS here is that CLS works with promises without explicit binding, but domains do not. Unfortunately, domains have much better ecosystem compatibility as described above, so **I currently use domains for asynchronous contexts when I need that capability**.
