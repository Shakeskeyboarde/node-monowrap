"use strict";

var Builder = require('./lib/builder');

function monowrap(text, opts)
{
	return (new Builder(opts)).write(text).toString();
}

module.exports = monowrap;
module.exports.Builder = Builder;