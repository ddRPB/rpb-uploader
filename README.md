# RPB-Uploader

The Web DICOM Upload Client is part of the [RPB Infrastructure](https://github.com/ddRPB/rpb#radiotherapy-clinical-research-it-infrastructure). It facilitates the upload of DICOM data via RESTful web services, provided by the [RPB portal](https://github.com/ddRPB/rpb/tree/master/radplanbio-portal/src/main/java/de/dktk/dd/rpb/api/v1). The documentation from user perspective can be found [here](https://rpb-doc.readthedocs.io/en/latest/pacs/pacs.html).

## Getting Started

### Prerequisits

Prerequisits to work with the uploader are the web services, provided by the RPB portal or an alternative implementation with similar functionality.

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

### Start the App

```
yarn start
```

## Deployment

After the configuration step, you can create a specific release that will be stored in the "dist" folder. Delete the content of the dist folder and run

```
yarn build-webpack
```

The generated code can be found in the "dist" folder.

## Releases

The releases are bound to a specific location. If you want to deploy the uploader individually, just generate the deployable code on your own.
