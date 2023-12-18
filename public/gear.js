export class Component extends HTMLElement {
  constructor({ template } = {}) {
    super();

    this.behaviours = {
      text: {
        set: (element, evaluation) => (element.textContent = evaluation),
      },
      if: {
        set: (element, evaluation) =>
          (element.style.display = evaluation ? null : "none"),
      },
      value: {
        set: (element, evaluation) => {
          element.value = evaluation;
        },
        bind: {
          type: "keyup",
          listener: (event) => {
            const attribute = event.target.getAttribute("value");
            const evalString = attribute.slice(2, attribute.length - 2);
            eval(`${evalString} = "${event.target.value}"`);
          },
        },
      },
    };

    this.behaviourKeys = Object.keys(this.behaviours);
    this.stateRegex = /(this\.state(?:\.[a-zA-Z_$][0-9a-zA-Z_$]*))/gm;
    this.stateCopy = {};
    this.stateMap = new Map();
    this.state = new Proxy(this.stateCopy, {
      set: (_target, key, value) => {
        this.stateCopy[key] = value;
        const snapshot = this.stateMap.get(key);
        if (snapshot) {
          if (snapshot.subscribe) {
            snapshot.subscribe.forEach((item) => item.set(value));
          }
          this.behaviourKeys.forEach((key) => {
            snapshot[key]?.forEach((record) => {
              if (this.behaviours[key]?.set) {
                this.behaviours[key]?.set(record.target, eval(record.eval));
              }
            });
          });
        }
        return true;
      },
    });
    this.parseNode = (node) => {
      if (node.getAttribute) {
        if (node.children.length > 0) {
          for (let index = 0; index < node.children.length; index++) {
            this.parseNode(node.children[index]);
          }
        }

        this.behaviourKeys.forEach((key) => {
          const attribute = node.getAttribute(key);
          if (attribute) {
            this.evaluate(attribute, node, key);
          }
        });
      }
    };

    this.observer = new MutationObserver((mutationRecors) => {
      const mutation = mutationRecors.pop();
      switch (mutation.type) {
        case "childList":
          mutation.addedNodes.forEach((node) => this.parseNode(node));
          break;
        case "attributes":
          if (
            this.behaviourKeys.find((key) => key === mutation.attributeName)
          ) {
            if (mutation.oldValue)
              this.removeState(
                mutation.oldValue,
                mutation.target,
                mutation.attributeName,
              );
            const attributeValue = mutation.target.getAttribute(
              mutation.attributeName,
            );
            if (attributeValue && attributeValue.startsWith("{{"))
              this.evaluate(
                attributeValue,
                mutation.target,
                mutation.attributeName,
              );
          }
          break;
        default:
          break;
      }
    });
    this.shadow = this.attachShadow({ mode: "open" });
    this.observer.observe(this.shadow, {
      subtree: true,
      childList: true,
      attributeOldValue: true,
      characterDataOldValue: true,
    });
    if (template) {
      if (typeof template === "object") {
        fetch(template.url).then((blob) =>
          blob
            .text()
            .then((template) => this.initializeTemplate(parseHTML(template))),
        );
      } else {
        this.initializeTemplate(parseHTML(template));
      }
    }
  }

  initializeTemplate(template) {
    this.template = template.body.firstChild;
    this.shadow.appendChild(this.template.cloneNode(true));
  }

  subscribe(stateName, callback) {
    let snapshot = this.stateMap.get(stateName);
    if (!snapshot) snapshot = new Object();
    if (!snapshot["subscribe"]) {
      snapshot["subscribe"] = [];
    }
    snapshot["subscribe"].push({ set: callback });
    this.stateMap.set(stateName, snapshot);
    callback(this.state[stateName]);
  }

  evaluate(text, target, type) {
    const evalString = text.slice(2, text.length - 2);
    const containsState = this.stateRegex.test(text);
    if (this.behaviours[type].set) {
      this.behaviours[type]?.set(target, eval(evalString));
    }
    if (this.behaviours[type].bind) {
      target.addEventListener(
        this.behaviours[type].bind.type,
        this.behaviours[type].bind.listener,
      );
    }
    if (containsState) this.addState(evalString, target, type);
  }

  addState(evalString, target, type) {
    const stateMatches = evalString.match(this.stateRegex);
    stateMatches.forEach((state) => {
      const key = state.split(".")[2];
      let snapshot = this.stateMap.get(key);
      if (!snapshot) {
        snapshot = {};
        snapshot[type] = [];
      }
      if (!snapshot[type]) snapshot[type] = [];
      snapshot[type].push({
        target: target,
        eval: evalString,
      });
      this.stateMap.set(key, snapshot);
    });
  }

  removeState(evalString, target, type) {
    const stateMatches = evalString.match(this.stateRegex);
    if (this.behaviours[type]) {
      if (this.behaviours[type].bind) {
        target.removeEventListener(
          this.behaviours[type].bind.type,
          this.behaviours[type].bind.listener,
        );
      }
    }
    stateMatches.forEach((state) => {
      const key = state.split(".")[2];
      let snapshot = this.stateMap.get(key);
      if (!snapshot) return;
      const index = snapshot[type].findIndex((item) => item.target === target);
      snapshot[type].splice(index, 1);
      this.stateMap.set(key, snapshot);
    });
  }
}

function parseHTML(text) {
  const parser = new DOMParser();
  return parser.parseFromString(text, "text/html");
}
