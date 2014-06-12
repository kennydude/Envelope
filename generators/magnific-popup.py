import sys, os, json
from utils import *

version = sys.argv[1]

print "Magnific Popup version %s" % version

mkdirs("magnific-popup/%s/" % version)
os.chdir("magnific-popup/%s/" % version)

print "Download Magnific Popup..."

call("wget https://github.com/dimsemenov/Magnific-Popup/archive/%s.zip -O magpopup.zip" % version)
call("unzip -o magpopup.zip")

print "Creating Module..."

put_file("template.js", '''/* magnificent popup */;(function($) {
{{ CONTENTS }}
_checkInstance(); })(window.jQuery || window.Zepto);''')

modules = ["core", "ajax", "fastclick", "gallery", "iframe", "image", "inline", "retina", "zoom"]
js = {
	"name" : "magnific-popup",
	"style" : "template",
	"version" : version,
	"main.js" : "template.js",
	"main.scss" : "main.scss",
	"main.css" : "main.css",
	"modules" : {}
}

call("cp Magnific-Popup-%s/src/css/main.scss main.scss" % version)
call("cp Magnific-Popup-%s/dist/magnific-popup.css main.css" % version)

for module in modules:
	call("cp Magnific-Popup-%s/src/js/%s.js magpopup-%s.js" % (
		version, module, module
	))

	modinfo = { "file" : "magpopup-%s.js" % module, "dependencies" : [] }

	if module in modules[1:]:
		modinfo['dependencies'].append("core.js")
	if module in ['retina', 'zoom', 'gallery']:
		modinfo['dependencies'].append("image.js")

	js['modules']["%s.js" % module] = modinfo

put_file("module.json", json.dumps(js))

print "Tidy up"

call("rm magpopup.zip")
call("rm -rf Magnific-Popup-%s" % version)
