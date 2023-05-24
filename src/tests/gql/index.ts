import { gql } from '@apollo/client/core'

// User Queries
export const CREATE_USER = gql`
  mutation createUser($email: String!, $password: String!, $nickname: String!) {
    createUser(email: $email, password: $password, nickname: $nickname) {
      id
      email
      nickname
    }
  }
`
export const GET_TOKEN = gql`
  mutation getToken($email: String!, $password: String!) {
    getToken(email: $email, password: $password) {
      token
      user {
        id
        email
        nickname
      }
    }
  }
`
export const GET_ALL_USERS = gql`
  query getAllUsers {
    getAllUsers {
      id
      email
      nickname
    }
  }
`
export const UPDATE_USER = gql`
  mutation UpdateUser(
    $lastName: String
    $firstName: String
    $avatar: String
    $description: String
    $city: String
    $email: String
    $nickname: String
  ) {
    updateUser(
      lastName: $lastName
      firstName: $firstName
      avatar: $avatar
      description: $description
      city: $city
      email: $email
      nickname: $nickname
    ) {
      id
      email
      nickname
      city
      firstName
      lastName
      description
      avatar
      createdAt
      lastLogin
    }
  }
`
export const UPDATE_USER_PASSWORD = gql`
  mutation UpdateUserPassword($newPassword: String!, $oldPassword: String!) {
    updateUserPassword(newPassword: $newPassword, oldPassword: $oldPassword) {
      id
      email
      nickname
      city
      firstName
      lastName
      description
      avatar
      createdAt
      lastLogin
    }
  }
`

// Blog Queries
export const CREATE_BLOG = gql`
  mutation CreateBlog($description: String!, $name: String!, $template: Float) {
    createBlog(description: $description, name: $name, template: $template) {
      id
      name
      slug
      description
      template
      createdAt
    }
  }
`
export const GET_ALL_BLOGS = gql`
  query GetAllBlogs {
    getAllBlogs {
      id
      name
      slug
      description
      template
      createdAt
      user {
        id
        nickname
      }
    }
  }
`

export const SUBSCRIBE_TO_A_BLOG = gql`
  mutation SubscribeToBlog($blogId: String!) {
    subscribeToBlog(blogId: $blogId) {
      id
      createdAt
      user {
        nickname
      }
      blog {
        id
        name
      }
    }
  }
`

export const UNSUBSCRIBE_TO_A_BLOG = gql`
  mutation UnsubscribeToBlog($subscribeId: String!, $blogId: String!) {
    unsubscribeToBlog(subscribeId: $subscribeId, blogId: $blogId)
  }
`

// Article Queries
export const CREATE_ARTICLE = gql`
  mutation CreateArticle(
    $blogId: String!
    $title: String!
    $show: Boolean!
    $version: Float!
    $articleContent: IContentType!
  ) {
    createArticle(
      blogId: $blogId
      title: $title
      show: $show
      version: $version
      articleContent: $articleContent
    ) {
      show
      version
      id
      title
      slug
      postedAt
      createdAt
      articleContent {
        content {
          time
          version
          blocks {
            data {
              items
              level
              style
              text
            }
            id
            type
          }
        }
        id
        version
      }
    }
  }
`

export const GET_ONE_ARTICLE = gql`
  query ($blogSlug: String!, $slug: String!, $allVersions: Boolean) {
    getOneArticle(blogSlug: $blogSlug, slug: $slug, allVersions: $allVersions) {
      id
      postedAt
      show
      slug
      title
      coverUrl
      articleContent {
        version
        id
        current
        content {
          time
          version
          blocks {
            id
            type
            data {
              text
              level
              style
              items
            }
          }
        }
      }
      version
    }
  }
`

export const UPDATE_ARTICLE = gql`
  mutation UpdateArticle(
    $blogId: String!
    $show: Boolean!
    $version: Float!
    $articleContent: IContentType!
    $articleId: String!
    $title: String!
  ) {
    updateArticle(
      blogId: $blogId
      show: $show
      version: $version
      articleContent: $articleContent
      articleId: $articleId
      title: $title
    ) {
      id
      postedAt
      show
      slug
      version
      articleContent {
        id
        current
        content {
          time
          version
          blocks {
            id
            type
            data {
              text
              level
              style
              items
            }
          }
        }
        version
      }
    }
  }
`
