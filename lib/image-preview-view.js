'use babel';

import { Emitter } from 'atom';
import fs from 'fs';
import bytes from 'bytes';
import { isLocalPath } from './utils';

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

    this.img = document.createElement('img');
    this.img.addEventListener('load', ::this.onImageLoaded);

    this.imgContainer.append(this.spinner, this.img);

    this.imgInfo = document.createElement('div');
    this.imgInfo.classList.add('image-info');

    this.imgPath = document.createElement('div');
    this.imgPath.classList.add('image-path');
    this.imgInfo.appendChild(this.imgPath);

    this.imgSize = document.createElement('div');
    this.imgSize.classList.add('image-size');
    this.imgInfo.appendChild(this.imgSize);

    this.element.append(this.actions, this.imgContainer, this.imgInfo);
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
    this.showImageSize();
  }

  setImage(imagePath) {
    this.img.src = imagePath;
    this.imgPath.textContent = imagePath;
  }

  showImageSize() {
    const imagePath = this.img.getAttribute('src');
    let text = `${this.img.naturalWidth}x${this.img.naturalHeight}`;
    let stat;

    if (isLocalPath(imagePath)) {
      stat = fs.statSync(imagePath);
      text = `${text} ${bytes(stat.size)}`;
    }

    this.imgSize.textContent = text;
  }
}
