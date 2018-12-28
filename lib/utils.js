'use babel';

import fs from 'fs';
import path from 'path';
import url from 'url';
import glob from 'glob';

const extensions = ['jpg', 'jpeg', 'png', 'gif', 'svg'];

export function getTargetScope(currentScopes, expectedScopes) {
  for (const cScope of currentScopes) {
    if (expectedScopes.indexOf(cScope) != -1) return cScope;
  }
  return null;
}

export async function parseImagePath(value, basePath) {
  let imagePath = value.trim();
  let result = [];

  if (!isLocalPath(imagePath)) {
    result.push(imagePath);
    return result;
  }

  if (path.isAbsolute(imagePath)) {
    if (fileExists(imagePath)) {
      result.push(imagePath);
    } else {
      result = await searchFiles(imagePath);
    }
    return result;
  }

  imagePath = path.resolve(basePath, imagePath);

  if (fileExists(imagePath)) {
    result.push(imagePath);
    return result;
  }

  if (!hasImageExtention(imagePath)) {
    for (let ext of extensions) {
      let newPath = `${imagePath}.${ext}`;
      if (fileExists(newPath)) {
        result.push(newPath);
      }
    }

    if (result.length) {
      return result;
    }
  }

  result = await searchFiles(
    imagePath.replace(basePath, '').replace(/(?:\.*\/)*/, '')
  );

  return result;
}

export function isLocalPath(value) {
  return (
    typeof value === 'string' &&
    !url.parse(value).hostname &&
    !/^\/\//.test(value)
  );
}

function fileExists(path) {
  try {
    return fs.statSync(path).isFile();
  } catch (err) {
    return false;
  }
}

function searchFiles(imagePath) {
  return new Promise((resolve, reject) => {
    const editor = atom.workspace.getActiveTextEditor();
    const rootPath = atom.project.relativizePath(editor.getPath())[0];
    let pattern;

    if (extensions.indexOf(imagePath.split('.').pop()) !== -1) {
      pattern = path.join(rootPath, '**', imagePath);
    } else {
      pattern = path.join(
        rootPath,
        '**',
        `${imagePath}.{${extensions.join(',')}}`
      );
    }

    glob(pattern, (err, files) => {
      if (err) reject(err);

      if (files.length > 0) {
        resolve(files);
      } else {
        reject(`Could not find a file that matches: ${pattern}`);
      }
    });
  });
}

function hasImageExtention(path) {
  return extensions.indexOf(path.split('.').pop()) !== -1;
}
