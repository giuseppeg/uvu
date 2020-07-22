(async function () {
  let { exec, QUEUE } = require('.');

  // TODO: mjs vs js file
  globalThis.UVU_DEFER = 1;
  suites.forEach((x, idx) => {
    globalThis.UVU_INDEX = idx;
    QUEUE.push([x.name]);
    require(x.file); // auto-add to queue
  });

  const result = await exec(opts.bail);
  process.stdout.write(JSON.stringify(result));
}());
