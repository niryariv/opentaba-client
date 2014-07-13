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

position = {
    "type": "array",
    "minItems": 2,
    "maxItems": 3,
    "items": {
        "type": "number"
    }
}

point = {
    "type": "object",
    "properties": {
        "type": {
            "pattern": "^Point$"
        },
        "coordinates": {
            "type": position
        }
    }
}

multipoint = {
    "type": "object",
    "properties": {
        "type": {
            "pattern": "^MultiPoint$"
        },
        "coordinates": {
            "type": "array",
            "minItems": 2,
            "items": position
        }
    }
}

linestring = {
    "type": "object",
    "properties": {
        "type": {
            "pattern": "^LineString$"
        },
        "coordinates": {
            "type": "array",
            "minItems": 2,
            "items": position
        }
    }
}

multilinestring = {
    "type": "object",
    "properties": {
        "type": {
            "pattern": "^MultiLineString$"
        },
        "coordinates": {
            "type": "array",
            "items": {
                "type": "array",
                "minItems": 2,
                "items": position
            }
        }
    }
}

polygon = {
    "type": "object",
    "properties": {
        "type": {
            "pattern": "^Polygon$"
        },
        "coordinates": {
            "type": "array",
            "items": {
                "type": "array",
                "minItems": 4,
                "items": position
            }
        }
    }
}

multipolygon = {
    "type": "object",
    "properties": {
        "type": {
            "pattern": "^MultiPolygon$"
        },
        "coordinates": {
            "type": "array",
            "items": {
                "type": "array",
                "items": {
                    "type": "array",
                    "minItems": 4,
                    "items": position
                }
            }
        }
    }
}

geometrycollection = {
    "type": "object",
    "properties": {
        "type": {
            "pattern": "^GeometryCollection$"
        },
        "geometries": {
            "type": "array",
            "items": {
                "type": [
                    point,
                    multipoint,
                    linestring,
                    multilinestring,
                    polygon,
                    multipolygon
                ]
            }
        }
    }
}

feature = {
    "type": "object",
    "properties": {
        "type": {
            "pattern": "^Feature$"
        },
        "properties": {
            "type": [
                "object",
                None
            ]
        },
        "geometry": {
            "type": [
                point,
                multipoint,
                linestring,
                multilinestring,
                polygon,
                multipolygon,
                geometrycollection,
                None
            ]
        }
    }
}

featurecollection = {
    "type": "object",
    "properties": {
        "type": {
            "pattern": "^FeatureCollection$"
        },
        "features": {
            "type": "array",
            "items": feature
        }
    }
}
