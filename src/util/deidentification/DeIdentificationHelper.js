
/**
 * Some deidentification tasks are defined for a specific range of DICOM tags. 
 * This function returns a defined String per group if the tag is part of it.
 * That helps to keep the configuration for the approriate deidentification task readable.
 */
function replaceContingentsWithMaskedNumberTag(tag) {
    if (tag.startsWith('50')) {
        return '50xxxxxx';
    }

    if (tag.startsWith('60') && tag.endsWith('3000')) {
        return '60xx3000';
    }

    if (tag.startsWith('60') && tag.endsWith('4000')) {
        return '60xx4000';
    }
    // nothing matches - return the input tag
    return tag;
}

/**
 * This function replaces all matching 'private' tags with the tag 'private'.
 * 
 * Private tags are part of the DICOM standard.
 * https://dicom.nema.org/dicom/2013/output/chtml/part05/sect_7.8.html
 */
function replacePrivateTagsWithStringPrivate(tag) {
    const group = tag.slice(0, 4);

    if (group > 7 && group % 2 == 1) {
        return 'private';
    }

    return tag;
}

export { replaceContingentsWithMaskedNumberTag, replacePrivateTagsWithStringPrivate };

