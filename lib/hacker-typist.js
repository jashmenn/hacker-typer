"use babel";

import { CompositeDisposable } from "atom";
import net from "net";

export default {
  subscriptions: null,
  isGoing: false,
  letterCount: 0,
  keyHandler: null,
  server: null,
  template: "",
  originalSettings: {},
  statusBarTile: null,
  tileElement: null,
  statusBarHandler: null,

  activate(state) {
    console.log("Hacker Typist activation");

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(
      atom.commands.add("atom-workspace", {
        "hacker-typist:start": () => this.startListener(),
        "hacker-typist:end": () => this.deactivateListener()
      })
    );
  },

  setTemplate(newTemplate) {
    this.template = newTemplate;
    this.letterCount = 0;
  },

  deactivate() {
    console.log("Hacker Typist deactivate");
    this.isGoing = false;
    this.subscriptions.dispose();
  },

  startListener() {
    this.isGoing = true;

    // disable autoIndent
    this.originalSettings.autoIndent = atom.config.get(
      "editor.autoIndent"
    );
    console.log(
      "autoIndent",
      this.originalSettings.autoIndent
    );
    atom.config.set("editor.autoIndent", false);

    this.attachStatusTile();

    // start the server
    this.server = net.createServer(socket => {
      socket.write("Hacker Typist Server\r\n");

      let newCode = "";
      socket.on("data", data => {
        newCode += data.toString();
      });

      socket.on("close", () => {
        console.log("Received new code:");
        console.log(newCode);
        this.setTemplate(newCode);
      });
    });

    this.server.listen(1337, "127.0.0.1");
    console.log(
      "Listening for new template on 127.0.0.1:1337"
    );

    // listen for the server
    this.listenKeyboard();
  },

  listenKeyboard() {
    console.log("HackerTypist listenKeyboard");
    let editor = atom.workspace.getActiveTextEditor();
    if (editor) {
      editorView = atom.views.getView(editor);

      function sendKeyboardEvent(key, opts) {
        let keyEvent = atom.keymaps.constructor.buildKeydownEvent(
          key,
          opts
          // { target: document.activeElement }
        );
        return atom.keymaps.handleKeyboardEvent(keyEvent);
      }

      keyHandler = e => {
        if (this.isGoing) {
          if (
            !(e.ctrlKey ||
              e.shiftKey ||
              e.metaKey ||
              e.altKey)
          ) {
            e.preventDefault();
            e.cancelBubble = true;
          } else {
            return;
          }
          setTimeout(() => {
            let lastLetter = this.template[
              this.letterCount - 1
            ];

            let autoCompleted = [
              "(",
              "'",
              '"',
              "{",
              "[",
              "`",
              "“",
              "‘",
              "«",
              "‹"
            ];

            if (
              lastLetter &&
              !autoCompleted.includes(lastLetter)
            ) {
              // editor.delete();
            }

            if (
              this.template &&
              this.template.length > 0 &&
              this.letterCount < this.template.length
            ) {
              editor.insertText(
                this.template[this.letterCount]
              );
              this.letterCount += 1;
            }
          });
        }
      };

      editorView.addEventListener("keydown", keyHandler);
    }
  },

  deactivateListener() {
    console.log("deactivating HackerTypist listener");
    this.isGoing = false;
    editorView.removeEventListener("keydown", keyHandler);
    this.detachStatusTile();
    this.server.close();
    atom.config.set(
      "editor.autoIndent",
      this.originalSettings.autoIndent
    );
  },

  createStatusTile() {
    const element = document.createElement("div");
    element.classList.add("hacker-typist-status-tile");
    element.classList.add("inline-block");
    element.appendChild(document.createTextNode("H"));
    return element;
  },

  attachStatusTile() {
    if (this.statusBarHandler) {
      this.tileElement = this.createStatusTile();
      this.statusBarTile = this.statusBarHandler.addLeftTile(
        {
          item: this.tileElement,
          priority: 1000
        }
      );
    }
  },

  detachStatusTile() {
    if (this.statusBarTile) {
      this.statusBarTile.destroy();
    }
  },

  consumeStatusBar(statusBar) {
    this.statusBarHandler = statusBar;
  }
};
