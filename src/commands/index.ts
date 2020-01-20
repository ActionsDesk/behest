import greet from './greet'
import invite from './invite'

interface CommandRegistry {
  [key: string]: Function
}

const registry: CommandRegistry = {
  greet,
  invite
}

export default registry
