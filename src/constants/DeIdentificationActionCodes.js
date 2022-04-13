module.exports = Object.freeze({
    D: 'D', // replace with a non-zero-length (dummy) value
    Z: 'Z', // replace with a zero-length value if the original is a zero-length value or a non-zero (dummy) value
    X: 'X', // remove
    K: 'K', // keep
    C: 'C', // clean - replace with values of similar meaning without identifying information
    U: 'U'  // replace with a non-zero length uid - internally consistent within a set of instances

})