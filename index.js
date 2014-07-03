var
  SourceMapConsumer = require( "source-map" ).SourceMapConsumer,
  SourceMapGenerator = require( "source-map" ).SourceMapGenerator,
  fs = require( "fs" ),
  writeFileSync = fs.writeFileSync,
  readFileSync = fs.readFileSync,
  path = require('path');

function replace(inMap, outFile, searchString, replaceString)
{
    var mapping = JSON.parse( readFileSync(inMap) );
    var generator = new SourceMapGenerator({
        file: outFile
    });
    var map = new SourceMapConsumer( mapping );

    var pos;
    var replacements = [];
    var src = readFileSync(map.file, 'utf-8');
    var lineNum = 0;
    var filePos = 0;
    src.split('\n').forEach(function(line) {
        lineNum++;
        var searchPos = 0;
        while ((pos = line.indexOf(searchString, searchPos)) != -1) {
            src = src.substring(0, filePos+pos) + replaceString + src.substring(filePos+pos+searchString.length);
            line = line.substring(0, pos) + replaceString + line.substring(pos+searchString.length);
            replacements.push({
                line: lineNum,
                column: pos
            });
            searchPos = pos + replaceString.length;
        }
        filePos += line.length + 1;
    });

    console.log(replacements);
    map.eachMapping(function(mapping) {
        replacements.reverse().forEach(function(r) {
            if (r.line == mapping.generatedLine && mapping.generatedColumn > r.column) {
                var offs = searchString.length - replaceString.length;
                mapping.generatedColumn -= offs;
            }
        });
        mapping = {
            generated: {
                line: mapping.generatedLine,
                column: mapping.generatedColumn
            },
            original: {
                line: mapping.originalLine,
                column: mapping.originalColumn
            },
            source: mapping.source
        };
        return generator.addMapping(mapping);
    });

    writeFileSync(outFile, src, 'utf-8');
    return writeFileSync(outFile+".map", generator.toString(), 'utf-8');

}

module.exports = replace;
