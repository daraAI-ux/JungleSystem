import {Editor, Extension, Node, mergeAttributes} from '@tiptap/core';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import {Table} from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import TextAlign from '@tiptap/extension-text-align';
import {TextStyle} from '@tiptap/extension-text-style';
import Typography from '@tiptap/extension-typography';
import Underline from '@tiptap/extension-underline';
import StarterKit from '@tiptap/starter-kit';

declare const document: any;
declare const window: any;

type BootstrapConfig = {
  editable: boolean;
  html: string;
  mentionOptions?: MentionOption[];
  placeholder: string;
};

type EditorMessage =
  | {type: 'change'; html: string}
  | {type: 'pick-image'}
  | {type: 'ready'};

let editor: Editor | null = null;
let internalUpdate = false;
let mentionOptions: MentionOption[] = [];
let mentionOpen = false;
let mentionQuery = '';
let mentionHighlight = 0;

type MentionOption = {
  id: string;
  label: string;
};

const TaskMention = Node.create({
  name: 'taskMention',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,
  addAttributes() {
    return {
      'data-mention-user-id': {
        default: null,
        parseHTML: element =>
          (element as any).getAttribute('data-mention-user-id'),
      },
      label: {
        default: '',
        parseHTML: element =>
          String((element as any).textContent || '')
            .replace(/^@/, '')
            .trim(),
      },
    };
  },
  parseHTML() {
    return [{tag: 'span[data-mention-user-id]'}];
  },
  renderHTML({node, HTMLAttributes}) {
    const label = String(node.attrs.label || '').trim();
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        class: 'task-mention',
        'data-mention-user-id': node.attrs['data-mention-user-id'],
      }),
      `@${label}`,
    ];
  },
  renderText({node}) {
    const label = String(node.attrs.label || '').trim();
    return `@${label}`;
  },
});

const BlockFormatting = Extension.create({
  name: 'blockFormatting',
  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading'],
        attributes: {
          class: {
            default: null,
            parseHTML: element => (element as any).getAttribute('class'),
            renderHTML: attributes =>
              attributes.class ? {class: attributes.class} : {},
          },
          dir: {
            default: null,
            parseHTML: element => (element as any).getAttribute('dir'),
            renderHTML: attributes => (attributes.dir ? {dir: attributes.dir} : {}),
          },
          style: {
            default: null,
            parseHTML: element => (element as any).getAttribute('style'),
            renderHTML: attributes =>
              attributes.style ? {style: attributes.style} : {},
          },
        },
      },
    ];
  },
});

function send(message: EditorMessage) {
  const payload = JSON.stringify(message);
  if (window.ReactNativeWebView?.postMessage) {
    window.ReactNativeWebView.postMessage(payload);
    return;
  }
  if (window.chrome?.webview?.postMessage) {
    window.chrome.webview.postMessage(payload);
  }
}

function emitChange() {
  if (!editor || internalUpdate) {
    return;
  }
  send({type: 'change', html: editor.getHTML()});
  refreshToolbarState();
}

function chain() {
  return editor?.chain().focus();
}

function promptForLink() {
  if (!editor) {
    return;
  }
  const previous = editor.getAttributes('link').href || 'https://';
  const input = window.prompt('Masukkan URL', previous);
  if (input === null) {
    return;
  }
  const value = input.trim();
  if (!value) {
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    emitChange();
    return;
  }
  const href = /^(https?:|mailto:|tel:)/i.test(value) ? value : `https://${value}`;
  editor.chain().focus().extendMarkRange('link').setLink({href}).run();
  emitChange();
}

function promptForImage() {
  send({type: 'pick-image'});
}

function openImagePrompt() {
  const input = window.prompt('Masukkan URL gambar', 'https://');
  if (!input) {
    return;
  }
  insertImage(input, 'Gambar');
}

function insertImage(src: string, alt?: string) {
  editor?.chain().focus().setImage({src, alt: alt || 'Gambar'}).run();
  emitChange();
}

