'use babel';

export default class ImagePreviewView {
  marker = null;

  constructor(serializedState) {
    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('image-preview');

    this.actions = document.createElement('div');
    this.actions.classList.add('actions')

    this.closeBtn = document.createElement('button');
    this.closeBtn.classList.add('btn-close', 'btn', 'btn-sm', 'icon', 'icon-x');
    this.closeBtn.addEventListener('click', ::this.close);

    this.actions.appendChild(this.closeBtn);

    this.imgContainer = document.createElement('div');
    this.imgContainer.classList.add('image-container');

    this.img = document.createElement('img');

    this.imgContainer.appendChild(this.img);

    this.element.appendChild(this.actions);
    this.element.appendChild(this.imgContainer)
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

  open() {
    const editor = atom.workspace.getActiveTextEditor()
    // const cursor = editor.getLastCursor()
    const range = editor.getSelectedBufferRange();
    this.marker = editor.markBufferRange(range, { invalidate: 'never' });

    editor.decorateMarker(this.marker, {
      type: 'overlay',
      // class: 'my-line-class',
      item: this,
    });
  }

  close() {
    this.marker.destroy();
  }
}
