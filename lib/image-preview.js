'use babel';

import path from 'path';
import url from 'url';
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
    let imagePath;

    if ((result = regex.exec(rangeText)) !== null) {
      imagePath = result[1];

      if (isLocalPath(imagePath) && !path.isAbsolute(imagePath)) {
        imagePath = path.resolve(basePath, imagePath);
      }
    } else {
      throw new Error('Regex match failed.');
    }

    this.imagePreviewView.open(imagePath);
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
