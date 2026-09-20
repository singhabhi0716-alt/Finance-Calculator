const CACHE_NAME = "finance-calculator-v5";

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
     IMPORTANT:

     Always use the cached version first.

     This means the app continues working
     even when there is no internet connection.
  */

  if (
    request.mode === "navigate" ||
    request.destination === "document"
  ) {

    event.respondWith(

      caches.match(request)
        .then(cachedResponse => {

          if(cachedResponse){

            return cachedResponse;

          }

          return fetch(request);

        })

    );

    return;

  }


  /*
     Other resources:
     cache first, network as fallback.
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
