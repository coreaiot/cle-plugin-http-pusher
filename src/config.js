module.exports = {
  description: 'HTTP Pusher configurations.',
  fields: [
    {
      name: 'protocol',
      type: 'dropdown',
      description: 'Protocol',
      items: [
        {
          label: 'http',
          value: 'http',
        },
        {
          label: 'https',
          value: 'https',
        },
        {
          label: 'http2',
          value: 'http2',
        },
      ],
      value: 'http',
    },
    {
      name: 'host',
      type: 'text',
      description: 'Host',
      placeholder: 'e.g. example.com',
      value: 'localhost',
    },
    {
      name: 'port',
      type: 'number',
      description: 'Port',
      placeholder: 'e.g. 80',
      value: 80,
    },
    {
      name: 'apiPath',
      type: 'text',
      description: 'API Path',
      placeholder: 'e.g. /cle/http',
      value: '/cle/http',
    },
    {
      name: 'loginApiPath',
      type: 'text',
      description: 'Login API Path. Leave it empty if no authentication required.',
      placeholder: 'e.g. /cle/login',
      value: '/cle/login',
    },
    {
      name: 'username',
      type: 'text',
      description: 'Username',
      placeholder: 'e.g. john001',
      value: '',
    },
    {
      name: 'password',
      type: 'password',
      description: 'Password',
      value: '',
    },
    {
      name: 'refreshTokenPeriod',
      type: 'text',
      description: 'Refresh Token Period (s)',
      placeholder: 'e.g. 3600',
      value: '3600',
    },
    {
      name: 'compress',
      type: 'switch',
      description: 'Compress data using gzip',
      value: true,
    },
    {
      name: 'postOutdatedTags',
      type: 'switch',
      description: 'Post outdated tags',
      value: false,
    },
  ],
};