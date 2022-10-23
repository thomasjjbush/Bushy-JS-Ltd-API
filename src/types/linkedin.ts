export enum LinkedinEndpoints {
  ACCESS_TOKEN = 'https://www.linkedin.com/oauth/v2/accessToken',
  CODE = 'https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id={clientId}&redirect_uri={redirectUrl}&scope=r_liteprofile,r_emailaddress',
  CONTACT_INFO = 'https://api.linkedin.com/v2/clientAwareMemberHandles?q=members&projection=(elements*(primary,type,handle~))',
  ME = 'https://api.linkedin.com/v2/me?projection=(id,localizedFirstName,localizedLastName,profilePicture(displayImage~digitalmediaAsset:playableStreams))',
}

export interface LinkedInContactInfo {
  elements: Array<{
    handle: string;
    'handle~': {
      emailAddress?: string;
      phoneNumber?: {
        number: string;
      };
    };
    primary: boolean;
    type: 'EMAIL' | 'PHONE';
  }>;
}

export interface LinkedinUser {
  id: string;
  localizedFirstName: string;
  localizedLastName: string;
  profilePicture: {
    displayImage: string;
    'displayImage~': {
      elements: Array<{
        artifact: string;
        authorizationMethod: string;
        data: {
          'com.linkedin.digitalmedia.mediaartifact.StillImage': {
            displayAspectRatio: {
              formatted: string;
              heightAspect: number;
              widthAspect: number;
            };
            displaySize: {
              height: LinkedinProfilePictureSizes;
              uom: string;
              width: LinkedinProfilePictureSizes;
            };
            mediaType: string;
            rawCodecSpec: {
              name: string;
              type: string;
            };
            storageAspectRatio: {
              formatted: string;
              heightAspect: number;
              widthAspect: number;
            };
            storageSize: {
              height: LinkedinProfilePictureSizes;
              width: LinkedinProfilePictureSizes;
            };
          };
        };
        identifiers: [
          {
            file: string;
            identifier: string;
            identifierExpiresInSeconds: number;
            identifierType: string;
            index: number;
            mediaType: string | string;
          },
        ];
      }>;
      paging: {
        count: number;
        links: string[];
        start: number;
      };
    };
  };
}

type LinkedinProfilePictureSizes = 100 | 200 | 400 | 800;
