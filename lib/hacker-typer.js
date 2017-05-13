"use babel";

import HackerTyperView from "./hacker-typer-view";
import { CompositeDisposable } from "atom";
import net from "net";

export default {
  hackerTyperView: null,
  modalPanel: null,
  subscriptions: null,
  isVisible: false,
  letterCount: 0,
  keyHandler: null,
  server: null,
  template: "",

  activate(state) {
    console.log("activation station");
    this.hackerTyperView = new HackerTyperView(
      state.hackerTyperViewState
    );
    this.isVisible = true;
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(
      atom.commands.add("atom-workspace", {
        "hacker-typer:toggle": () => this.listenKeyboard(),
        "hacker-typer:end": () => this.activateListener()
      })
    );

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

  setTemplate(newTemplate) {
    this.template = newTemplate;
    this.letterCount = 0;
  },

  deactivate() {
    this.isVisible = false;
    this.subscriptions.dispose();
    this.hackerTyperView.destroy();
  },

  serialize() {
    return {
      hackerTyperViewState: this.hackerTyperView.serialize()
    };
  },

  listenKeyboard() {
    console.log("HackerTyper was toggled !!!!");
    let editor = atom.workspace.getActiveTextEditor();
    if (editor) {
      editorView = atom.views.getView(editor);
      // language = this.getLanguage(editor);
      // template = this.getTemplate(language);
      // template = this.template;

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

  activateListener() {
    this.isVisible = !this.isVisible;
    if (!this.isVisible) {
      editorView.removeEventListener("keydown", keyHandler);
      this.server.close();
    }
  }
};
