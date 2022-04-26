/**
 * Builder to create a (multipart/related) MimeMessage
 */
export default class MimeMessageBuilder {
    constructor(boundary) {
        this.boundary = boundary;
        this.lineBreak = '\r\n';
        this.headerString = "";
        this.bodyString = "";
        this.footerString = "";
    }

    /**
     * Creates a String that represents the header
     */
    createHeaderString() {
        this.headerString += "MIME-Version: 1.0" + this.lineBreak;
        this.headerString += 'Content-Type: multipart/related;' + this.lineBreak;
        this.headerString += 'boundary=\"' + this.boundary + '\"' + this.lineBreak;
        this.headerString += this.lineBreak;
        this.headerString += 'This is a multi-part messsage in MIME format.'
        this.headerString += this.lineBreak;
    }

    /**
     * String that finishes the message with the boundary and extra minus characters
     */
    createFooterString() {
        this.footerString += '--' + this.boundary + '--' + this.lineBreak;
    }


    /**
     * adds DICOM file content to the message
     */
    addDicomContent(dataBuffer, fileName, contentId, contentDescription) {
        this.bodyString += '\r\n' + '--' + this.boundary + this.lineBreak;
        this.bodyString += 'Content-Type: application/dicom' + this.lineBreak;

        // this.bodyString += ';\r\n' + 'id=\"DICOMDIR\"' + this.lineBreak;
        // this.bodyString += ';\r\n' + 'name=\"DicomDir\"' + this.lineBreak;
        this.bodyString += 'Content-Transfer-Encoding: BASE64' + this.lineBreak;
        this.bodyString += 'Content-Disposition: attachment' + this.lineBreak;
        // this.bodyString += ';\r\n' + 'filename=\"' + fileName + '\";' + this.lineBreak;
        if (contentId) this.bodyString += 'Content-ID: \"' + contentId + '\"' + this.lineBreak;
        if (contentDescription) this.bodyString += 'Content-Description: ' + contentDescription + this.lineBreak;
        this.bodyString += this.lineBreak;
        this.bodyString += dataBuffer.toString('base64');
        this.bodyString += this.lineBreak;
        this.bodyString += this.lineBreak;
        return this;
    }

    /**
     * Mime message with file content
     */
    build() {
        this.createHeaderString();
        this.createFooterString();
        const requestString = this.headerString + this.bodyString + this.footerString;
        return requestString;
    }

}