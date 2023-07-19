export interface IContentBlock {
  id: string
  type: string
  data: {
    text?: string
    level?: number
    style?: string
    items?: string[]
  }
}

export interface IContent {
  time: number
  blocks: IContentBlock[]
  version: string
}
export interface IContext {
  userFromToken?: {
    userId: string
    email: string
  }
}