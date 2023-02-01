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

// Blog Queries
export const CREATE_BLOG = gql`
  mutation CreateBlog($description: String!, $name: String!, $template: Float) {
    createBlog(description: $description, name: $name, template: $template) {
      id
      name
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

// Article Queries
export const CREATE_ARTICLE = gql`
  mutation CreateArticle(
    $blogId: String!
    $show: Boolean!
    $version: Float!
    $articleContent: IContentType!
  ) {
    createArticle(
      blogId: $blogId
      show: $show
      version: $version
      articleContent: $articleContent
    ) {
      show
      version
      id
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
  query GetOneArticle($articleId: String!, $version: Float) {
    getOneArticle(articleId: $articleId, version: $version) {
      id
      postedAt
      show
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
  ) {
    updateArticle(
      blogId: $blogId
      show: $show
      version: $version
      articleContent: $articleContent
      articleId: $articleId
    ) {
      id
      postedAt
      show
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
