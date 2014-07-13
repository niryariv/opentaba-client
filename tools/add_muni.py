#!/usr/bin/env python2
# -*- coding: utf-8 -*-

"""
This is a helper script for adding a new municipaliy
"""

import sys
import os
import logging
import json
from optparse import OptionParser
from time import sleep
from subprocess import Popen
from helper.geojson_validator import validate_geojson, GeoJSONValidationException


def _which(program):
    def is_exe(fpath):
        return os.path.isfile(fpath) and os.access(fpath, os.X_OK)

    fpath, fname = os.path.split(program)
    if fpath:
        if is_exe(program):
            return program
    else:
        for path in os.environ["PATH"].split(os.pathsep):
            path = path.strip('"')
            exe_file = os.path.join(path, program)
            if is_exe(exe_file):
                return exe_file

    return None


def _load_gushim_json(client_dir, gushim_file):
    with open(os.path.join(client_dir, gushim_file)) as gushim_data:
        try:
            gushim_json = json.loads(gushim_data.read().replace('var gushim=', '').rstrip('\n').rstrip(';'))
            validate_geojson(gushim_json)
        except (ValueError, GeoJSONValidationException) as err:
            log.error('Error loading gushim json file. Is it a valid geojson file?: ' + str(err))
            sys.exit(1)
    
    return gushim_json


def _get_muni_center(features):
    """
    get the center point for the municipality - average longtitude and latitude values
    """
    sum_x = 0
    sum_y = 0
    count = 0
    
    for f in features:
        for cgroup in f['geometry']['coordinates']:
            for coord in cgroup:
                sum_x += coord[0]
                sum_y += coord[1]
                count += 1

    return [eval('{:.6f}'.format(sum_y / count)), eval('{:.6f}'.format(sum_x / count))]


def _update_scraper_gushim_list(gushim_json, server_dir):
    try:
        with open(os.path.join(server_dir, 'tools/gushim.py')) as gushim_data:
            gushim_list = json.loads(gushim_data.read().replace('GUSHIM = ', ''))
    except:
        log.warn('Couldn\'t load scraper\'s gushim list. You can safely ignore if it does not exist yet')
        gushim_list = []
    
    for f in gushim_json['features']:
        if f['properties']['Name'] != '' and f['properties']['Name'] != '0' and f['properties']['Name'] not in gushim_list:
            gushim_list.append(f['properties']['Name'])
    
    out = open(os.path.join(server_dir, 'tools/gushim.py'), 'w')
    out.write('GUSHIM = ' + json.dumps(gushim_list))
    out.close


def _convert_to_topojson(client_dir, topojson_file, gushim_file):
    # the reason i chose to use the official topojson as a subprocess and not https://github.com/calvinmetcalf/topojson.py is because 
    # topojson.py is not a direct port and i don't trust it to produce exactly the same results. also it's no on pip
    topojson_full_path = os.path.join(client_dir, topojson_file)
    p = Popen(['topojson', '--id-property', 'Name', '-q', '1e5', '-o', topojson_full_path, os.path.join(client_dir, gushim_file)])
    for i in range(10):
        if not os.path.isfile(topojson_full_path):
            sleep(0.5)
    
    if not os.path.isfile(topojson_full_path):
        log.warn('Could not validate conversion to topojson, convertion may have failed or is just taking too long. If it is successful eventually you will need to change the object\'s name to "gushim" yourself')
    else:
        log.debug('Successfully converted to topojson')
        
        log.debug('Changing topojson object name')
        with open(topojson_full_path) as topo_data:
            j = json.loads(topo_data.read())
        curr_key = j['objects'].keys()[0]
        j['objects']['gushim'] = j['objects'][curr_key]
        del j['objects'][curr_key]
        
        out = open(topojson_full_path, 'w')
        out.write(json.dumps(j))
        out.close


