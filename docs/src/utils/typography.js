import Typography from 'typography'
import CodePlugin from 'typography-plugin-code'
import presets from './presets'
import colors from './colors'
import {
  MOBILE_MEDIA_QUERY,
  TABLET_MEDIA_QUERY,
  MIN_DEFAULT_MEDIA_QUERY,
  MIN_LARGER_DISPLAY_MEDIA_QUERY
} from 'typography-breakpoint-constants'

const options = {
  headerFontFamily: [
    `Futura PT`,
    // 'Roboto',
    `-apple-system`,
    `BlinkMacSystemFont`,
    `Segoe UI`,
    `Roboto`,
    `Oxygen`,
    `Ubuntu`,
    `Cantarell`,
    `Fira Sans`,
    `Droid Sans`,
    `Helvetica Neue`,
    `Arial`,
    `sans-serif`
  ],
  // bodyFontFamily: [`Spectral`, `Georgia`, `Times New Roman`, `Times`, `serif`],
  bodyFontFamily: [
    `Futura PT`,
    // 'Roboto',
    `-apple-system`,
    `BlinkMacSystemFont`,
    `Segoe UI`,
    `Roboto`,
    `Oxygen`,
    `Ubuntu`,
    `Cantarell`,
    `Fira Sans`,
    `Droid Sans`,
    `Helvetica Neue`,
    `Arial`,
    `sans-serif`
  ],
  monospaceFontFamily: [`SFMono-Regular`, `Menlo`, `Monaco`, `Consolas`, `Liberation Mono`, `Courier New`, `monospace`],
  baseFontSize: `18px`,
  baseLineHeight: 1.5,
  headerLineHeight: 1.075,
  headerColor: `#26202c`,
  bodyColor: `#3d3347`,
  blockMarginBottom: 0.75,
  scaleRatio: 2,
  plugins: [new CodePlugin()],
  overrideStyles: ({ rhythm, scale }, options) => {
    return {
      'h1,h2,h4,h5,h6': {
        marginTop: rhythm(options.blockMarginBottom * 2),
        marginBottom: rhythm(options.blockMarginBottom),
        letterSpacing: `-0.0075em`
      },
      'ul, ol': {
        marginTop: rhythm(options.blockMarginBottom)
      },
      h1: {
        ...scale(4 / 5)
      },
      h3: {
        ...scale(2 / 5),
        lineHeight: 1,
        marginTop: rhythm(options.blockMarginBottom),
        marginBottom: rhythm(options.blockMarginBottom / 2)
      },
      h4: {
        ...scale(1 / 5)
      },
      h5: {
        ...scale(0)
      },
      blockquote: {
        paddingLeft: rhythm(options.blockMarginBottom),
        marginLeft: 0,
        borderLeft: `${rhythm(options.blockMarginBottom / 4)} solid ${presets.brandLighter}`
      },
      hr: {
        backgroundColor: '#eee'
      },
      'tt,code': {
        background: '#f6fafd',
        fontFamily: options.monospaceFontFamily.join(`,`),
        fontSize: `80%`,
        // Disable ligatures as they look funny w/ Space Mono as code.
        fontVariant: `none`,
        WebkitFontFeatureSettings: `"clig" 0, "calt" 0`,
        fontFeatureSettings: `"clig" 0, "calt" 0`,
        paddingTop: `0.1em`,
        paddingBottom: `0.1em`
      },
      '.gatsby-highlight': {
        background: `#f6fafd`,
        boxShadow: `inset 0 0 0 1px #e5edfa`,
        borderRadius: `${presets.radius}px`,
        padding: rhythm(options.blockMarginBottom),
        marginBottom: rhythm(options.blockMarginBottom),
        overflow: `auto`,
        WebkitOverflowScrolling: `touch`,
        position: `relative`
      },
      ".gatsby-highlight pre[class*='language-']": {
        padding: 0,
        marginTop: 0,
        marginBottom: 0,
        backgroundColor: `transparent`,
        border: 0,
        float: `left`,
        minWidth: `100%`,
        overflow: `initial`
      },
      '.gatsby-highlight pre code': {
        display: `block`,
        fontSize: `85%`,
        lineHeight: options.baseLineHeight
      },
      '.gatsby-highlight-code-line': {
        background: `#e5edfa`,
        marginRight: `${rhythm(-options.blockMarginBottom)}`,
        marginLeft: `${rhythm(-options.blockMarginBottom)}`,
        paddingRight: rhythm(options.blockMarginBottom),
        paddingLeft: `${rhythm((options.blockMarginBottom / 5) * 4)}`,
        borderLeft: `${rhythm((options.blockMarginBottom / 5) * 1)} solid ${colors.a[3]}`,
        display: `block`
      },
      '.gatsby-highlight::-webkit-scrollbar': {
        width: `5px`,
        height: `5px`
      },
      '.gatsby-highlight::-webkit-scrollbar-thumb': {
        background: '#bad4ff'
      },
      '.gatsby-highlight::-webkit-scrollbar-track': {
        background: `#e5edfa`,
        borderRadius: `0 0 ${presets.radiusLg}px ${presets.radiusLg}px`
      },
      // Target image captions. This is kind of a fragile selector...
      '.gatsby-resp-image-link + em': {
        ...scale(-1 / 5),
        lineHeight: 1.3,
        paddingTop: rhythm(3 / 8),
        marginBottom: rhythm(options.blockMarginBottom * 2),
        display: `block`,
        textAlign: `center`,
        fontStyle: `normal`,
        color: presets.calm,
        position: `relative`
      },
      '.gatsby-resp-image-link + em a': {
        fontWeight: `normal`,
        fontFamily: options.headerFontFamily.join(`,`),
        color: presets.brand
      },
      '.main-body a': {
        color: `inherit`,
        textDecoration: `none`,
        transition: `all ${presets.animation.speedFast} ${presets.animation.curveDefault}`,
        borderBottom: `1px solid ${presets.lightPurple}`,
        boxShadow: `inset 0 -2px 0px 0px ${presets.lightPurple}`,
        fontFamily: options.headerFontFamily.join(`,`),
        fontWeight: `normal`
      },
      '.post-body a': {
        fontSize: `102%`
      },
      '.main-body a:hover': {
        background: presets.lightPurple
      },
      '.main-body a.anchor': {
        color: `inherit`,
        fill: presets.brand,
        textDecoration: `none`,
        borderBottom: `none`,
        boxShadow: `none`
      },
      '.main-body a.anchor:hover': {
        background: `none`
      },
      '.main-body a.gatsby-resp-image-link': {
        boxShadow: `none`,
        borderBottom: `transparent`,
        marginTop: rhythm(options.blockMarginBottom * 2),
        marginBottom: rhythm(options.blockMarginBottom * 2)
      },
      '.main-body a.gatsby-resp-image-link:hover': {
        background: `none`,
        boxShadow: `none`
      },
      '.gatsby-highlight, .post .gatsby-resp-iframe-wrapper, .post .gatsby-resp-image-link': {
        marginLeft: rhythm(-options.blockMarginBottom),
        marginRight: rhythm(-options.blockMarginBottom)
      },
      '.gatsby-resp-image-link': {
        borderRadius: `${presets.radius}px`,
        overflow: `hidden`
      },
      '@media (max-width:634px)': {
        '.gatsby-highlight, .gatsby-resp-image-link': {
          borderRadius: 0,
          borderLeft: 0,
          borderRight: 0
        },
        '.gatsby-highlight': {
          boxShadow: `inset 0 1px 0 0 #e5edfa, inset 0 -1px 0 0 #e5edfa`
        }
      },
      [`${presets.Tablet} and (max-width:980px)`]: {
        '.has-sidebar .gatsby-highlight': {
          marginLeft: 0,
          marginRight: 0
        }
      },
      video: {
        width: `100%`,
        marginBottom: rhythm(options.blockMarginBottom)
      },
      '.twitter-tweet-rendered': {
        margin: `${rhythm(options.blockMarginBottom * 2)} auto !important`
      },
      [MOBILE_MEDIA_QUERY]: {
        // Make baseFontSize on mobile 16px.
        html: {
          fontSize: `${(16 / 16) * 100}%`
        }
      },
      [TABLET_MEDIA_QUERY]: {
        html: {
          fontSize: `${(17 / 16) * 100}%`
        }
      },
      [MIN_DEFAULT_MEDIA_QUERY]: {
        '.gatsby-highlight, .post .gatsby-resp-iframe-wrapper, .post .gatsby-resp-image-link': {
          marginLeft: rhythm(-options.blockMarginBottom * 1.5),
          marginRight: rhythm(-options.blockMarginBottom * 1.5)
        },
        '.gatsby-highlight': {
          padding: rhythm(options.blockMarginBottom * 1.5),
          marginBottom: rhythm(options.blockMarginBottom * 1.5)
        },
        '.gatsby-highlight-code-line': {
          marginRight: `${rhythm(-options.blockMarginBottom * 1.5)}`,
          marginLeft: `${rhythm(-options.blockMarginBottom * 1.5)}`,
          paddingRight: rhythm(options.blockMarginBottom * 1.5),
          paddingLeft: `${rhythm(((options.blockMarginBottom * 1.5) / 5) * 4)}`,
          borderLeftWidth: `${rhythm(((options.blockMarginBottom * 1.5) / 5) * 1)}`
        }
      },
      [MIN_LARGER_DISPLAY_MEDIA_QUERY]: {
        html: {
          fontSize: `${(21 / 16) * 100}%`
        }
      },
      '.token.comment,.token.block-comment,.token.prolog,.token.doctype,.token.cdata': {
        // color: colors.c[8]
        // color: 'slategray'
      },
      '.token.punctuation': {
        // color: colors.c[12]
        // color: '#f8f8f2'
      },
      '.token.property,.token.tag,.token.boolean,.token.number,.token.function-name,.token.constant,.token.symbol,.token.deleted': {
        // color: colors.b[9]
        // color: '#f92672'
      },
      '.token.selector,.token.attr-name,.token.string,.token.char,.token.function,.token.builtin,.token.inserted': {
        // color: colors.a[9]
        // color: '#a6e22e'
      },
      '.token.operator, .token.entity, .token.url, .token.variable': {
        // color: '#f8f8f2'
      },
      '.token.atrule, .token.attr-value, .token.keyword, .token.class-name': {
        // color: colors.b[8]
        // color: '#f92672'
      },

      '.token.comment,.token.prolog,.token.doctype,.token.cdata': {
        color: '#999988'
      },

      '.token.namespace': {
        opacity: 0.7
      },

      '.token.string,.token.attr-value': {
        color: '#e3116c'
      },

      '.token.punctuation,.token.operator': {
        color: '#393A34'
      },

      '.token.entity,.token.url,.token.symbol,.token.number,.token.boolean,.token.variable,.token.constant,.token.property,.token.regex,.token.inserted': {
        color: '#36acaa'
      },

      '.token.atrule,.token.keyword,.token.attr-name,.language-autohotkey .token.selector': {
        color: '#00a4db'
      },

      '.token.function,.token.deleted,.language-autohotkey .token.tag': {
        color: '#9a050f'
      },

      '.token.tag,.token.selector,.language-autohotkey .token.keyword': {
        color: '#00009f'
      },

      '.token.italic': {
        fontStyle: 'italic'
      }
    }
  }
}

const typography = new Typography(options)

export default typography
