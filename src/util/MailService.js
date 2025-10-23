export default class MailService {
  constructor(mailServiceUrl = "") {
    this.mailServiceUrl = mailServiceUrl;
    this.urlPart = "/api/v1/adminmail";
  }

  setApiKey(apiKey) {
    this.apiKey = apiKey;
  }

  async sendMail(message) {
    if (this.apiKey != null && this.mailServiceUrl.length > 0) {
      const args = {
        headers: {
          "X-Api-Key": this.apiKey,
        },
      };

      const request = new Request(`${this.mailServiceUrl}/api/v1/adminmail`, {
        method: "POST",
        body: message,
        headers: {
          "X-Api-Key": this.apiKey,
        },
      });

      let response = await fetch(request);
    }
  }
}