function sanitizeMentionLabel(label: string) {
  return String(label || '').replace(/[<>&"]/g, '').trim();
}

function getMentionMatch() {
  if (!editor) {
    return null;
  }
  const {from} = editor.state.selection;
  const textBefore = editor.state.doc.textBetween(
    Math.max(0, from - 80),
    from,
    '\0',
    '\0',
  );
  const match = textBefore.match(/@([^\s@]*)$/);
  if (!match) {
    return null;
  }
  return {
    from,
    query: match[1],
    triggerLength: match[0].length,
  };
}

function getFilteredMentionOptions() {
  const query = mentionQuery.trim().toLowerCase();
  if (!query) {
    return mentionOptions.slice(0, 8);
  }
  return mentionOptions
    .filter(option => option.label.toLowerCase().includes(query))
    .slice(0, 8);
}

function renderMentionMenu() {
  const menu = document.getElementById('mention-menu');
  if (!menu) {
    return;
  }
  const items = getFilteredMentionOptions();
  if (!mentionOpen || items.length === 0) {
    menu.innerHTML = '';
    menu.style.display = 'none';
    return;
  }

  menu.style.display = 'block';
  menu.innerHTML = items
    .map(
      (item, index) =>
        `<button class="mention-option${
          index === mentionHighlight ? ' active' : ''
        }" data-mention-index="${index}" type="button">@${sanitizeMentionLabel(
          item.label,
        )}</button>`,
    )
    .join('');
  menu.querySelectorAll('[data-mention-index]').forEach((button: any) => {
    button.addEventListener('mousedown', (event: any) => event.preventDefault());
    button.addEventListener('click', () => {
      const index = Number(button.getAttribute('data-mention-index') || 0);
      insertMention(items[index]);
    });
  });
}

function syncMentionState() {
  if (!editor || mentionOptions.length === 0 || !editor.isEditable) {
    mentionOpen = false;
    mentionQuery = '';
    mentionHighlight = 0;
    renderMentionMenu();
    return;
  }

  const match = getMentionMatch();
  if (!match) {
    mentionOpen = false;
    mentionQuery = '';
    mentionHighlight = 0;
    renderMentionMenu();
    return;
  }

  mentionOpen = true;
  mentionQuery = match.query;
  mentionHighlight = 0;
  renderMentionMenu();
}

function insertMention(option?: MentionOption) {
  if (!editor || !option) {
    return;
  }
  const match = getMentionMatch();
  if (!match) {
    return;
  }
  const deleteFrom = match.from - match.triggerLength;
  const label = sanitizeMentionLabel(option.label);
  editor
    .chain()
    .focus()
    .deleteRange({from: deleteFrom, to: match.from})
    .insertContent({
      type: 'taskMention',
      attrs: {
        'data-mention-user-id': option.id,
        label,
      },
    })
    .insertContent(' ')
    .run();
  mentionOpen = false;
  mentionQuery = '';
  mentionHighlight = 0;
  renderMentionMenu();
  emitChange();
}

function setMentionOptions(nextOptions?: MentionOption[]) {
  mentionOptions = Array.isArray(nextOptions)
    ? nextOptions
        .filter(
          option =>
            option &&
            typeof option.id === 'string' &&
            typeof option.label === 'string',
        )
        .map(option => ({
          id: option.id,
          label: sanitizeMentionLabel(option.label),
        }))
        .filter(option => option.id && option.label)
    : [];
  syncMentionState();
}

function setColumns(count: number) {
  const safeCount = Math.max(1, Math.min(count, 3));
  const cells = Array.from(
    {length: safeCount},
    (_, index) => `<td><p>Kolom ${index + 1}</p></td>`,
  ).join('');
  editor
    ?.chain()
    .focus()
    .insertContent(`<table><tbody><tr>${cells}</tr></tbody></table>`)
    .run();
  emitChange();
}

function getCurrentTextBlockType() {
  return editor?.isActive('heading') ? 'heading' : 'paragraph';
}

function parseStyle(style?: string) {
  return String(style || '')
    .split(';')
    .map(item => item.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((styles, item) => {
      const [key, ...valueParts] = item.split(':');
      if (key && valueParts.length > 0) {
        styles[key.trim()] = valueParts.join(':').trim();
      }
      return styles;
    }, {});
}

function stringifyStyle(styles: Record<string, string>) {
  return Object.entries(styles)
    .filter(([, value]) => Boolean(value))
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ');
}

function updateCurrentBlockAttributes(attrs: Record<string, string | null>) {
  if (!editor) {
    return;
  }
  const blockType = getCurrentTextBlockType();
  editor.chain().focus().updateAttributes(blockType, attrs).run();
  emitChange();
}

function setCurrentBlockStyle(name: string, value: string | null) {
  if (!editor) {
    return;
  }
  const blockType = getCurrentTextBlockType();
  const attrs = editor.getAttributes(blockType);
  const styles = parseStyle(attrs.style);
  if (value) {
    styles[name] = value;
  } else {
    delete styles[name];
  }
  updateCurrentBlockAttributes({style: stringifyStyle(styles) || null});
}

function adjustIndent(delta: number) {
  if (!editor) {
    return;
  }
  const blockType = getCurrentTextBlockType();
  const styles = parseStyle(editor.getAttributes(blockType).style);
  const current = Number.parseInt(styles['margin-left'] || '0', 10) || 0;
  const next = Math.max(0, current + delta);
  setCurrentBlockStyle('margin-left', next > 0 ? `${next}px` : null);
}

function setDropCap() {
  if (!editor) {
    return;
  }
  const blockType = getCurrentTextBlockType();
  const attrs = editor.getAttributes(blockType);
  const classes = String(attrs.class || '')
    .split(/\s+/)
    .filter(Boolean);
  const hasDropCap = classes.includes('drop-cap');
  const nextClasses = hasDropCap
    ? classes.filter(item => item !== 'drop-cap')
    : [...classes, 'drop-cap'];
  updateCurrentBlockAttributes({class: nextClasses.join(' ') || null});
}

function runAction(action: string, value?: string) {
  if (!editor || !editor.isEditable) {
    return;
  }

  const command = chain();
  if (!command) {
    return;
  }

  switch (action) {
    case 'bold':
      command.toggleBold().run();
      break;
    case 'italic':
      command.toggleItalic().run();
      break;
    case 'underline':
      command.toggleUnderline().run();
      break;
    case 'strike':
      command.toggleStrike().run();
      break;
    case 'paragraph':
      command.setParagraph().run();
      break;
    case 'h1':
      command.toggleHeading({level: 1}).run();
      break;
    case 'h2':
      command.toggleHeading({level: 2}).run();
      break;
    case 'h3':
      command.toggleHeading({level: 3}).run();
      break;
    case 'bullet-list':
      command.toggleBulletList().run();
      break;
    case 'ordered-list':
      command.toggleOrderedList().run();
      break;
    case 'emoji':
      command.insertContent(value || '').run();
      break;
    case 'task-list':
      command.toggleTaskList().run();
      break;
    case 'blockquote':
      command.toggleBlockquote().run();
      break;
    case 'code-block':
      command.toggleCodeBlock().run();
      break;
    case 'horizontal-rule':
      command.setHorizontalRule().run();
      break;
    case 'align-left':
      command.setTextAlign('left').run();
      break;
    case 'align-center':
      command.setTextAlign('center').run();
      break;
    case 'align-right':
      command.setTextAlign('right').run();
      break;
    case 'align-justify':
      command.setTextAlign('justify').run();
      break;
    case 'link':
      promptForLink();
      return;
    case 'image':
      promptForImage();
      return;
    case 'table':
      command.insertTable({rows: 3, cols: 3, withHeaderRow: true}).run();
      break;
    case 'columns':
      setColumns(Number(value || 1));
      return;
    case 'add-row-after':
      command.addRowAfter().run();
      break;
    case 'add-column-after':
      command.addColumnAfter().run();
      break;
    case 'delete-row':
      command.deleteRow().run();
      break;
    case 'delete-column':
      command.deleteColumn().run();
      break;
    case 'delete-table':
      command.deleteTable().run();
      break;
    case 'highlight':
      command.toggleHighlight({color: value || '#dcfce7'}).run();
      break;
    case 'color':
      command.setColor(value || '#111827').run();
      break;
    case 'clear':
      command.unsetAllMarks().clearNodes().run();
      break;
    case 'line-height':
      setCurrentBlockStyle('line-height', value && value !== 'default' ? value : null);
      return;
    case 'spacing-before':
      setCurrentBlockStyle('margin-top', value && value !== '0' ? `${value}px` : null);
      return;
    case 'spacing-after':
      setCurrentBlockStyle('margin-bottom', value && value !== '0' ? `${value}px` : null);
      return;
    case 'indent':
      adjustIndent(24);
      return;
    case 'outdent':
      adjustIndent(-24);
      return;
    case 'first-line':
      setCurrentBlockStyle('text-indent', '24px');
      return;
    case 'hanging':
      setCurrentBlockStyle('padding-left', '24px');
      setCurrentBlockStyle('text-indent', '-24px');
      return;
    case 'direction':
      updateCurrentBlockAttributes({dir: value || 'ltr'});
      return;
    case 'drop-cap':
      setDropCap();
      return;
    case 'undo':
      command.undo().run();
      break;
    case 'redo':
      command.redo().run();
      break;
    case 'hard-break':
      command.setHardBreak().run();
      break;
    default:
      return;
  }

  emitChange();
}

function refreshToolbarState() {
  if (!editor) {
    return;
  }

  document.querySelectorAll('[data-action]').forEach((button: any) => {
    const action = button.getAttribute('data-action');
    const isActive =
      action === 'bold'
        ? editor!.isActive('bold')
        : action === 'italic'
          ? editor!.isActive('italic')
          : action === 'underline'
            ? editor!.isActive('underline')
            : action === 'strike'
              ? editor!.isActive('strike')
              : action === 'h1'
                ? editor!.isActive('heading', {level: 1})
                : action === 'h2'
                  ? editor!.isActive('heading', {level: 2})
                  : action === 'h3'
                    ? editor!.isActive('heading', {level: 3})
                    : action === 'bullet-list'
                      ? editor!.isActive('bulletList')
                      : action === 'ordered-list'
                        ? editor!.isActive('orderedList')
                        : action === 'task-list'
                          ? editor!.isActive('taskList')
                          : action === 'blockquote'
                            ? editor!.isActive('blockquote')
                            : action === 'code-block'
                              ? editor!.isActive('codeBlock')
                              : false;
    button.classList.toggle('active', Boolean(isActive));
  });
}

function bindToolbar() {
  document.querySelectorAll('[data-action]').forEach((button: any) => {
    button.addEventListener('mousedown', (event: any) => event.preventDefault());
    button.addEventListener('click', () => {
      console.log(`toolbar click: ${button.getAttribute('data-action') || ''}`);
      runAction(
        button.getAttribute('data-action') || '',
        button.getAttribute('data-value') || undefined,
      );
    });
  });
}

function bindSelectControls() {
  document.querySelectorAll('[data-select-action]').forEach((select: any) => {
    select.addEventListener('change', () => {
      runAction(
        select.getAttribute('data-select-action') || '',
        select.value || undefined,
      );
      select.value = '';
    });
  });
}

function bindDropHandling() {
  const root = document.getElementById('editor-root');
  root?.addEventListener('dragover', (event: any) => event.preventDefault());
  root?.addEventListener('drop', (event: any) => {
    event.preventDefault();
    const transfer = event.dataTransfer;
    const url =
      transfer?.getData('text/uri-list') ||
      transfer?.getData('text/plain') ||
      '';
    if (!url) {
      send({type: 'pick-image'});
      return;
    }
    if (/\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(url)) {
      insertImage(url, 'Gambar');
      return;
    }
    editor?.chain().focus().setLink({href: url}).run();
    emitChange();
  });
}

function bindMentionHandling() {
  const root = editor?.view.dom as any;
  if (!root) {
    return;
  }
  root.addEventListener('keydown', (event: any) => {
    if (!mentionOpen) {
      return;
    }
    const items = getFilteredMentionOptions();
    if (items.length === 0) {
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      mentionHighlight = (mentionHighlight + 1) % items.length;
      renderMentionMenu();
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      mentionHighlight = (mentionHighlight - 1 + items.length) % items.length;
      renderMentionMenu();
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      insertMention(items[mentionHighlight]);
      return;
    }
    if (event.key === 'Escape') {
      mentionOpen = false;
      renderMentionMenu();
    }
  });
}

function createEditor(config: BootstrapConfig) {
  const element = document.getElementById('editor-root');
  if (!element) {
    return;
  }

  editor?.destroy();
  editor = new Editor({
    element,
    content: config.html,
    editable: config.editable,
    extensions: [
      StarterKit.configure({link: false}),
      Underline,
      Link.configure({
        autolink: true,
        linkOnPaste: true,
        openOnClick: false,
      }),
      Image.configure({allowBase64: true}),
      TextAlign.configure({types: ['heading', 'paragraph']}),
      Placeholder.configure({placeholder: config.placeholder}),
      Table.configure({resizable: true}),
      TableRow,
      TableHeader,
      TableCell,
      Highlight.configure({multicolor: true}),
      TextStyle,
      Color,
      TaskList,
      TaskItem.configure({nested: true}),
      Typography,
      TaskMention,
      BlockFormatting,
    ],
    onUpdate() {
      emitChange();
      syncMentionState();
    },
    onSelectionUpdate() {
      refreshToolbarState();
      syncMentionState();
    },
    onTransaction: refreshToolbarState,
  });

  setMentionOptions(config.mentionOptions);
  bindToolbar();
  bindSelectControls();
  bindDropHandling();
  bindMentionHandling();
  refreshToolbarState();
  console.log('TipTap editor created');
  send({type: 'ready'});
}

window.KolamTipTap = {
  insertImage,
  openImagePrompt,
  run: runAction,
  setMentionOptions,
  setEditable(nextEditable: boolean) {
    editor?.setEditable(Boolean(nextEditable));
    document.querySelectorAll('[data-action]').forEach((button: any) => {
      button.disabled = !nextEditable;
    });
  },
  setHTML(nextHTML: string) {
    if (!editor || editor.getHTML() === nextHTML) {
      return;
    }
    internalUpdate = true;
    editor.commands.setContent(nextHTML || '', {emitUpdate: false});
    internalUpdate = false;
    refreshToolbarState();
  },
};

window.KolamTipTapBootstrap = createEditor;
