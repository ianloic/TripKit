#!/usr/bin/env python

import simplejson, urllib

TRIPFILE = 'trip.js'

# load the current trip file
trip = simplejson.load(open(TRIPFILE, 'r'))

cache = {}

def geocode(location):
  if not cache.has_key(location):
    response = urllib.urlopen('http://maps.google.com/maps/geo?' +
                              urllib.urlencode({
                                'q': location,
                                'oe': 'utf8'
                              }))
    response = simplejson.load(response)
    if response['Status']['code'] == 200:
      cache[location] = response['Placemark'][0]['Point']['coordinates'][0:2]
    else:
      return None
  return cache[location]
  

for leg in trip:
  print 'leg: %s' % leg['name']
  for stop in leg['stops']:
    print 'stop: %s' % stop['name']
    if not stop.has_key('geocode'):
      gc = geocode(stop['name'])
      if gc:
        stop['geocode'] = gc
    print '  %s' % `stop['geocode']`
    
    
simplejson.dump(trip, open(TRIPFILE, 'w'), indent=2)