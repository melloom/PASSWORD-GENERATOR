// This is the service worker for the Secure Password Generator app
const CACHE_NAME = 'secure-password-generator-v1.0.1'; // Increment version

// Assets to cache on install
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  '/maskable_icon.png',
  // Add additional critical assets to ensure they're cached
  '/styles.css'
];

// Install event - cache essential files
self.addEventListener('install', event => {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[ServiceWorker] Caching files');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[ServiceWorker] Skip waiting on install');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[ServiceWorker] Cache install error:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activate');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('[ServiceWorker] Clearing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      console.log('[ServiceWorker] Claiming clients');
      return self.clients.claim();
    })
    .catch(error => {
      console.error('[ServiceWorker] Activation error:', error);
    })
  );
});

// Fetch event - improved caching strategy: stale-while-revalidate
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip third-party API requests
  if (event.request.url.includes('api.pwnedpasswords.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return cached response if found
        if (cachedResponse) {
          // Fetch an updated version in the background
          const fetchPromise = fetch(event.request)
            .then(response => {
              // If the response is valid, store it in the cache
              if (response && response.status === 200 && response.type === 'basic') {
                const responseToCache = response.clone();
                caches.open(CACHE_NAME)
                  .then(cache => {
                    cache.put(event.request, responseToCache);
                    console.log('[ServiceWorker] Updated cache for:', event.request.url);
                  });
              }
              return response;
            })
            .catch(err => {
              console.log('[ServiceWorker] Fetch failed; returning cached response instead.', err);
            });

          return cachedResponse;
        }

        // If not in cache, fetch from network and cache the response
        return fetch(event.request)
          .then(response => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(error => {
            // For HTML requests, return the offline page
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/index.html');
            }
            console.error('[ServiceWorker] Fetch error:', error);
            throw error;
          });
      })
  );
});

// Message event - handle version updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[ServiceWorker] Skip waiting triggered by client');
    self.skipWaiting();
  }
  
  // Add support for checking version
  if (event.data && event.data.type === 'CHECK_VERSION') {
    const currentVersion = CACHE_NAME;
    event.ports[0].postMessage({ version: currentVersion });
  }
});

// Push notification event handler with better error handling
self.addEventListener('push', function(event) {
  console.log('[ServiceWorker] Push received');
  
  let notificationData;
  
  try {
    notificationData = event.data.json();
  } catch (e) {
    console.error('[ServiceWorker] Error parsing notification data:', e);
    notificationData = {
      title: 'Password Generator Notification',
      body: 'New notification received'
    };
  }

  const options = {
    body: notificationData.body || 'New notification from Password Generator',
    icon: '/logo192.png',
    badge: '/favicon.ico',
    vibrate: [100, 50, 100],
    data: {
      url: notificationData.url || '/'
    },
    tag: notificationData.tag || 'default', // Add tag for notification grouping
    renotify: notificationData.renotify || false // Whether to notify users if a notification with same tag exists
  };

  event.waitUntil(
    // Try/catch to prevent crashes from notification errors
    self.registration.showNotification(notificationData.title || 'Password Generator', options)
      .catch(err => console.error('[ServiceWorker] Notification display error:', err))
  );
});

// Handle notification clicks with error handling
self.addEventListener('notificationclick', function(event) {
  console.log('[ServiceWorker] Notification click');
  
  try {
    event.notification.close();

    // Check if URL exists to avoid errors
    const url = event.notification.data && event.notification.data.url ? 
      event.notification.data.url : '/';
      
    event.waitUntil(
      clients.matchAll({type: 'window'})
        .then(function(clientList) {
          // If we have a client, focus it
          for (let i = 0; i < clientList.length; i++) {
            const client = clientList[i];
            if (client.url === url && 'focus' in client) {
              return client.focus();
            }
          }
          // Otherwise open a new window
          if (clients.openWindow) {
            return clients.openWindow(url);
          }
        })
        .catch(err => console.error('[ServiceWorker] Error handling notification click:', err))
    );
  } catch (err) {
    console.error('[ServiceWorker] General error handling notification click:', err);
  }
});