if __name__ == '__main__':
    parser = OptionParser()
    parser.add_option('-c', dest='client_dir', help='Mandatory, path to the opentaba client directory, eg. "../../opentaba-client"')
    parser.add_option('-g', dest='gushim_file', help='Mandatory, local path to the new gushim file in the opentaba client directory, eg. "data/gushim/jerusalem.gush.js"')
    parser.add_option('-s', dest='server_dir', help='Mandatory, path to the opentaba server directory, eg. "../../opentaba-server"')
    parser.add_option('-n', dest='muni_name', help='Mandatory, name of the municipality without special symbols (for subdomain), eg. "batyam"')
    parser.add_option('-d', dest='muni_display_name', help=u'Mandatory, display name for municipality (if having Hebrew problems just replace in index file after script), eg. "בת-ים"')
    parser.add_option('-i', dest='index_file', default='data/index.js', help='Local path to the municipality index file in the opentaba client directory, default="data/index.js"')
    parser.add_option('-t', dest='topo_output_dir', default='data', help='Local path to the output topojson file directory, default="data"')
    parser.add_option('-f', dest='topo_file_name', help='File name for the output topojson file, default="[geojson-file-name].json"')
    parser.add_option('-v', dest='verbose', action='store_true', default=False, help='Print verbose debugging information')
    (options, args) = parser.parse_args()
    
    # initialize logging
    if options.verbose:
        lvl = logging.DEBUG
    else:
        lvl = logging.INFO

    logging.basicConfig(format='%(asctime)-15s %(name)s %(levelname)s %(message)s', level=lvl)
    log = logging.getLogger(__name__)
    
    # validate options and prerequisites
    if not options.client_dir or not options.gushim_file or not options.server_dir or not options.muni_name or not options.muni_display_name:
        parser.print_help()
        sys.exit(1)
    
    if _which('topojson') is None:
        log.error('topojson does not seem to be in your path...')
        sys.exit(1)
    
    for d in [options.client_dir, options.server_dir, os.path.join(options.client_dir, options.topo_output_dir)]:
        if not os.path.isdir(d):
            log.error(d + ' does not exists or is not a directory')
            sys.exit(1)
    
    if not os.path.isfile(os.path.join(options.client_dir, options.gushim_file)):
        print log.error(os.path.join(options.client_dir, options.gushim_file) + ' does not exists or is not a regular file')
        sys.exit(1)
    
    # load index.json
    log.debug('Attempting to load index json')
    try:
        with open(os.path.join(options.client_dir, options.index_file)) as index_data:
            index_json = json.loads(index_data.read().replace('var municipalities = ', '').rstrip('\n').rstrip(';'))
    except:
        log.warn('Couldn\'t load index json. You can safely ignore if the index does not exist yet')
        index_json = {}
    
    # load json
    log.debug('Attempting to load the gushim geojson')
    gushim_json = _load_gushim_json(options.client_dir, options.gushim_file)

    new_muni = {}
    new_muni['display'] = options.muni_display_name
    
    # calculate center
    log.debug('Calculating the map\'s center point')
    new_muni['center'] = _get_muni_center(gushim_json['features'])
    
    # add to gushim.py
    log.debug('Updating the scraper\'s list of gushim')
    _update_scraper_gushim_list(gushim_json, options.server_dir)
    
    # convert to topojson
    if options.topo_file_name:
        topojson_file = os.path.join(options.topo_output_dir, options.topo_file_name)
    else:
        topojson_file = os.path.join(options.topo_output_dir, os.path.splitext(os.path.basename(options.gushim_file))[0]) + '.json'
    
    log.debug('Converting geojson to topojson')
    _convert_to_topojson(options.client_dir, topojson_file, options.gushim_file)
    
    new_muni['file'] = topojson_file
    index_json[options.muni_name] = new_muni
    
    # write back index.json
    log.debug('Updating index json')
    out = open(os.path.join(options.client_dir, options.index_file), 'w')
    out.write('var municipalities = ' + json.dumps(index_json, sort_keys=True, indent=4, separators=(',', ': ')) + ';')
    out.close
    
    log.info('Done')
