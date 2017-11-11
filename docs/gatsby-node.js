const _ = require(`lodash`)
const path = require(`path`)
const parseFilepath = require(`parse-filepath`)
const slash = require(`slash`)

exports.createPages = async ({ graphql, boundActionCreators }) => {
  const { createPage } = boundActionCreators
  const docsTemplate = path.resolve(`src/templates/template-docs-markdown.js`)
  const result = await graphql(`
    {
      allMarkdownRemark(limit: 1000) {
        edges {
          node {
            fields {
              slug
            }
            frontmatter {
              title
            }
          }
        }
      }
    }
  `)

  result.data.allMarkdownRemark.edges.forEach(edge => {
    if (!_.get(edge, `node.fields.slug`)) return
    createPage({
      path: `${edge.node.fields.slug}`,
      component: slash(docsTemplate),
      context: {
        slug: edge.node.fields.slug
      }
    })
  })
}

// Create slugs for files.
exports.onCreateNode = ({ node, boundActionCreators, getNode }) => {
  const { createNodeField } = boundActionCreators
  let slug
  if (node.internal.type === `MarkdownRemark` && getNode(node.parent).internal.type === `File`) {
    const fileNode = getNode(node.parent)
    const parsedFilePath = parseFilepath(fileNode.relativePath)
    // Add slugs for docs pages
    if (fileNode.sourceInstanceName === `docs`) {
      if (parsedFilePath.name === `index`) {
        slug = `/`
      } else {
        slug = `/${parsedFilePath.name}/`
      }
    }
    if (slug) {
      createNodeField({ node, name: `slug`, value: slug })
    }
  }
}
