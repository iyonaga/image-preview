'use babel';

import path from 'path';
import url from 'url';
import ImagePreviewView from './image-preview-view';
import { CompositeDisposable } from 'atom';

export default {

  imagePreviewView: null,
  subscriptions: null,

  activate(state) {
    this.imagePreviewView = new ImagePreviewView(state.imagePreviewViewState);

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(atom.commands.add('atom-text-editor', {
      'image-preview:show': () => this.showPreview()
    }));
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
    const editor = atom.workspace.getActiveTextEditor()
    const cursor = editor.getLastCursor()
    const currentScopes = cursor.getScopeDescriptor().getScopesArray();
    const targetScope = getTargetScope(currentScopes, expectedScopes);

    if (targetScope === null) return;

    const range = editor.bufferRangeForScopeAtCursor(targetScope);
    const basePath = path.dirname(editor.getPath());
    let imagePath = editor.getTextInRange(range);

    if (isLocalPath(imagePath) && !path.isAbsolute(imagePath)) {
      imagePath = path.resolve(basePath, imagePath);
    }

    this.imagePreviewView.open(imagePath);
  }
};

const expectedScopes = [
  'link.markup.md',
  'markup.underline.link.gfm',
  'uri.underline.link.md',
  'meta.group.braces.tex'
];

function hasScope(currentScopes, expectedScopes) {
  return currentScopes.some(i => expectedScopes.indexOf(i) != -1);
}

function getTargetScope(currentScopes, expectedScopes) {
  for (const cScope of currentScopes) {
    if (expectedScopes.indexOf(cScope) != -1) return cScope;
  }
  return null;
}

function isLocalPath(value) {
  return typeof value === 'string' && !url.parse(value).hostname && !/^\/\//.test(value)
}
