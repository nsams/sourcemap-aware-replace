var replace = require( "./index" );
var program = require( "commander" );

program
  .version( require( "./package.json" ).version )
  .usage( "[options] <source-map>" )
  .option( "--in-map <path>", "path to input source map file" )
  .option( "--out-file <path>", "path to output file" )
  .option( "--search <string>", "search for this string" )
  .option( "--replace <string>", "replace with this string" )
  .parse( process.argv );

replace(program.inMap, program.outFile, program.search, program.replace);
