const CACHE_NAME = 'gnote-v0.0.2';

// List all the files and assets that need to be cached for offline use.
const URLS_TO_CACHE = [
  "/",
  "index.html",
  "mainPanel.html",
  "Application.js",
  "File.js",
  "privateFile.js",
  "testmainPanel.js",

  "css/testmainPanel.css",
  "css/mainPanel.css",
  "css/index.css",

  

  "gn/css/gn.css",
  "gn/gn.js",
  "gn/css/font-awesome/all.css",
  "gn/css/font-awesome/webfonts/fa-solid-900.woff2",
  "gn/css/font-awesome/webfonts/fa-regular-400.woff2",
  "gn/translations/en.json",


   "php/user/getContent.php"
//todo translations per app
//   "app.js",
//   "manifest.json",
//   "/icons/icon-192x192.png",
//   "/icons/icon-512x512.png"
];

const log = (message, ...args) => console.log(`[SW:${CACHE_NAME}] ${message}`, ...args);

self.addEventListener('install', (event) => {
    log('Installing new service worker...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then((cache) => {
            return cache.addAll(URLS_TO_CACHE);
        })
        .then(() => {
            log('Installation complete. Forcing activation.');
            return self.skipWaiting();
        })
        .catch(error => {
            log('Installation failed:', error);
        })
    );
});

self.addEventListener('activate', (event) => {
    log('Activating new service worker...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
        return Promise.all(
            cacheNames.map((cache) => {
            if (cache !== CACHE_NAME) {
                return caches.delete(cache);
            }
            })
        );
        }).then(() => {
            log('Activation complete and old caches cleared.');
            return self.clients.claim();
        })
        .catch(error => {
            log('Activation failed:', error);
        })
    );
});


self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET' && !( event.request.url.endsWith( "/getContent.php" || event.request.url.endsWith( "/verify.php" ) ) )) {
        console.log( event );
        return;
    }

    self.debug1(event.request);
    //test

    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch( event.request )
            .catch( async () => {
                var x = await caches.match(event.request) 
                console.log(x);
                return x
            } )
        );
        return;
    }
    
    if( event.request.url.endsWith( "/getContent.php" ) ) {
        fetch( event.request )
        .catch( async err => {
            return caches.match( event.request );
        } )
        return;
    }
    else if( event.request.url.endsWith( "/verify.php" ) ) {
        fetch( event.request )
        .catch( async err => {
            const mockResponse = {
                status: 200,
                ok: true,
                json: () => Promise.resolve({ status : 1 }),
                text: () => Promise.resolve(JSON.stringify({ status : 1 })),
                // Other properties like 'headers', 'url', etc., can be added if needed
            };
          return Promise.resolve(mockResponse);
        } )
        return;
    }


    event.respondWith (
        caches.match( event.request )
        .then( ( response ) => {
            // Return cached response if found
            if ( response ) {
                return response;
            }

            // Otherwise, go to the network
            return fetch( event.request ).then( ( networkResponse ) => {
                return networkResponse;
            });
        })
        .catch( ( error ) => {
            log('Fetch failed for request:', event.request.url, error);
            // You could return a specific offline image/page here if needed.
        })
    );
});

self.debug1 = async (a) => {
    if(a){
        console.log( a, await caches.match(a) )
        return
    }
    caches.open(CACHE_NAME)
    .then(async (cache) => {
        console.log( await caches.keys() )
    })
    
}