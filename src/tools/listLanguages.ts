import { Tool } from '../types';

const listLanguages: Tool = () => ({
  name: 'list_languages',
  description: 'Returns all language strings available in Findadoc.',
  parameters: [],
  returns: ['English', 'French', 'Spanish']
});

export default listLanguages;