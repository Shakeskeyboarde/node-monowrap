monowrap
========

Intelligently wrap monospaced text.

Usage
-----

#### usage.txt
```txt

Usage:	foo  --bar --baz --bing --ring

Options:
	--foo	Is a simple test of how well the wrapping works.
	--bar	blah blah blah blah

And some fairly long text with a tab	which should make it wrap to the end of that tab.

 1)	testing one two three four
```

#### example.js
```js
var fs = require('fs');
var monowrap = require('monowrap');

var text = fs.readFileSync('usage.txt');

var output = monowrap(text, {
	
	// Wrap text to this many columns. Defaults to no wrapping. If you're going
	// to print out to a terminal from Node, you can get the current width of
	// the terminal from `process.stdout.columns`.
	width: 26,

	// Set width of a tab character. Defaults to 4.
	tabWidth: 4,

	// Treat multiple spaces as if they are a tab stop for indenting purposes.
	// Defaults to off. Zero, negative numbers, false, and non-numeric values
	// are equivalent and will turn off the feature. True and 1 are equivalent
	// to 2. The number is the number of spaces needed to be seen as a tab stop.
	spacedTabStop: 2,

	// Override line ending detection.
	eol: "\n",

	// Ensure that the output begins with exactly this many line breaks.
	top: 0,

	// Ensure that the output ends with exactly this many line breaks.
	bottom: 1

});

console.log(output);
```

#### output
```txt
Usage:  foo  --bar --baz
             --bing --ring

Options:
    --foo   Is a simple
            test of how
            well the
            wrapping
            works.
    --bar   blah blah blah
            blah

And some fairly long text
with a tab  which should
            make it wrap
            to the end of
            that tab.

 1) testing one two three
    four

```

If you just want to wrap text to a specific width, leaving all the other options at their default values, you can
pass a number as the second parameter instead of an options map.

```js
monowrap(text, 80);
// Is the same as...
monowrap(text, { width: 80 });
```

Notes
-----

Line endings are always normalized. The type will be automatically detected unless overridden by setting the "eol"
option.

Tabs will be replaced with spaces.

Indentation is maintained to the last tab stop.