import { createContext } from 'react'

export const PreviewSessionContext = createContext({
  isPreview: false,
  viewer: null,
})
