/**
 * Created by kennydude on 11/06/2014.
 *
 * This is a Javascript version of PHP-Patcher @ http://sourceforge.net/projects/phppatcher
 */
var HunkRegex = /@@ -(\d+)(,(\d+))?\s+\+(\d+)(,(\d+))?\s+@@/m;
var debug = require("debug")("debug");

/**
 * Apply Unified Diff
 * @param original Original File
 * @param patch Diff
 */
module.exports = function(original, patch){
	var lines = { "lines" : patch.split("\n"), "i" : 0 };

	var line = nextLine(lines);
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
			debug("Hit Hunk l: " + original.length + "  " + matches[0]);
			debug(lines.i);
			var src_size = (matches[3] || 1)*1,
				dst_size = (matches[6] || 1)*1;
			original = apply_diff(lines, matches[1], src_size, matches[4], dst_size, original);
			debug("new length: " + original.length);
			debug(lines.i);

			line = nextLine(lines);
			if(!line) throw new Error("Invalid DIFF");
		}
	} while((line = nextLine(lines)) != null);

	return original;
}

function nextLine(lines){
	if(lines.i > lines.lines.length) return null;

	var r = lines.lines[ lines.i ];
	lines.i++;
	return r;
}

function apply_diff(lines, src_line, src_size, dst_line, dst_size, original){
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
		}
		if(line.charAt(0) == '-'){
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
		} else{
			if(line.length == 0){
				line = '';
			} else if(line == '\\ No newline at end of file'){
				continue;
			} else{
				line = line.substr(1);
			}

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
					var dst_lines = original.split("\n");
					if(!dst_lines) throw new Error("Technical Problem");

					var src_bottom = src_line + source.length,
						dst_bottom = dst_line + destin.length;

					console.log(src_bottom, src_lines.length, source.length);

					for (var l = src_line; l < src_bottom; l++) {
						if (src_lines[l] != source[l - src_line]) {
							throw new Error("Verification Failed! line: " + l + " - " + src_lines[l] + " != " + source[l-src_line]);
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
	} while(line = nextLine(lines));

	throw new Error("Unexpected EOF");
}
