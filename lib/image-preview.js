'use babel';

import fs from 'fs';
import path from 'path';
import url from 'url';
import glob from 'glob';
import ImagePreviewView from './image-preview-view';
import { CompositeDisposable } from 'atom';

export default {
  imagePreviewView: null,
  subscriptions: null,

  activate() {
    this.imagePreviewView = new ImagePreviewView();

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(
      atom.commands.add('atom-text-editor', {
        'image-preview:show': () => this.showPreview()
      })
    );

    atom.contextMenu.add({
      'atom-text-editor': [
        {
          label: 'Show Image Preview',
          command: 'image-preview:show',
          shouldDisplay: () => {
            const editor = atom.workspace.getActiveTextEditor();
            const currentScopes = editor
              .getLastCursor()
              .getScopeDescriptor()
              .getScopesArray();
            const targetScope = getTargetScope(currentScopes, expectedScopes);

            return editor !== null && targetScope !== null;
          }
        }
      ]
    });
  },

  deactivate() {
    this.subscriptions.dispose();
    this.imagePreviewView.destroy();
  },

  serialize() {
    return {
      imagePreviewViewState: this.imagePreviewView.serialize()
    };
  },

  showPreview() {
    const editor = atom.workspace.getActiveTextEditor();
    const cursor = editor.getLastCursor();
    const currentScopes = cursor.getScopeDescriptor().getScopesArray();
    const targetScope = getTargetScope(currentScopes, expectedScopes);

    if (targetScope === null) return;

    const range = editor.bufferRangeForScopeAtCursor(targetScope);
    const basePath = path.dirname(editor.getPath());
    const rangeText = editor.getTextInRange(range);
    const regex = regexPatterns[targetScope];

    let result;

    if ((result = regex.exec(rangeText)) !== null) {
      parseImagePath(result[1], basePath)
        .then(imagePath => {
          this.imagePreviewView.setImage(imagePath[0]);
        })
        .catch(err => {
          atom.notifications.addWarning(err.message);
        });
    } else {
      atom.notifications.addWarning('Regex match failed.');
      return;
    }

    this.marker = editor.markBufferRange(editor.getSelectedBufferRange(), {
      invalidate: 'never'
    });

    editor.decorateMarker(this.marker, {
      type: 'overlay',
      item: this.imagePreviewView,
      avoidOverflow: false
    });

    this.imagePreviewView.onClose(() => {
      this.marker.destroy();
    });

    // const cursorBufferRow = cursor.getBufferRow();
    // const range = editor.getSelectedBufferRange();
    // editor.addSelectionForBufferRange(range);
  }
};

const expectedScopes = [
  'link.markup.md',
  'markup.underline.link.gfm',
  'meta.property-value.css',
  'meta.property-value.sass',
  'meta.property-value.scss'
];

const regexPatterns = {
  'markup.underline.link.gfm': /(.*?)(?:\s+|$)/,
  'meta.property-value.css': /\(\s*["']?(.*?)["']?\s*\)/,
  'meta.property-value.scss': /\(\s*["']?(.*?)["']?\s*\)/,
  'meta.property-value.sass': /\(\s*["']?(.*?)["']?\s*\)/
};

function getTargetScope(currentScopes, expectedScopes) {
  for (const cScope of currentScopes) {
    if (expectedScopes.indexOf(cScope) != -1) return cScope;
  }
  return null;
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

async function parseImagePath(value, basePath) {
  let imagePath = value.trim();

  if (isLocalPath(imagePath)) {
    if (path.isAbsolute(imagePath)) {
      if (!fileExists(imagePath)) {
        imagePath = await searchFiles(imagePath).catch(err => {
          throw new Error(err);
        });
      }
    } else {
      imagePath = path.resolve(basePath, imagePath);
      if (!fileExists(imagePath)) {
        imagePath = await searchFiles(
          imagePath.replace(/(?:\.*\/)*/, '')
        ).catch(err => {
          throw new Error(err);
        });
      }
    }
  }

  return typeof imagePath === 'string' ? [imagePath] : imagePath;
}
