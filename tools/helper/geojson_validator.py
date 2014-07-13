"""
Copyright (c) 2012, Jason Sanford
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are
permitted provided that the following conditions are met:

    1. Redistributions of source code must retain the above copyright notice, this list of
       conditions and the following disclaimer.
    
    2. Redistributions in binary form must reproduce the above copyright notice, this list
       of conditions and the following disclaimer in the documentation and/or other materials
       provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
"""

"""
Code copied from Json Sanford's geojsonlint project: https://github.com/JasonSanford/geojsonlint.com
"""

import validictory
from .geojson_schemas import point, multipoint, linestring, multilinestring, polygon, multipolygon, geometrycollection, feature, featurecollection


class GeoJSONValidationException(Exception):
    pass


def validate_geojson(test_geojson):
    geojson_types = {
        'Point': point,
        'MultiPoint': multipoint,
        'LineString': linestring,
        'MultiLineString': multilinestring,
        'Polygon': polygon,
        'MultiPolygon': multipolygon,
        'GeometryCollection': geometrycollection,
        'Feature': feature,
        'FeatureCollection': featurecollection,
    }

    if not test_geojson['type'] in geojson_types:
        raise GeoJSONValidationException('"%s" is not a valid GeoJSON type.' % test_geojson['type'])

    if test_geojson['type'] in ('Feature', 'FeatureCollection', 'GeometryCollection'):
        #
        # These are special cases that every JSON schema library
        # I've tried doesn't seem to handle properly.
        #
        _validate_special_case(test_geojson)
    else:
        try:
            validictory.validate(test_geojson, geojson_types[test_geojson['type']])
        except validictory.validator.ValidationError as error:
            raise GeoJSONValidationException(str(error))

    if test_geojson['type'] == 'Polygon':
        # First and last coordinates must be coincident
        _validate_polygon(test_geojson)

    return

def _validate_special_case(test_geojson):
    def _validate_feature_ish_thing(test_geojson):
        if 'geometry' not in test_geojson:
            raise GeoJSONValidationException('A Feature must have a "geometry" property.')
        if 'properties' not in test_geojson:
            raise GeoJSONValidationException('A Feature must have a "properties" property.')
        if 'type' not in test_geojson:
            raise GeoJSONValidationException('A Feature must have a "type" property.')
        if test_geojson['geometry'] is not None:
            validate_geojson(test_geojson['geometry'])

    if test_geojson['type'] == 'Feature':
        _validate_feature_ish_thing(test_geojson)
    elif test_geojson['type'] == 'FeatureCollection':
        if 'features' not in test_geojson:
            raise GeoJSONValidationException('A FeatureCollection must have a "features" property.')
        elif not isinstance(test_geojson['features'], (list, tuple,)):
            raise GeoJSONValidationException('A FeatureCollection\'s "features" property must be an array.')
        for feature in test_geojson['features']:
            _validate_feature_ish_thing(feature)
    elif test_geojson['type'] == 'GeometryCollection':
        if 'geometries' not in test_geojson:
            raise GeoJSONValidationException('A GeometryCollection must have a "geometries" property.')
        elif not isinstance(test_geojson['geometries'], (list, tuple,)):
            raise GeoJSONValidationException('A GeometryCollection\'s "geometries" property must be an array.')
        for geometry in test_geojson['geometries']:
            if geometry is not None:
                validate_geojson(geometry)

def _validate_polygon(polygon):
    for ring in polygon['coordinates']:
        if ring[0] != ring[-1]:
            raise GeoJSONValidationException('A Polygon\'s first and last points must be equivalent.')
