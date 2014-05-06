var
  SourceMapConsumer = require( "source-map" ).SourceMapConsumer,
  SourceMapGenerator = require( "source-map" ).SourceMapGenerator,
  fs = require( "fs" ),
  writeFileSync = fs.writeFileSync,
  readFileSync = fs.readFileSync,
  program = require( "commander" ),
  path = require('path');

function main()
{
    var mapping = JSON.parse( readFileSync(program.inMap) );
    var generator = new SourceMapGenerator({
        file: program.outFile
    });
    var map = new SourceMapConsumer( mapping );

    var searchString = program.search;
    var replaceString = program.replace;

    var pos;
    var replacements = [];
    var src = readFileSync(map.file, 'utf-8');
    var lineNum = 0;
    var filePos = 0;
    src.split('\n').forEach(function(line) {
        lineNum++;
        while ((pos = line.indexOf(searchString)) != -1) {
            src = src.substring(0, filePos+pos) + replaceString + src.substring(filePos+pos+searchString.length);
            line = line.substring(0, pos) + replaceString + line.substring(pos+searchString.length);
            replacements.push({
                line: lineNum,
                column: pos
            });
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

    writeFileSync(program.outFile, src, 'utf-8');
    return writeFileSync(program.outFile+".map", generator.toString(), 'utf-8');

}

program
  .version( require( "./package.json" ).version )
  .usage( "[options] <source-map>" )
  .option( "--in-map <path>", "path to input source map file" )
  .option( "--out-file <path>", "path to output file" )
  .option( "--search <string>", "search for this string" )
  .option( "--replace <string>", "replace with this string" )
  .parse( process.argv );

main();
