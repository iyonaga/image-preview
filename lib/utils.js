'use babel';

import fs from 'fs';
import path from 'path';
import url from 'url';
import glob from 'glob';

export function getTargetScope(currentScopes, expectedScopes) {
  for (const cScope of currentScopes) {
    if (expectedScopes.indexOf(cScope) != -1) return cScope;
  }
  return null;
}

export async function parseImagePath(value, basePath) {
  let imagePath = value.trim();

  if (isLocalPath(imagePath)) {
    if (path.isAbsolute(imagePath)) {
      if (!fileExists(imagePath)) {
        imagePath = await searchFiles(imagePath);
      }
    } else {
      imagePath = path.resolve(basePath, imagePath);
      if (!fileExists(imagePath)) {
        imagePath = await searchFiles(imagePath.replace(/(?:\.*\/)*/, ''));
      }
    }
  }

  return typeof imagePath === 'string' ? [imagePath] : imagePath;
}

function isLocalPath(value) {
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
    const pattern = path.join(rootPath, '**', imagePath);

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
