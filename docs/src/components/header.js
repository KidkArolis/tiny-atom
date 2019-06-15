import React from 'react'
import Link from 'gatsby-link'
import GithubIcon from 'react-icons/lib/go/mark-github'
import typography, { rhythm, scale } from '../utils/typography'
import presets from '../utils/presets'

const navItemStyles = {
  ...scale(-1 / 3),
  boxSizing: `border-box`,
  display: `inline-block`,
  color: '#555',
  padding: `${rhythm(1)}`,
  position: `fixed`,
  top: 0,
  right: 0,
  '&:hover': {
    opacity: 0.8
  }
}

export default ({ pathname }) => {
  return (
    <div
      role='navigation'
      css={{
        borderBottom: `1px solid ${presets.veryLightPurple}`,
        height: presets.headerHeight,
        zIndex: `1`,
        backgroundColor: `rgba(255,255,255,0)`,
        borderBottomColor: `transparent`,
        width: '100%',
        [presets.Tablet]: {
          width: rhythm(10),
          borderRight: '1px solid #eee',
          position: `fixed`
        },
        [presets.Desktop]: {
          width: rhythm(12)
        }
      }}
    >
      <div
        css={{
          margin: `0 auto`,
          paddingLeft: rhythm(3 / 4),
          paddingRight: rhythm(3 / 4),
          fontFamily: typography.options.headerFontFamily.join(`,`),
          display: `flex`,
          alignItems: `center`,
          justifyContent: 'center',
          width: `100%`,
          height: `100%`
        }}
      >
        <Link
          to='/'
          css={{
            color: `inherit`,
            display: `block`,
            textDecoration: `none`,
            marginRight: rhythm(0.5)
          }}
        >
          {
            <div
              css={{
                display: `block`,
                height: rhythm(1.2),
                width: rhythm(1.2),
                margin: '0.5em auto 0 auto'
              }}
            >
              <svg
                width='32px'
                height='31px'
                viewBox='0 0 62 61'
                version='1.1'
                xmlns='http://www.w3.org/2000/svg'
                xmlnsXlink='http://www.w3.org/1999/xlink'
              >
                <defs>
                  <linearGradient x1='50%' y1='2.46332908%' x2='50%' y2='100%' id='linearGradient-1'>
                    <stop stopColor='#01146C' offset='0%' />
                    <stop stopColor='#0A035A' offset='100%' />
                  </linearGradient>
                </defs>
                <g id='Page-1' stroke='none' strokeWidth='1' fill='none' fillRule='evenodd'>
                  <g id='Group'>
                    <path
                      d='M30,50 C35.4422439,50 39.9615609,47.0612656 43.4254398,43.3945605 C46.6404057,39.9913433 49,36.0511664 49,31 C49,24.4047635 45.9285497,19.1959534 40.3092466,15.2825939 C37.3336642,13.2103576 33.8981737,12 30,12 C19.5065898,12 11,20.5065898 11,31 C11,34.084436 11.3578428,37.6754553 12.662216,40.2509845 C15.7953877,46.4375385 22.5910257,50 30,50 Z'
                      id='Oval-4'
                      stroke='#200A9D'
                      strokeWidth='4'
                    />
                    <path
                      d='M31.3222493,60.9964308 C37.6207451,60.9964308 42.4741099,58.4243494 47.143249,55.2450661 C48.8670682,54.071293 52.9414184,49.960632 54.4214686,48.393918 C59.5159534,43.0011273 61.429944,38.438249 61.429944,30.4340924 C61.429944,27.2719174 60.6973053,22.4422357 59.950281,19.9490221 C58.2284074,14.2022235 54.8174291,11.9726221 48.6072449,7.64776489 C43.8920909,4.36406717 37.4993558,0.326397696 31.3222493,0.326397696 C27.702593,0.326397696 24.2032087,0.247159715 21.0670749,1.18947101 C12.2720141,3.83211496 5.76947353,10.6447305 3.12760103,19.9490221 C2.38397246,22.5679741 0.286891654,30.2904459 0.286891654,33.1477457 C0.286891654,38.0353908 1.78159769,41.0121225 3.84852773,45.0933461 C5.47269423,48.300318 9.67809643,52.0879655 16.4647344,56.4562886 C20.0307014,58.4993126 22.681858,59.7719762 24.4182041,60.2742794 C26.7030071,60.9352444 29.4594469,60.9964308 31.3222493,60.9964308 Z'
                      id='Oval-4'
                      fill='#4FF9A3'
                    />
                    <path
                      d='M31,48.0223908 C36.4422439,48.0223908 40.9615609,46.0612656 44.4254398,42.3945605 C47.6404057,38.9913433 50,35.0511664 50,30 C50,23.4047635 46.9285497,18.1959534 41.3092466,14.2825939 C38.3336642,12.2103576 34.8981737,11 31,11 C23.1779923,11 17.406584,15.28153 14.4929946,22.0344883 C13.4979342,24.3407849 12,27.3285974 12,30 C12,33.084436 12.3578428,36.6754553 13.662216,39.2509845 C16.7953877,45.4375385 23.5910257,48.0223908 31,48.0223908 Z'
                      id='Oval-4'
                      stroke='url(#linearGradient-1)'
                      strokeWidth='5'
                      fill='#FFFFFF'
                    />
                  </g>
                </g>
              </svg>
            </div>
          }
          <h1
            css={{
              ...scale(2 / 5),
              display: `block`,
              margin: '0.5em auto'
            }}
          >
            Tiny Atom
          </h1>
        </Link>
        <div
          css={{
            position: 'absolute',
            top: 0,
            right: '16px',
            [presets.Phablet]: {
              marginLeft: `auto`
            }
          }}
        >
          <a href='https://github.com/QubitProducts/tiny-atom' title='Github' css={navItemStyles}>
            <GithubIcon style={{ verticalAlign: `text-top` }} />
          </a>
        </div>
      </div>
    </div>
  )
}
