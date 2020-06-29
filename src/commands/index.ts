import greet from './greet'
import invite from './invite'
import kick from './kick'

interface CommandRegistry {
  [key: string]: Function
}

const registry: CommandRegistry = {
  greet,
  invite,
  kick
}

export default registry
