const events = new Map();

export default {
    event: (name, callback) => {
        const found = events.get(name);
        if (found) {
            found.push(callback);
        } else {
            events.set(name, [callback]);
        }
    },
    eventTrigger: (name, data) => {
        const stack = events.get(name);
        if (stack) {
            stack.forEach(event => event(data));
        }
    }
}