export default class DicomUidService {

    constructor(uids, uidServiceUrl, prefix, apiKey) {
        this.uids = uids;
        this.uidServiceUrl = uidServiceUrl;
        this.prefix = prefix;
        this.apiKey = apiKey;

        this.generatedUids = [];
        this.originalUidToPseudomizedUidMap = new Map();
    }

    async requestUidsFromWebService() {
        const args = {
            headers: {
                "X-Api-Key": this.apiKey
            }
        };

        let response = await fetch(`${this.uidServiceUrl}/api/v1/pacs/uids?count=${this.uids.length}`, args);

        switch (response.status) {
            case 200:
                const jsonResponse = await response.json();
                this.generatedUids = jsonResponse.uidList;

                break;


            default:
                throw Error(`Request failed. URL: ${response.url} status: ${response.status} statustext: ${response.statusText}`);

        }
    }

    async getUidMap() {
        const errors = [];
        if (this.originalUidToPseudomizedUidMap.size === 0) {
            try {
                await this.requestUidsFromWebService();
            } catch (e) {
                errors.push(e);
            }
            if (this.uids.length <= this.generatedUids.length) {
                for (let i = 0; i < this.uids.length; i++) {
                    this.originalUidToPseudomizedUidMap.set(this.uids[i], this.generatedUids[i]);
                }
            }


        }

        if (this.originalUidToPseudomizedUidMap.size > 0) {
            return {
                dicomUidReplacements: this.originalUidToPseudomizedUidMap,
                errors: []
            };
        } else {
            errors.push("There was a problem assigning Dicom Uids.");
            return {
                dicomUidReplacements: null,
                errors: errors
            };

        }

    }
}