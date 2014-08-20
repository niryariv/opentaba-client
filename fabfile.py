"""
fab file for managing opentaba-server heroku apps
"""

from github import Github, Repository
from fabric.api import *
from getpass import getpass
from requests import get
from json import loads, dumps
import os

@runs_once
def _github_connect():
    #  connect to github only once per run
    username = raw_input('Github user: ')
    password = getpass('Github password: ')
    
    try:
        u = Github(username, password).get_user()
        
        # this is just so PyGithub tries to authorize now and not when someone actually wants
        # to do something like create or delete a repo
        i = u.id
    except:
        abort('Could not gain Github authorization')
    
    return u


@runs_once
def _get_repo_name(site_name):
    return 'opentaba-client-%s' % site_name


def _get_sites():
    # get the defined remotes' names, without 'origin' or 'all_sites'
    sites = ''.join(local('git remote', capture=True)).split('\n')
    if 'origin' in sites:
        sites.remove('origin')
    if 'all_sites' in sites:
        sites.remove('all_sites')
    if 'PhantomCSS' in sites:
        sites.remove('PhantomCSS')
    
    return sites


def _add_cname(site_name, site_git):
    # clone new repo in another directory
    with lcd('../'):
        local('git clone %s -b gh-pages tmp-%s' % (site_git, site_name))
        
        with lcd('tmp-%s' % site_name):
            # add CNAME
            local('echo %s.opentaba.info > CNAME' % site_name)
    
            # add, commit, push new CNAME
            local('git add CNAME')
            local('git commit -m "added CNAME - %s.opentaba.info"' % site_name)
            local('git push')
    
        # delete new repo folder
        local('rm -rf tmp-%s' % site_name)


def _download_gush_map(muni_name, topojson=False):
    r = get('https://raw.githubusercontent.com/niryariv/israel_gushim/master/%s.%s' % (muni_name, 'topojson' if topojson else 'geojson'))
    if r.status_code != 200:
        abort('Failed to download gushim map')
    
    try:
        res = loads(r.text)
    except:
        abort('Gushim map is an invalid JSON file')
    
    return res


def _get_muni_center(features):
    """
    Get the center point for the municipality - average longtitude and latitude values
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


@task
def create_site(site_name):
    """Create a new sub-site for a new municipality"""
    
    g = _github_connect()
    repo_name = _get_repo_name(site_name)
    
    # create a new repo for the new site
    try:
        repo = g.create_repo(repo_name, has_issues=False, has_wiki=False, has_downloads=False, auto_init=False)
    except:
        abort('Failed to create new github repository...')

    # add new repo as remote with the gh-pages branch as destination
    local('git remote add %s %s' % (site_name, repo.clone_url))
    
    # add new repo to all_sites remote
    with settings(warn_only=True):
        if local('git remote set-url --add all_sites %s' % repo.clone_url).failed:
            # in case just adding the the remote fails it probably doesn't exist yet, so try to add it
            if local('git remote add all_sites %s' % repo.clone_url).failed:
                delete_site(site_name, ignore_errors=True)
                abort('Could not add new remote to all_sites')
    
    # push to new remote
    deploy(site_name, repo.clone_url)
    
    print '*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*'
    print 'Now you need to manually add the new hostname (subdomain)'
    print 'to point to %s.opentaba.info' % site_name
    print '*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*'


@task
def delete_site(site_name, ignore_errors=False):
    """Delete a sub-site"""
    
    g = _github_connect()
    repo_name = _get_repo_name(site_name)
    
    with settings(warn_only=True):
        # try to find the site's git url if it is a remote here
        site_git = None
        remotes = ''.join(local('git remote -v', capture=True)).split('\n')
        for r in remotes:
            if r.startswith(site_name):
                site_git = r.split('\t')[1].split(' ')[0]
                break
        
        # delete the remotes for target site
        if site_git:
            local('git remote set-url --delete all_sites %s' % site_git, capture=ignore_errors)
        
        local('git remote remove %s' % site_name, capture=ignore_errors)
        
        # delete the github repository
        try:
            repo = g.get_repo(repo_name)
            repo.delete()
        except:
            if not ignore_errors:
                abort('Failed to delete github repository...')


@task
def add_gush_map(muni_name, display_name=''):
    """Add an entry for a new municipality to the data/index.js file, and download its topojson gush map"""
    
    # download the online gush maps
    geojson_gush_map = _download_gush_map(muni_name)
    topojson_gush_map = _download_gush_map(muni_name, topojson=True)
    
    # load the current municipalities' index dictionary
    with open(os.path.join('data', 'index.js')) as index_data:
        index_json = loads(index_data.read().replace('var municipalities = ', '').rstrip('\n').rstrip(';'))
    
    # add a new entry if needed
    if muni_name not in index_json.keys():
        if display_name == '':
            abort('For new municipalities display name must be provided')
        
        index_json[muni_name] = {'display':'', 'center':[]}
    
    # update the display name and center of the municipality's entry
    index_json[muni_name]['display'] = display_name
    index_json[muni_name]['center'] = _get_muni_center(geojson_gush_map['features'])
    
    # write back the index.js file
    out = open(os.path.join('data', 'index.js'), 'w')
    out.write('var municipalities = ' + dumps(index_json, sort_keys=True, indent=4, separators=(',', ': ')) + ';')
    out.close
    
    # write the topojson map file
    out = open(os.path.join('data', '%s.topojson' % muni_name), 'w')
    out.write(dumps(topojson_gush_map))
    out.close
    
    print '*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*'
    print 'The new municipality data was added to data/index.js, and its topojson gushim '
    print 'map was downloaded to data/%s.topojson, but both were not comitted.' % muni_name
    print 'If more data needs to be in index.js, this is the time to add it (explanation '
    print 'of valid fields in the index.js file can be found in the repository\'s README).'
    print 'Please give the changes a quick look-see and make sure they look fine, then '
    print 'commit the changes and deploy your new/exisiting site.'
    print '*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*X*'


@task
def deploy(site_name, site_git=''):
    """Deploy changes to a certain sub-site"""
    
    # this will in fact run over all current content of the remote and 
    # replace it with the active repo's master tree (--force), because 
    # otherwise the local CNAME of the remote will stop the push
    local('git push %s master:gh-pages --force' % site_name)
    
    if site_git == '':
        site_git = ''.join(local('git remote -v | grep ^%s | grep \(push\)$ | awk \'{print $2}\'' % site_name, capture=True))
    
    # re-add the CNAME file to the site
    _add_cname(site_name, site_git)


@task
def deploy_all():
    """Deploy changes to all sub-sites"""
    
    # go over the remotes and deploy them, thus making sure to update the CNAME after destroying their data
    for site in _get_sites():
        deploy(site)
