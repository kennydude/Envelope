/**
 * Created by kennydude on 11/06/2014.
 *
 * This is a Javascript version of PHP-Patcher @ http://sourceforge.net/projects/phppatcher
 * Also uses some changes from Joomla (I can't believe I actually did this)
 *
 * https://github.com/joomla/joomla-cms/blob/staging/libraries/joomla/filesystem/patcher.php
 */
var HunkRegex = /@@ -(\d+)(,(\d+))?\s+\+(\d+)(,(\d+))?\s+@@($)/m;
var debug = require("debug")("debug patch");

/**
 * Apply Unified Diff
 * @param original Original File
 * @param patch Diff
 */
module.exports = function(original, patch){
	var lines = { "lines" : patch.split("\n"), "i" : 0 };

	var line = nextLine(lines);
	var dst = original;
	do{
		if(line.length < 5) continue;

		if(line.indexOf("--- ") != 0) continue; // Wait until we hit a block
		debug("Hit Original File Header");
		line = nextLine(lines);
		if(line.indexOf("+++ ") != 0) throw new Error("Invalid Diff"); // Error

		line = nextLine(lines);
		if(!line) throw new Error("Unexpected EOF");

		var matches = null;
		while((matches = HunkRegex.exec(line)) != null){
			debug("Hit Hunk l: " + original.length + "  ", matches);
			debug(lines.i);
			var src_line = matches[1],
				src_size = (matches[3] || 1)*1,
				dst_line = matches[4]
				dst_size = (matches[6] || 1)*1;

			dst = apply_diff(lines, src_line, src_size, dst_line, dst_size, original, dst);
			debug("new length: " + original.length);
			debug(lines.i);

			line = nextLine(lines);
			//if(!line) throw new Error("Unexpected EOF");
		}
	} while((line = nextLine(lines)) != null);

	return dst;
}

function nextLine(lines){
	if(lines.i > lines.lines.length) return null;

	var r = lines.lines[ lines.i ];
	lines.i++;
	return r;
}

function currentLine(lines){
	return lines.lines[lines.i];
}

function apply_diff(lines, src_line, src_size, dst_line, dst_size, original, dst){
	src_line--;
	dst_line--;

	var line = nextLine(lines);
	if(!line) throw new Error("Unexpected EOF");

	var source = [],
		destin = [],
		src_left = src_size,
		dst_left = dst_size;

	do{

		if(line.length == 0){
			source.push('');
			destin.push('');
			src_left--;
			dst_left--;
			continue;
		} else if(line.charAt(0) == '-'){
			if(src_left == 0){
				throw new Error("Unexpected Line Removal");
			}
			source.push(line.substr(1));
			src_left--;
		} else if(line.charAt(0) == '+'){
			if(dst_left == 0){
				throw new Error("Unexpected Line Addition");
			}
			destin.push(line.substr(1));
			dst_left--;
		} else if(line != '\\ No newline at end of file'){
			line = line.substr(1);
			source.push(line);
			destin.push(line);
			src_left--;
			dst_left--;
		}

		if(dst_left == 0 && src_left == 0){
			// Apply the patch

			var src_lines = null;
			if(src_size > 0){
				src_lines = original.split("\n"); // Check _get_source
				if(!src_lines) throw new Error("Technical Problem");
			}

			if(dst_size > 0){
				if(src_size > 0){
					var dst_lines = dst.split("\n");
					if(!dst_lines) throw new Error("Technical Problem");

					var src_bottom = src_line + source.length;
					//	dst_bottom = dst_line + destin.length;

					console.log(src_bottom, src_lines.length, source.length);

					for (var l = src_line; l < src_bottom; l++) {
						debug("%s == %s", src_lines[l], source[l-src_line]);
						if (src_lines[l] != source[l - src_line]) {
							//throw new Error("Verification Failed! line: " + l + " - " + src_lines[l] + " != " + source[l-src_line]);
						}
					}
					debug(dst_lines.length);

					//array_splice(dst_lines, dst_line, source.length, destin);
					var args = [dst_line, source.length];
					for(var key in destin){
						args.push(destin[key]);
					}
					dst_lines.splice.apply(dst_lines, args);

					debug(dst_lines.length);
					original = dst_lines.join("\n");
				} else{
					original = destin.join("\n");
				}
			} else{
				// Removal of file?
			}

			return original;
		}

	} while((line = nextLine(lines)) != null);

	throw new Error("Unexpected EOF");
}
