'use babel';

export default class ImagePreviewView {
  maker = null;

  constructor(serializedState) {
    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('image-preview');

    this.closeBtn = document.createElement('div');
    this.closeBtn.classList.add('btn-close');

    this.closeBtn.addEventListener('click', () => {
      this.marker.destroy();
    })

    this.element.appendChild(this.closeBtn);
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
}
