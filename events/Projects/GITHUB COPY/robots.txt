# If you would like to crawl GitHub contact us via https://support.github.com?tags=dotcom-robots
# We also provide an extensive API: https://docs.github.com
User-agent: baidu
crawl-delay: 1


User-agent: *

Disallow: /*/*/pulse
Disallow: /*/*/projects
Disallow: /*/*/forks
Disallow: /*/*/issues/new
Disallow: /*/*/issues/search
Disallow: /*/*/commits/
Disallow: /*/*/branches
Disallow: /*/*/contributors
Disallow: /*/*/tags
Disallow: /*/*/stargazers
Disallow: /*/*/watchers
Disallow: /*/*/network
Disallow: /*/*/graphs
Disallow: /*/*/compare

Disallow: /*/tree/
Disallow: /gist/
Disallow: /*/download
Disallow: /*/revisions
Disallow: /*/commits/*?author
Disallow: /*/commits/*?path
Disallow: /*/comments
Disallow: /*/archive/
Disallow: /*/blame/
Disallow: /*/raw/
Disallow: /*/cache/
Disallow: /.git/
Disallow: */.git/
Disallow: /*.git$
Disallow: /search/advanced
Disallow: /search$
Disallow: /*q=
Disallow: /*.atom$

Disallow: /ekansa/Open-Context-Data
Disallow: /ekansa/opencontext-*
Disallow: */tarball/
Disallow: */zipball/

Disallow: /*source=*
Disallow: /*ref_cta=*
Disallow: /*plan=*
Disallow: /*return_to=*
Disallow: /*ref_loc=*
Disallow: /*setup_organization=*
Disallow: /*source_repo=*
Disallow: /*ref_page=*
Disallow: /*source=*
Disallow: /*referrer=*
Disallow: /*report=*
Disallow: /*author=*
Disallow: /*since=*
Disallow: /*until=*
Disallow: /*commits?author=*
Disallow: /*report-abuse?report=*
Disallow: /*tab=*
Allow: /*?tab=achievements&achievement=*

Disallow: /account-login
Disallow: /Explodingstuff/

