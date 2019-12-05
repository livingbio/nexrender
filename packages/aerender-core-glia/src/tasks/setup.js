const os = require('os')
const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
const assert = require('assert')

const { create, validate } = require('@nexrender/types/job')

/**
 * This task creates working directory for current job
 */
module.exports = (job, settings) => {
    /* fill default job fields */
    job = create(job)

    settings.logger.log(`[${job.uid}] setting up job...`);

    try {
        assert(validate(job) == true)
    } catch (err) {
        return Promise.reject('Error veryifing job: ' + err)
    }
    if (!job.template.outputExt) {
        throw Error('You must provide outputExt')
    }
    if (!job.template.outputExt.startsWith('.')) {
        throw Error('You must provide correct external file name')
    }

    // set default job result file name

    job.resultname = job.template.name + job.template.outputExt;

    // NOTE: for still (jpg) image sequence frame filename will be changed to result_[#####].jpg
    if (job.template.outputExt && ['jpeg', 'jpg', 'png'].indexOf(job.template.outputExt) !== -1) {
        job.resultname = job.template.name + '_[#####].' + job.template.outputExt;
        job.template.imageSequence = true;
    }


    // setup paths
    job.workpath = path.join(settings.workpath, job.uid);
    job.output = job.output || path.join(job.workpath, job.resultname);
    mkdirp.sync(job.workpath);

    settings.logger.log(`[${job.uid}] working directory is: ${job.workpath}`);

    return Promise.resolve(job)
};
