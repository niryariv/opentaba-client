"""
fab file for managing opentaba-server heroku apps
"""

from github import Github, Repository
from fabric.api import *
from getpass import getpass

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
    for site in _get_sites:
        deploy(site)
