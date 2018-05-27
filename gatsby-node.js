const path = require(`path`);
const { createFilePath } = require(`gatsby-source-filesystem`);

exports.onCreateNode = ({ node, getNode, boundActionCreators }) => {
  const { createNodeField } = boundActionCreators
  if (node.internal.type === 'MarkdownRemark') {
  	const blogSlug = createFilePath({ node, getNode, basePath: 'pages/blog' });
    const projectSlug = createFilePath({ node, getNode, basePath: 'pages/projects' });
    createNodeField({
      node,
      name: `projectSlug`,
      value: projectSlug,
    });
    createNodeField({
      node,
      name: `blogSlug`,
      value: blogSlug,
    });
  }
};

exports.createProjectPages= ({ graphql, boundActionCreators }) => {
  const { createPage } = boundActionCreators
  return new Promise((resolve, reject) => {
    graphql(`
      {
        allMarkdownRemark {
          edges {
            node {
              fields {
                projectSlug
              }
            }
          }
        }
      }
    `
).then(result => {
      console.log(JSON.stringify(result, null, 4))
      resolve()
    })
  })
};