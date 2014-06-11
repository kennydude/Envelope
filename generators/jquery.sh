#!/bin/sh
echo "jQuery Envelope Generator"
echo "Going to build version $1"

mkdir -p jquery/$1
cd jquery/$1

wget https://github.com/jquery/jquery/archive/$1.zip -O jquery.zip
unzip jquery.zip

cd jquery-$1

npm install

# Now build various things to do with jQuery
# jQuery is published as full with negative diffs

grunt build:*:*
cp dist/jquery.js ../jquery-full.js

echo '{ "name" : "jquery", "website" : "http://jquery.com/", "style" : "diff", "main" : "jquery-full.js", "modules" : {' > ../module.json

for t in "css" "ajax" "effects"
do

	echo "Building diff for when $t is removed"

	grunt build:*:*:-$t
	diff -u ../jquery-full.js dist/jquery.js > ../jquery-$t.diff

	echo "\"$t\" : \"jquery-$t.diff\"" >> ../module.json
	if [ $t != "effects" ] # Must be last value
	then
		echo ',' >> ../module.json
	fi


done

echo "}, \"version\" : \"$1\", \"diff\" : \"negative\" }" >> ../module.json

cat ../module.json | jsonlint

# Clean module file because we made it a mess!
jsonlint ../module.json > ../module-tidy.json
rm ../module.json
mv ../module-tidy.json ../module.json

echo "Cleanup"
cd ..
rm -rf jquery-$1
rm jquery.zip

echo "Done!"