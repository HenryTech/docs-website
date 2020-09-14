const fs = require('fs');
const path = require('path');
const { readdir } = require('fs').promises;

const { resolve } = path;

const logger = require('./utils/logger');
const { BASE_DIR } = require('./constants');

const getTitle = (item) =>
  item
    .split('/')
    .slice(-1)[0]
    .replace('.mdx', '')
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const getFrontmatter = (title) => `---
title: ${title}
template: basicDoc
---

# ${title}

`;

const getPageContent = (dir, files) =>
  files
    .map((file) => {
      const path = `${dir}/${file}`;
      // TODO: get the label from frontmatter
      const label = getTitle(file);
      return `* [${path}](${label})`;
    })
    .join('\n');

// TODO: create all links in and nested under this directory
const getFiles = async (dir) => {
  const dirents = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    dirents.map((dirent) => {
      const res = resolve(dir, dirent.name);
      // eslint-disable-next-line no-unused-vars
      return dirent.isDirectory() ? getFiles(res) : res;
    })
  );
  // console.log(files.flat())
  return files.flat();
};

const createIndexPage = (dir) => {
  const title = getTitle(dir);
  const fullDir = path.join(BASE_DIR, dir);

  fs.readdir(fullDir, async (err, files) => {
    if (err) logger.error(`Unabled to read files for ${dir}.`);

    const fileName = `${fullDir}/index.mdx`;
    const content =
      getFrontmatter(title) + getPageContent(fullDir, await getFiles(fullDir));
    fs.writeFile(fileName, content, (err) => {
      if (err) logger.error(`Could not create ${fileName}.`);
    });
  });
};

const createIndexPages = () => {
  // TODO: recursively loop over folders
  // TODO: if a folder does not have an index page, create one
  createIndexPage('foo-stuff');
};

module.exports = createIndexPages;

// TODO: remove this (just used for easier testing)
createIndexPages();
