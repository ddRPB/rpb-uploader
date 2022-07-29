/**
 * The DICOM standard defines profile attributes for the de-identification.
 * This object provides the codes. There are small modifications in the 
 * RPB context. That is reflected in additional codes that are not part of the standard.
 * 
 */
module.exports = Object.freeze({
    // DICOM standard action codes
    D: 'D', // replace with a non-zero-length (dummy) value
    Z: 'Z', // replace with a zero-length value if the original is a zero-length value or a non-zero (dummy) value
    X: 'X', // remove
    K: 'K', // keep
    C: 'C', // clean - replace with values of similar meaning without identifying information
    U: 'U',  // replace with a non-zero length uid - internally consistent within a set of instances
    // RPB specific action codes
    KP: 'KP' // keep with prefix

})