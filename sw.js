const CACHE_NAME = "finance-calculator-v4";

const APP_FILES = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png"
];


/* =========================================================
   INSTALL
========================================================= */

self.addEventListener("install", event => {

  event.waitUntil(

    caches.open(CACHE_NAME)
      .then(cache => {

        return cache.addAll(APP_FILES);

      })

  );

  self.skipWaiting();

});


/* =========================================================
   ACTIVATE
========================================================= */

self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys()
      .then(keys => {

        return Promise.all(

          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))

        );

      })

  );

  self.clients.claim();

});


/* =========================================================
   FETCH
========================================================= */

self.addEventListener("fetch", event => {

  const request = event.request;


  /*
     For HTML/navigation:
     ALWAYS try the internet first.

     This means when we update GitHub Pages,
     the app can receive the new version.
  */

  if (
    request.mode === "navigate" ||
    request.destination === "document"
  ) {

    event.respondWith(

      fetch(request)
        .then(response => {

          const responseClone =
            response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {

              cache.put(
                request,
                responseClone
              );

            });

          return response;

        })

        .catch(() => {

          return caches.match(
            request
          ).then(cached => {

            return cached ||
              caches.match("./index.html");

          });

        })

    );

    return;

  }


  /*
     For other files:
     Try cache first, then network.
  */

  event.respondWith(

    caches.match(request)
      .then(cachedResponse => {

        if(cachedResponse){

          return cachedResponse;

        }

        return fetch(request)
          .then(response => {

            if(
              response &&
              response.status === 200
            ){

              const responseClone =
                response.clone();

              caches.open(CACHE_NAME)
                .then(cache => {

                  cache.put(
                    request,
                    responseClone
                  );

                });

            }

            return response;

          });

      })

  );

});
