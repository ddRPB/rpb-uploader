# RPB-Uploader

The Web DICOM Upload Client is part of the [RPB Infrastructure](https://github.com/ddRPB/rpb#radiotherapy-clinical-research-it-infrastructure). It facilitates the upload of DICOM data via RESTful web services, provided by the [RPB portal](https://github.com/ddRPB/rpb/tree/master/radplanbio-portal/src/main/java/de/dktk/dd/rpb/api/v1). The documentation from user perspective can be found [here](https://rpb-doc.readthedocs.io/en/latest/pacs/pacs.html).

## Getting Started for Testing

The Uploader needs corresponding web services. If you just want to try it out, there is a [rpb-uploader-basic-webservices](https://github.com/ddRPB/rpb-uploader-basic-webservices) project that provides the services for a basic interaction without installing the real RPB Portal.

Just install a [Tomcat 11](https://tomcat.apache.org/tomcat-11.0-doc/index.html). Drop the "ROOT.war" file from the latest [release](https://github.com/ddRPB/rpb-uploader-basic-webservices/releases) in "webapps" folder. Then create an additional "/uploader" in the "webapps" folder und unzip the "rpb-uploader-....zip" file from the latest [Uploader Release](https://github.com/ddRPB/rpb-uploader/releases).

Open [localhost:8080/uploader](http://localhost:8080/uploader) in your browser.

## Getting Started for Development

### Prerequisites

Prerequisites to work with the uploader are the web services, provided by the RPB portal or an alternative implementation with similar functionality.

If you do not want to start with the complex portal, you can just use the [rpb-uploader-basic-webservices](https://github.com/ddRPB/rpb-uploader-basic-webservices) project described in the [Getting Started for Development](#getting-started-for-testing) section.

During the development, you need to deal with a [same origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Same-origin_policy) of the Browser. Node-JS usually runs on port 3000, the additional Tomcat on port 8080. All network calls from the Uploader to the Portal will be reject based on that policy. There are some plugins than allow you to switch off this security feature for that specific use case.

### Clone Repository

```
git clone git@github.com:ddRPB/rpb-uploader.git
```

### Install Dependencies

```
yarn
```

### Configuration

In the current version, you need to adjust the parameters:

#### Interaction with the RPB Portal

- package.json - homepage parameter: change the URL to the location where the Uploader is deployed
- /src/index.js - rpbPortalURL: URL of the RPB portal (web interface)
- /src/index.js - rpbUploadServiceUrl : URL of the RPB portal (web services)
- /src/index.js - portalUploaderParameterLandingPageRelativeUrl : relative path of the URL (+ rpbPortalURL ) to a web page that provides parameters for the Uploader in JSON format
- /src/index.js - portalLandingPageRelativeUrl: relative path of the URL (+ rpbPortalURL ) to the the landing page where the user is redirected to after the upload process has been finished successful

#### Upload Handling

- /src/index.js - chunkSize: number of files that will be bundled to a chunk that will be uploaded within one request

#### De-Identification Configuration

- /src/index.js - deIdentificationProfileOption: array of de-identification profiles that will be applied during the upload

#### Uploader Version Number

- /src/index.js - uploaderVersion: version of the uploader that is used in the UI and the De-identification Method Attribute (0012,0063)

#### Mail Service

- /src/index.js - mailServiceEnabled - enables the usage of the portal web service that sends mail notifications

#### Skip Upload Verification

- /src/index.js - skipUploadVerification - the Uploader verifies the upload at the end with a dedicated request and fails if the count of uploaded files does not match the files that the backend returns on that request. Here it is possible to define an array of SOPClassUids that will be ignored by this specific counting.

### Start the App

```
yarn start
```

## Deployment

After the configuration step, you can create a specific release that will be stored in the "dist" folder. Delete the content of the dist folder and run

```
yarn build-webpack
```

The generated code can be found in the "dist" folder. This can be directly dropped into a folder on the web server. Probably, you would drop it into an "uploader" folder on the existing Tomcat server of the Portal and avoid the same-origin-policy problem described in the [Prerequisites](#prerequisites) section.

## Releases

The releases are bound to a specific location. If you want to deploy the uploader individually, just generate the deployable code on your own.
