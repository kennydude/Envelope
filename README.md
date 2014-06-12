# Envelope

## Repositories

Repositories are simple HTTP services which host files required for Envelope to work correctly.

Currently during development there is no configuration, nor any live services. Sorry about that.

### How are repositories hosted

All metadata is JSON and very simplistic. Also all URLs are relative to the base URL of the repository.

* `/index.json` Contains a key-value list of key=packagename, value=directory-package-lives-at
* `/<various path to package>/index.json` Contains a key-value list of key=version-number, value=directory-version-lives-at
* `/<various path to version>/module.json` Contains metadata about the package itself. This is more in-depth as it tells
  Envelope what to actually do with your package and what it needs to download

## Generators

Generators assume the following commands are available

* jsonlint (`[sudo] npm install jsonlint -g`)
* wget
* unzip
* grunt (`[sudo] npm install grunt -g`)
* diff/patch
* python

Most UNIX-like systems should have most of these, with the node-specific stuff available via NodeJS.

**Note:** You do not need to install any of this to use Envelope or any generated libraries

Generators are simply shell scripts which can be ran as expected.

### How to run generators

* `python magnific-popup.py version-required` (You can find a list of valid versions by looking for a valid tag on
  [the github](https://github.com/dimsemenov/Magnific-Popup/))