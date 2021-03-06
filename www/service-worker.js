/*
 Copyright 2016 Google Inc. All Rights Reserved.
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

// Change version when you update any of the local resources, which will
// in turn trigger the install event again.  
// When changing version - change in index.html too!
const version = 'v1.009';
// A list of local resources we always want to be cached.
const PRECACHE_URLS = [
  'index.html',
  'cordova.js',
  'favicon.png',
  'css/index.css',
  'js/index.js',
  'js/install.js',
  'audio/Ding.m4a',
  'audio/Ding ding ding.m4a',
  'img/down-icon.png',
  'img/up-icon.png',
  'img/Start-icon.png',
  'img/Stop-icon.png',
  'img/logo.png'
];		

// Names of the two caches used in this version of the service worker.
const PRECACHE = `precache-${version}`;
const RUNTIME = 'runtime';

// The install handler takes care of precaching the resources we always need.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(PRECACHE)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(self.skipWaiting())
  );
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', event => {
  const currentCaches = [PRECACHE, RUNTIME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

// The fetch handler serves responses for same-origin resources from a cache.
// If no response is found, it populates the runtime cache with the response
// from the network before returning it to the page.
self.addEventListener('fetch', event => {
  // DevTools opening will trigger these o-i-c requests, which this SW can't handle.
  // https://github.com/paulirish/caltrainschedule.io/issues/49	
  // console.log('Handling fetch event for', event.request.url);
  if (event.request.cache === 'only-if-cached' && event.request.mode !== 'same-origin') return;
  // Skip cross-origin requests, like those for Google Analytics.
  if (event.request.url.startsWith(self.location.origin)) {
	if (event.request.headers.get('range')) {
		console.log('Range request for', event.request.url);
		return returnRangeRequest(event.request, PRECACHE)
	} else {	  
		console.log('Non-range request for', event.request.url);
		event.respondWith(
		  caches.match(event.request).then(cachedResponse => {
			if (cachedResponse) {
			  return cachedResponse;
			}

			return caches.open(RUNTIME).then(cache => {
			  return fetch(event.request).then(response => {
				// Put a copy of the response in the runtime cache.
				return cache.put(event.request, response.clone()).then(() => {
				  return response;
				});
			  });
			});
		  })
		);
	}
  }
});

function returnRangeRequest(request, cacheName) {
  return caches
    .open(cacheName)
    .then(function(cache) {
      return cache.match(request.url);
    })
    .then(function(res) {
      if (!res) {
        return fetch(request)
          .then(res => {
            const clonedRes = res.clone();
            return caches
              .open(cacheName)
              .then(cache => cache.put(request, clonedRes))
              .then(() => res);
          })
          .then(res => {
            return res.arrayBuffer();
          });
      }
      return res.arrayBuffer();
    })
    .then(function(arrayBuffer) {
      const bytes = /^bytes\=(\d+)\-(\d+)?$/g.exec(
        request.headers.get('range')
      );
      if (bytes) {
        const start = Number(bytes[1]);
        const end = Number(bytes[2]) || arrayBuffer.byteLength - 1;
        return new Response(arrayBuffer.slice(start, end + 1), {
          status: 206,
          statusText: 'Partial Content',
          headers: [
            ['Content-Range', `bytes ${start}-${end}/${arrayBuffer.byteLength}`]
          ]
        });
      } else {
        return new Response(null, {
          status: 416,
          statusText: 'Range Not Satisfiable',
          headers: [['Content-Range', `*/${arrayBuffer.byteLength}`]]
        });
      }
    });
}