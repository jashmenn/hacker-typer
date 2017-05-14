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
        "hacker-typist:server": () =>
          this.controlKeysWithServer(),
        "hacker-typist:paste": () =>
          this.controlKeysWithPaste(),
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

  controlKeysWithServer() {
    this.startGoing(() => {
      this.startServer();
    });
  },

  controlKeysWithPaste() {
    console.log("control keys with paste");
    let setTemplateFromClipboard = () => {
      let newCode = atom.clipboard.read();
      console.log("Received new code:");
      console.log(newCode);
      this.setTemplate(newCode);
    };

    if (this.isGoing) {
      setTemplateFromClipboard();
    } else {
      this.startGoing(() => {
        setTemplateFromClipboard();
      });
    }
  },

  startGoing(how) {
    if (this.isGoing) {
      return;
    }
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
    how();
    this.listenKeyboard();
  },

  startServer() {
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
          if (e.key === "Escape") {
            this.deactivateListener();
            return;
          }

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

            // deactivating after you've finished the
            // template _sounds_ like a good idea, but the
            // problem is if you try it, you'll find you
            // type gibberish at the end of every template
            // so, in fact, an explicit exit is better
            // if (this.letterCount >= this.template.length) {
            //   this.deactivateListener();
            //   return;
            // }

            if (
              this.template &&
              this.template.length > 0 &&
              this.letterCount < this.template.length
            ) {
              editor.insertText(
                this.template[this.letterCount]
              );
              this.letterCount += 1;

              // auto-consume (or emit, rather) whitespace.
              // this gives the appearance that auto-indent
              // is still working
              while (
                this.letterCount < this.template.length &&
                this.template[this.letterCount].match(/\s/m)
              ) {
                editor.insertText(
                  this.template[this.letterCount]
                );
                this.letterCount += 1;
              }
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

    if (this.server) {
      this.server.close();
    }

    // for whatever reason, this doesn't really work
    // atom.config.set(
    //   "editor.autoIndent",
    //   this.originalSettings.autoIndent
    // );
    atom.config.set("editor.autoIndent", true);
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
