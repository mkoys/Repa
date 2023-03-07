const map = new Map();

const add = (key, value) => {
    map.set(key, value);
}

const get = async (key) => {
    let found = map.get(key);

    if (!found) {
        const result = await fetch(key);
        const value = await result.text();
        add(key, value);
        found = value;
    }

    return found;
}

export default { add, get };