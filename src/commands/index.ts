import greet from './greet'
import invite from './invite'
import issuescreate from './issuescreate'
import issuescomment from './issuescomment'
import kick from './kick'

interface CommandRegistry {
  [key: string]: Function
}

const registry: CommandRegistry = {
  greet,
  invite,
  issuescreate,
  issuescomment,
  kick
}

export default registry
