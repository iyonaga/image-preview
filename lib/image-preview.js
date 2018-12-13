'use babel';

import ImagePreviewView from './image-preview-view';
import { CompositeDisposable } from 'atom';

export default {

  imagePreviewView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.imagePreviewView = new ImagePreviewView(state.imagePreviewViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.imagePreviewView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'image-preview:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.imagePreviewView.destroy();
  },

  serialize() {
    return {
      imagePreviewViewState: this.imagePreviewView.serialize()
    };
  },

  toggle() {
    console.log('ImagePreview was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};
