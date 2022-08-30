# Bushy JS Ltd API

## Usage

### Installation
```bash
yarn
```

### Testing
```bash
yarn test
yarn test:coverage #run entire test suite and collect coverage
yarn test:watch #run chosen spec file in watch mode
```

### Development
```bash
yarn start
```

### Build
```bash
yarn build
```

## Variables
The following variables are required to run the application (and should be stored in .env file).

- CONTENTFUL_ACCESS_TOKEN
- JWT_SECRET
- LINKEDIN_CLIENT_ID
- LINKEDIN_CLIENT_SECRET
- MONGO_DB_PASSWORD

## API
The following information describes the client-server contract when using the API.

### GET /employment

Returns a list of past employers

#### Errors

| Status   | Message | 
|----------|---------|
| 503      | Contentful service is unavailable |

#### Response (200)

```typescript
interface EmploymentResponse {
  employment: Array<{
    companyName: string;
    endDate?: string;
    location: {
      lat: string;
      long: string;
    };
    responsibilities: string;
    startDate: string;
    title: string;
    url: string;
  }>;
  total: number;
}
```

### GET /projects

Returns a list of projects

#### Errors

| Status   | Message | 
|----------|---------|
| 404      | Project does not exist |
| 503      | Contentful service is unavailable |
| 503      | Database service is unavailable |

#### Response (200)

```typescript
interface ProjectsResponse {
  projects: Array<{
    client {
      name: string;
      primaryColor: string;
      logo {
        url: string;
      };
      slug: string;
    };
    commentCount: number;
    likeCount: number;
    name: string;
    slug: string;
    thumbnail {
      url: string;
    }
  }>;
  total: number;
}
```

### GET /project/:slug

Returns a single project

#### Errors

| Status   | Message | 
|----------|---------|
| 404      | Project does not exist |
| 503      | Contentful service is unavailable |
| 503      | Database service is unavailable |

#### Response (200)

```typescript
interface ProjectResponse {
  project: {
    client {
      name
      primaryColor
      logo {
        url
      };
      slug
    };
    name
    slug
    description
    gallery: {
      items: Array<{
        url: string;
      }>;
      total: string;
    };
    hero {
      url: string;
    };
    primaryTag {
      name: string;
      slug: string;
    };
    responsibilities: {
      items {
        description: string;
        icon: string;
        name: string;
      };
    };
    video {
      url: string;
    };
    year: number;
  }
}
```

### GET /sign-in

If a valid `httpOnly` token is not present on request you will be redirected to Linkedin's auth page.

#### Errors

| Status   | Message | 
|----------|---------|
| 503      | Contentful service is unavailable |
| 503      | Database service is unavailable |
| 503      | Linkedin profile service in unavailable |
| 503      | Linkedin token service in unavailable |

#### Response (200)

```typescript
interface UserResponse {
  _id: string;
  initials: string;
  name: string;
  profilePicture: string;
}
```

### GET /sign-out

`httpOnly` token will be cleared from client.

#### Response (200)

```typescript
interface SignOutResponse {
  message: 'Token destroyed'
}
```

### POST /project/:slug/comment (Protected)

#### Required
- `httpOnly` token is **required** in order to hit this endpoint (`httpOnly` token can be supplied via the `GET /sign-in` endpoint).
- `req.body.comment` of type `String`.

#### Errors

| Status   | Message | 
|----------|---------|
| 400      | Invalid request |
| 401      | Insufficient permissions |
| 404      | Project does not exist |
| 503      | Contentful service is unavailable |
| 503      | Database service is unavailable |

#### Response 

```typescript
interface CommentResponse {
  _id: string;
  author: string;
  comment: string;
  date: string;
  project: string;
}
```

### POST /project/:slug/like (Protected)

#### Required
- `httpOnly` token is **required** in order to hit this endpoint (`httpOnly` token can be supplied via the `GET /sign-in` endpoint).
- 

#### Errors

| Status   | Message | 
|----------|---------|
| 400      | Invalid request |
| 401      | Insufficient permissions |
| 403      | User has already liked project |
| 404      | Project does not exist |
| 503      | Contentful service is unavailable |
| 503      | Database service is unavailable |

#### Response 

```typescript
interface LikeResponse {
  _id: string;
  author: string;
  date: string;
  project: string;
}
```

### DELETE /project/:slug/comment/:id (Protected)

#### Required
- `httpOnly` token is **required** in order to hit this endpoint (`httpOnly` token can be supplied via the `GET /sign-in` endpoint).
- User must be the author of the `Comment` you wish to delete.

#### Errors

| Status   | Message | 
|----------|---------|
| 401      | Insufficient permissions |
| 404      | Comment does not exist |
| 503      | Contentful service is unavailable |
| 503      | Database service is unavailable |

#### Response 

```typescript
interface DeleteCommentResponse {
  message: 'Comment deleted'
}
```

### DELETE /project/:slug/like/:id (Protected)

#### Required
- `httpOnly` token is **required** in order to hit this endpoint (`httpOnly` token can be supplied via the `GET /sign-in` endpoint).
- User must be the author of the `Like` you wish to delete.

#### Errors

| Status   | Message | 
|----------|---------|
| 401      | Insufficient permissions |
| 404      | Like does not exist |
| 503      | Contentful service is unavailable |
| 503      | Database service is unavailable |

#### Response 

```typescript
interface DeleteLikeResponse {
  message: 'Like deleted'
}
```
## License
[MIT](https://choosealicense.com/licenses/mit/)