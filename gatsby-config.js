module.exports = {
	siteMetadata: {
	    title: '',
	  },
    plugins: ['gatsby-plugin-react-helmet', {
        resolve: `gatsby-plugin-typography`,
        options: {
            pathToConfigModule: `src/utils/typography.js`,
        },
    },'gatsby-plugin-sass',
    'gatsby-plugin-glamor',
    'gatsby-transformer-remark',  
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `src`,
        path: `${__dirname}/src/`,
      },
    },],
};