"use babel";

import HackerTyperView from "./hacker-typer-view";
import { CompositeDisposable } from "atom";
import net from "net";

export default {
  hackerTyperView: null,
  subscriptions: null,
  isVisible: false,
  letterCount: 0,
  keyHandler: null,
  server: null,
  template: "",
  originalSettings: {},

  activate(state) {
    console.log("activation station");
    this.hackerTyperView = new HackerTyperView(
      state.hackerTyperViewState
    );
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
    this.isVisible = false;
    this.subscriptions.dispose();
    this.hackerTyperView.destroy();
  },

  serialize() {
    return {
      hackerTyperViewState: this.hackerTyperView.serialize()
    };
  },

  startListener() {
    this.isVisible = true;

    // disable autoIndent
    this.originalSettings.autoIndent = atom.config.get(
      "editor.autoIndent"
    );
    console.log(
      "autoIndent",
      this.originalSettings.autoIndent
    );
    atom.config.set("editor.autoIndent", false);

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
    console.log("HackerTyper listenKeyboard");
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
        if (this.isVisible) {
          if (!(e.ctrlKey || e.shiftKey || e.metaKey)) {
            e.preventDefault();
            e.cancelBubble = true;
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
    console.log("deactivating HackerTyper listener");
    this.isVisible = false;
    editorView.removeEventListener("keydown", keyHandler);
    this.server.close();
    atom.config.set(
      "editor.autoIndent",
      this.originalSettings.autoIndent
    );
    console.log(
      "autoIndent",
      this.originalSettings.autoIndent
    );
  }

  // activateListener() {
  //   this.isVisible = true;
  // }
};
