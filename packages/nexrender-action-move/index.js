const fs = require("fs");
const { name } = require("./package.json");
const path = require("path");
const mv = require("mv");

module.exports = (job, settings, { input, output }, type) => {
    if (type != "postrender") {
        throw new Error(
            `Action ${name} can be only run in postrender mode, you provided: ${type}.`
        );
    }

    /* check if input has been provided */
    input = input || job.output;

    /* fill absolute/relative paths */
    if (!path.isAbsolute(input)) input = path.join(job.workpath, input);
    if (!path.isAbsolute(output)) output = path.normalize(output);

    /* output is a directory, save to input filename */
    if (path.dirname(output) === output) {
        output = path.join(output, path.basename(input));
    }

    /* plain asset stream copy */
    // const rd = fs.createReadStream(input)
    // const wr = fs.createWriteStream(output)

    return new Promise(function(resolve, reject) {
        mv(input, output, function(err) {
            if (err) {
                throw err;
            }
            resolve(job);
        });
    });
};
