# -*- coding: utf-8 -*-
#test on python 3.4 ,python of lower version  has different module organization.
from RangeHTTPServer import RangeHTTPRequestHandler
import socketserver

PORT = 8000

Handler = RangeHTTPRequestHandler

Handler.extensions_map={
    '.manifest': 'text/cache-manifest',
	'.html': 'text/html',
    '.png': 'image/png',
	'.jpg': 'image/jpg',
	'.svg':	'image/svg+xml',
	'.css':	'text/css',
	'.js':	'application/x-javascript',
	'.mjs': 'text/javascript',
	'': 'application/octet-stream', # Default
    }

httpd = socketserver.TCPServer(("", PORT), Handler)

print("serving at port", PORT)
httpd.serve_forever()