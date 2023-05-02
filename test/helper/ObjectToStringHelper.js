export function replacer(key, value) {
    switch (key) {
        case "byteArray":
        case "byteArrayParser":
        case "elements":
        case "dataset":
            return undefined;
            break;
        case "parsedParameters":
            return {
                dataType: 'Map',
                value: Array.from(value.entries()), // or with spread: value: [...value]
            };
            break;
        case "parameters":
            return {
                dataType: 'Map',
                value: Array.from(value.entries()), // or with spread: value: [...value]
            };
            break;
        default:
            return value;
    }
}

export function reviver(key, value) {
    if (typeof value === 'object' && value !== null) {
        if (value.dataType === 'Map') {
            return new Map(value.value);
        }
    }
    return value;
}