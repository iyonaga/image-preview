'use babel';

import { Emitter } from 'atom';

export default class ImagePreviewView {
  constructor() {
    this.emitter = new Emitter();

    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('image-preview');

    this.actions = document.createElement('div');
    this.actions.classList.add('actions');

    this.closeBtn = document.createElement('button');
    this.closeBtn.classList.add('btn-close', 'btn', 'btn-sm', 'icon', 'icon-x');
    this.closeBtn.addEventListener('click', ::this.onCloseBtnClick);

    this.actions.appendChild(this.closeBtn);

    this.imgContainer = document.createElement('div');
    this.imgContainer.classList.add('image-container');

    this.spinner = document.createElement('div');
    this.spinner.classList.add('spinner');
    this.imgContainer.appendChild(this.spinner);

    this.img = document.createElement('img');
    this.img.addEventListener('load', ::this.onImageLoaded);

    this.imgContainer.appendChild(this.img);

    this.element.appendChild(this.actions);
    this.element.appendChild(this.imgContainer);
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

  onCloseBtnClick() {
    this.emitter.emit('onClose');
  }

  onClose(callback) {
    this.emitter.on('onClose', callback);
  }

  onImageLoaded() {
    this.spinner.remove();
  }

  setImage(imagePath) {
    this.img.src = imagePath;
  }
}
