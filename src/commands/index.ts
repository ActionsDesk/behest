import greet from './greet'
import invite from './invite'
import issuescreate from './issuescreate'
import kick from './kick'

interface CommandRegistry {
  [key: string]: Function
}

const registry: CommandRegistry = {
  greet,
  invite,
  issuescreate,
  kick
}

export default registry
