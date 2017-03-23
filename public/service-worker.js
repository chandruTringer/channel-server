var CACHE_VERSION = 1;
var CURRENT_CACHES = {
  'post-message': 'post-message-cache-v' + CACHE_VERSION
};

var JSON_TO_FORM_DATA = function(item){
  var formData = new FormData();

  for ( var key in item ) {
      formData.append(key, item[key]);
  }
  return formData;
}

// This is a somewhat contrived example of using client.postMessage() to originate a message from
// the service worker to each client (i.e. controlled page).
// Here, we send a message when the service worker starts up, prior to when it's ready to start
// handling events.
self.clients.matchAll().then(function(clients) {
  clients.forEach(function(client) {
    console.log(client);
    client.postMessage('The service worker just started up.');
  });
});

self.addEventListener('activate', function(event) {
  // Delete all caches that aren't named in CURRENT_CACHES.
  // While there is only one cache in this example, the same logic will handle the case where
  // there are multiple versioned caches.
  var expectedCacheNames = Object.keys(CURRENT_CACHES).map(function(key) {
    return CURRENT_CACHES[key];
  });

  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (expectedCacheNames.indexOf(cacheName) === -1) {
            // If this cache name isn't present in the array of "expected" cache names, then delete it.
            console.log('Deleting out of date cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      return clients.claim();
    }).then(function() {
      // After the activation and claiming is complete, send a message to each of the controlled
      // pages letting it know that it's active.
      // This will trigger navigator.serviceWorker.onmessage in each client.
      return self.clients.matchAll().then(function(clients) {
        return Promise.all(clients.map(function(client) {
          return client.postMessage('The service worker has activated and ' +
            'taken control.');
        }));
      });
    })
  );
});

self.addEventListener('message', function(event) {
  console.log('Handling message event:', event);
  var p = caches.open(CURRENT_CACHES['post-message']).then(function(cache) {
    switch (event.data.command) {


      // This command adds a new request/response pair to the cache.
      case 'message':
        // If event.data.url isn't a valid URL, new Request() will throw a TypeError which will be handled
        // by the outer .catch().
        // Hardcode {mode: 'no-cors} since the default for new Requests constructed from strings is to require
        // CORS, and we don't have any way of knowing whether an arbitrary URL that a user entered supports CORS.
        var request;
        var url = event.data.url;
        var method = event.data.method ? event.data.method : "GET";
        var body = event.data.data ? event.data.data : null;
        if(body !== null){
          request = new Request(event.data.url,
            {
              method: method,
              body: JSON_TO_FORM_DATA(body),
              mode: 'no-cors'
            }
          );
        } else {
          request = new Request(event.data.url,
            {
              method: method,
              mode: 'no-cors'
            }
          );
        }
        return fetch(request).then(function(response) {
          console.log(response);
          return cache.put(event.data.url, response);
        }).then(function(response) {
          console.log(response);
        });


      default:
        // This will be handled by the outer .catch().
        throw Error('Unknown command: ' + event.data.command);
    }
  }).catch(function(error) {
    // If the promise rejects, handle it by returning a standardized error message to the controlled page.
    console.error('Message handling failed:', error);

    event.ports[0].postMessage({
      error: error.toString()
    });
  });

  // Beginning in Chrome 51, event is an ExtendableMessageEvent, which supports
  // the waitUntil() method for extending the lifetime of the event handler
  // until the promise is resolved.
  if ('waitUntil' in event) {
    event.waitUntil(p);
  }

  // Without support for waitUntil(), there's a chance that if the promise chain
  // takes "too long" to execute, the service worker might be automatically
  // stopped before it's complete.
});
