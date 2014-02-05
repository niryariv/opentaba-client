#!/usr/bin/python
import json
import sys
import re
import glob
import os.path

coord_compare_error = 0.000000005
cmp_n_digits = 6;

def equals_with_error(point1, point2):
   return abs(point1[0] - point2[0]) < coord_compare_error and \
          abs(point1[1] - point2[1]) < coord_compare_error
                
def intersect(coords1, coords2):
   for point1 in coords1:
      for point2 in coords2:
         if point1 == point2:
            return True
#         if equals_with_error(point1, point2):
#            print point1
#            print point2
#            print ""
#            return True
   return False

def add_neighbours_to_city(filename, file_out_name):
    with open(filename) as f:
       whole_file = f.read()
    f.close()

    whole_file = re.sub('var gushim=', '', whole_file, 1)
    whole_file = re.sub(';', '', whole_file, 1)

    data = json.loads(whole_file)

    progress_bar_width = len(data['features'])
    sys.stdout.write("[%s]" % (" " * progress_bar_width))
    sys.stdout.flush()
    sys.stdout.write("\b" * (progress_bar_width+1)) # return to start of line

    k = 0;
    for i in range(0, len(data['features'])):
       feature = data['features'][i]
       name = feature['properties']['Name']
       if not type(name) == int and (not len(name) or name == '<Null>'):
          continue

       if not 'neighbours' in feature['properties']:
          feature['properties']['neighbours'] = []
       
       coords = feature['geometry']['coordinates'][0]

       for j in range(i+1, len(data['features'])):
          feature2 = data['features'][j]
          name2 = feature2['properties']['Name']
          if not type(name) == int and (not len(name2) or name2 == '<Null>'):
             continue

          coords2 = feature2['geometry']['coordinates'][0]

          if not 'neighbours' in feature2['properties']:
                feature2['properties']['neighbours'] = []

          if intersect(coords, coords2):
             k += 1
#         if k % 5 == 0:
#            print '%d)%s,%d)%s' %(i, name, j, name2)

             feature['properties']['neighbours'].append(name2)
             feature2['properties']['neighbours'].append(name)
       sys.stdout.write("-")
       sys.stdout.flush()
    sys.stdout.write("\n")
    sys.stdout.flush()


    with open(file_out_name, 'w') as outfile:
       outfile.write('var gushim=')
       json.dump(data, outfile)            

files = glob.glob("gushim/*.gush.js")
for i in range(0, len(files)):
    filename = files[i]
    city = '-'.join(re.split('\.', filename)[0:-2])
    file_out_name = city + ".gush.neighbours.js"
    print i + 1, '/', len(files), "| Working on:", file_out_name

    if os.path.exists(file_out_name):
        print "Skipping, already processed"
        continue

    add_neighbours_to_city(filename, file_out_name)
