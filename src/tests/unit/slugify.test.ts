import slugify from 'slugify'
import { slugifyOptions } from '../../config/slugifyOptions'

const testStrings = [
  'Voyage en chine',
  "L'éclate à Bali",
  'Un dimanche à Bamako',
  'Mon weekend à Montréal',
  'Je suis allé visiter Mâcon pour vous',
]

const slugRegex = new RegExp(
  `^[a-z0-9]+(?:-[a-z0-9]+)*$`,
  slugifyOptions.strict ? 'i' : ''
)

describe.only('Test slugify options', () => {
  it.each(testStrings)('should return a slug', (input) => {
    const slug = slugify(input, slugifyOptions)
    expect(slug).toMatch(slugRegex)
  })
})
