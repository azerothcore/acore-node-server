export default {
  naming: {
    pascalCase: false, // applied everywhere
    queries: '{name}', // applied to auto generated queries
    mutations: '{name}{type}{bulk}', // applied to auto generated mutations
    input: '{name}', // applied to all input types
    rootQueries: 'RootQueries',
    rootMutations: 'RootMutations',
    // {type} and {bulk} will be replaced with one of the following
    type: {
      create: 'Create',
      update: 'Update',
      delete: 'Delete',
      get: 'get',
      bulk: 'Bulk',
    },
  },
};
