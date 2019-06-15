import React from 'react'
import Helmet from 'react-helmet'
import graphql from 'graphql-request'
import MarkdownPageFooter from '../components/markdown-page-footer'
import Container from '../components/container'

class DocsTemplate extends React.Component {
  render() {
    const page = this.props.data.markdownRemark
    return (
      <Container>
        <Helmet>
          <title>{page.frontmatter.title}</title>
          <meta name='description' content={page.excerpt} />
          <meta name='og:description' content={page.excerpt} />
          <meta name='og:title' content={page.frontmatter.title} />
          <meta name='og:type' content='article' />
        </Helmet>
        <h1 css={{ marginTop: 0 }}>{page.frontmatter.title}</h1>
        <div
          dangerouslySetInnerHTML={{
            __html: page.html
          }}
        />
        <MarkdownPageFooter page={page} />
      </Container>
    )
  }
}

export default DocsTemplate

export const pageQuery = graphql`
  query TemplateDocsMarkdown($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      excerpt
      timeToRead
      frontmatter {
        title
      }
      ...MarkdownPageFooter
    }
  }
`
