"use strict";

var eol = require('os').EOL;
var def = require('definition');

var patterns = [
	{ type: '_newline', rx: /^[ \t]*(\r\n|\n\r|\r|\n)/ },
	{ type: '_whitespace', rx: /^[ \t]/ },
	{ type: '_word', rx: /^[^\r\n\t ]+/ }
];

var Builder = def({
	constructor: function(opts)
	{
		this._opts = this._normalizeOpts(opts);

		this._input = "";
		this._output = "";
		this._trimmed = "";
		this._offset = 0;
		this._indenting = true;
		this._indentWidth = 0;
	},
	write: function(text)
	{
		this._input += text;

		return this;
	},
	toString: function()
	{
		this._processInput();

		return this._trimmed;
	},
	_normalizeOpts: function(opts)
	{
		opts = Object(opts);

		var normal = {
			width: opts.width<<0,
			tabWidth: opts.tabWidth == null ? 4 : opts.tabWidth<<0,
			spacedTabStop: opts.spacedTabStop<<0,
			eol: opts.eol,
			top: opts.top == null ? null : opts.top<<0,
			bottom: opts.bottom == null ? null : opts.bottom<<0
		};

		if (normal.width <= 0) {
			normal.width = Infinity;
		}

		if (normal.tabWidth < 0) {
			normal.tabWidth = 0;
		} else if (normal.tabWidth > normal.width) {
			normal.tabWidth = normal.width;
		}

		if (normal.spacedTabStop <= 0) {
			normal.spacedTabStop = Infinity;
		} else if (normal.spacedTabStop === 1) {
			normal.spacedTabStop = 2;
		}

		if (typeof normal.eol !== 'string' || /[^\r\n]/.test(normal.eol)) {
			normal.eol = "";
		}

		return normal;
	},
	_detectLineEndings: function()
	{
		if (!this._opts.eol) {
			var match = this._input.match(/(?:\r\n|\n\r|\r|\n)/);

			if (match) {
				this._opts.eol = match[0];
			} else {
				this._opts.eol = eol;
			}
		}
	},
	_processInput: function()
	{
		if (this._input.length === 0) {
			return;
		}

		this._detectLineEndings();

		var i = 0;
		var miss = 0;
		var pattern;
		var matches;

		do {
			pattern = patterns[i];
			i = (i + 1) % patterns.length;

			matches = this._shiftMatches(pattern.rx);

			if (matches.length) {
				miss = 0;
				this[pattern.type](matches);
			} else if (++miss === patterns.length) {
				// Discard the first character if somehow none of the patterns
				// match. This shouldn't be possible, but just in case, eat a
				// character and try the matches again.
				miss = 0;
				this._input = this._input.substr(1);
			}
		} while (this._input.length);

		this._trimOutput();
	},
	_trimOutput: function()
	{
		this._trimmed = this._output;

		if (this._opts.top != null) {
			this._trimmed = this._trimmed.replace(/^([ \t]*[\r\n]+)*/, this._repeat(this._opts.eol, this._opts.top));
		}

		if (this._opts.bottom != null) {
			this._trimmed = this._trimmed.replace(/\s*$/, this._repeat(this._opts.eol, this._opts.bottom));
		} else {
			this._trimmed = this._trimmed.replace(/ +$/, '');
		}
	},
	_shiftMatches: function(rx)
	{
		var matches = [];
		var match;

		while (match = this._input.match(rx)) {
			matches.push(match[0]);
			this._input = this._input.substr(match[0].length);
		}

		return matches;
	},
	_whitespace: function(matches)
	{
		var remaining = this._opts.width - this._offset;
		var count = 0;
		var tabWidth;

		for (var i = 0, max = matches.length; i < max && remaining > 0; ++i) {
			if (matches[i] === " ") {
				++count;
				--remaining;
				if (count >= this._opts.spacedTabStop) {
					this._indenting = true;
				}
			} else {
				this._indenting = true;

				if (this._opts.tabWidth) {
					tabWidth = this._opts.tabWidth - ((this._offset + count) % this._opts.tabWidth);
					count += tabWidth;
					remaining -= tabWidth;
				}
			}
		}

		if (remaining > 0) {
			this._output += this._repeat(" ", count);
			this._offset += count;

			if (this._indenting) {
				this._indentWidth = this._offset;
			}
		} else {
			this._indenting = false;
			this._output += this._opts.eol;
			this._offset = 0;
			this._indent();
		}
	},
	_word: function(matches)
	{
		var word = matches[0];

		while (word) {
			if (word.length + this._offset > this._opts.width) {
				if (this._offset === this._indentWidth) {
					this._output += word.substr(0, this._opts.width - this._indentWidth) + this._opts.eol;
					word = word.substr(this._opts.width - this._indentWidth);
				} else {
					this._output = this._output.replace(/ *$/, this._opts.eol);
				}

				this._offset = 0;
				this._indent();
			} else {
				this._output += word;
				this._offset += word.length;
				word = "";
			}
		}

		this._indenting = false;
	},
	_newline: function(matches)
	{
		var length = matches.length;

		this._output += this._repeat(this._opts.eol, length);
		this._offset = 0;
		this._indentWidth = 0;
		this._indenting = true;
	},
	_indent: function()
	{
		if (this._indentWidth) {
			this._output += this._repeat(" ", this._indentWidth);
			this._offset = this._indentWidth;
		}
	},
	_repeat: function(str, count)
	{
		return new Array(count + 1).join(str);
	}
});

module.exports = Builder;